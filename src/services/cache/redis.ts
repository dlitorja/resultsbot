import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { redisOperations } from '../../utils/metrics.js';

/**
 * Redis client using Upstash REST API
 * Since we're using Upstash, we'll use their REST API via fetch
 */

interface RedisResponse<T = unknown> {
  result: T;
  error?: string;
}

class RedisClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = env.UPSTASH_REDIS_URL;
    this.token = env.UPSTASH_REDIS_TOKEN;
  }

  private async execute<T = unknown>(command: string[]): Promise<T | null> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/${command.join('/')}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const data = (await response.json()) as RedisResponse<T>;

      if (data.error) {
        throw new Error(data.error);
      }

      redisOperations.inc({ operation: command[0].toLowerCase(), status: 'success' });
      return data.result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({ error, command, duration }, 'Redis operation failed');
      redisOperations.inc({ operation: command[0].toLowerCase(), status: 'error' });
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    return this.execute<string>(['GET', key]);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<string | null> {
    if (ttlSeconds) {
      return this.execute<string>(['SET', key, value, 'EX', ttlSeconds.toString()]);
    }
    return this.execute<string>(['SET', key, value]);
  }

  async del(key: string): Promise<number | null> {
    return this.execute<number>(['DEL', key]);
  }

  async exists(key: string): Promise<number | null> {
    return this.execute<number>(['EXISTS', key]);
  }

  async incr(key: string): Promise<number | null> {
    return this.execute<number>(['INCR', key]);
  }

  async decr(key: string): Promise<number | null> {
    return this.execute<number>(['DECR', key]);
  }

  async expire(key: string, seconds: number): Promise<number | null> {
    return this.execute<number>(['EXPIRE', key, seconds.toString()]);
  }

  async ttl(key: string): Promise<number | null> {
    return this.execute<number>(['TTL', key]);
  }

  /**
   * Get and parse JSON value
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (error) {
      logger.error({ error, key }, 'Failed to parse JSON from Redis');
      return null;
    }
  }

  /**
   * Set JSON value
   */
  async setJSON(key: string, value: unknown, ttlSeconds?: number): Promise<string | null> {
    try {
      const jsonString = JSON.stringify(value);
      return this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      logger.error({ error, key }, 'Failed to stringify JSON for Redis');
      return null;
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const result = await this.exists(key);
    return result === 1;
  }
}

export const redis = new RedisClient();

/**
 * Test Redis connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const testKey = 'test:connection';
    const testValue = 'ok';

    await redis.set(testKey, testValue, 10);
    const result = await redis.get(testKey);

    if (result === testValue) {
      logger.info('✅ Redis connection successful');
      await redis.del(testKey);
      return true;
    }

    logger.error('Redis connection test failed: value mismatch');
    return false;
  } catch (error) {
    logger.error({ error }, 'Redis connection test failed');
    return false;
  }
}


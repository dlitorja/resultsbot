/**
 * Mock Redis client for testing
 */

import { vi } from 'vitest';

export function createMockRedisClient() {
  const storage = new Map<string, string>();

  return {
    get: vi.fn(async (key: string) => {
      return storage.get(key) || null;
    }),
    set: vi.fn(async (key: string, value: string, ttl?: number) => {
      storage.set(key, value);
      return 'OK';
    }),
    del: vi.fn(async (key: string) => {
      storage.delete(key);
      return 1;
    }),
    exists: vi.fn(async (key: string) => {
      return storage.has(key) ? 1 : 0;
    }),
    expire: vi.fn(async (key: string, seconds: number) => {
      return 1;
    }),
    ttl: vi.fn(async (key: string) => {
      return 3600; // Default 1 hour
    }),
    keys: vi.fn(async (pattern: string) => {
      return Array.from(storage.keys()).filter((key) =>
        key.includes(pattern.replace('*', ''))
      );
    }),
    flushall: vi.fn(async () => {
      storage.clear();
      return 'OK';
    }),
    // Helper for tests
    _storage: storage,
  };
}


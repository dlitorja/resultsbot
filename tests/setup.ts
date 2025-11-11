/**
 * Vitest global setup file
 * Runs before all tests
 */

import { vi } from 'vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DISCORD_TOKEN = 'test_discord_token';
process.env.DISCORD_CLIENT_ID = 'test_client_id';
process.env.DISCORD_GUILD_ID = 'test_guild_id';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_KEY = 'test_supabase_key';
process.env.UPSTASH_REDIS_URL = 'https://test.upstash.io';
process.env.UPSTASH_REDIS_TOKEN = 'test_redis_token';
process.env.SAM_USER_ID = '123456789';
process.env.JORDAN_USER_ID = '987654321';
process.env.JOB_CHANNEL_ID = '111111111';
process.env.PROMETHEUS_PORT = '9090';
process.env.DEFAULT_TIMEZONE = 'America/Chicago';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};


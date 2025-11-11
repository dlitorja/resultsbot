import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config();

/**
 * Environment variable schema with Zod validation
 * Ensures all required variables are present at startup
 */
const envSchema = z.object({
  // Discord Configuration
  DISCORD_TOKEN: z.string().min(1, 'Discord token is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'Discord client ID is required'),
  DISCORD_GUILD_ID: z.string().min(1, 'Discord guild ID is required'),

  // Supabase Configuration
  SUPABASE_URL: z.string().url('Supabase URL must be valid'),
  SUPABASE_KEY: z.string().min(1, 'Supabase key is required'),

  // Redis Configuration
  UPSTASH_REDIS_URL: z.string().url('Redis URL must be valid'),
  UPSTASH_REDIS_TOKEN: z.string().min(1, 'Redis token is required'),

  // Monitoring
  SENTRY_DSN: z.string().url('Sentry DSN must be valid').optional(),

  // Job Posting - Adzuna API
  ADZUNA_APP_ID: z.string().optional(),
  ADZUNA_APP_KEY: z.string().optional(),
  JOB_CHANNEL_ID: z.string().optional(),

  // Job Posting - The Muse API
  THEMUSE_API_KEY: z.string().optional(),

  // User IDs for specific features
  SAM_USER_ID: z.string().optional(),
  JORDAN_USER_ID: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Grafana Cloud (for metrics forwarding)
  GRAFANA_PROMETHEUS_URL: z.string().url().optional(),
  GRAFANA_PROMETHEUS_USERNAME: z.string().optional(),
  GRAFANA_CLOUD_API_KEY: z.string().optional(),

  // Optional
  PROMETHEUS_PORT: z.string().default('9090'),
  DEFAULT_TIMEZONE: z.string().default('America/Chicago'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates and returns environment variables
 * Exits process if validation fails
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n📝 Please check your .env.local file against .env.example');
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();


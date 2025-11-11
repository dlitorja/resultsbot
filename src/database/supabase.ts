import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Supabase client for database operations
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
  auth: {
    persistSession: false,
  },
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('birthdays').select('count').limit(0);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "relation does not exist" which is fine for testing
      logger.error({ error }, 'Database connection test failed');
      return false;
    }
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection test failed');
    return false;
  }
}

/**
 * Database type definitions
 */

export interface Birthday {
  id: number;
  user_id: string;
  birth_date: string;
  birth_year?: number;
  timezone: string;
  created_at: string;
}

export interface RandomTag {
  id: number;
  user_id: string;
  month: string;
  target_count: number;
  current_count: number;
  last_tagged_at?: string;
}

export interface JobPosting {
  id: number;
  external_id: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  description?: string;
  posted_at: string;
  created_at: string;
}


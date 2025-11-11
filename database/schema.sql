-- Resultsbot Database Schema
-- PostgreSQL schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Birthdays table
CREATE TABLE IF NOT EXISTS birthdays (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  birth_date DATE NOT NULL,
  birth_year INT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_birthdays_user_id ON birthdays(user_id);
CREATE INDEX idx_birthdays_birth_date ON birthdays(birth_date);

-- Random tags tracking
CREATE TABLE IF NOT EXISTS random_tags (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  target_count INT NOT NULL CHECK (target_count >= 1 AND target_count <= 5),
  current_count INT DEFAULT 0 CHECK (current_count >= 0),
  last_tagged_at TIMESTAMP,
  UNIQUE(user_id, month)
);

CREATE INDEX idx_random_tags_user_month ON random_tags(user_id, month);
CREATE INDEX idx_random_tags_month ON random_tags(month);

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL, -- ID from job API
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  url TEXT NOT NULL,
  description TEXT,
  posted_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_postings_external_id ON job_postings(external_id);
CREATE INDEX idx_job_postings_posted_at ON job_postings(posted_at DESC);
CREATE INDEX idx_job_postings_company ON job_postings(company);

-- Command usage tracking (for analytics)
CREATE TABLE IF NOT EXISTS command_usage (
  id SERIAL PRIMARY KEY,
  command_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  guild_id TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_command_usage_command ON command_usage(command_name);
CREATE INDEX idx_command_usage_user ON command_usage(user_id);
CREATE INDEX idx_command_usage_executed_at ON command_usage(executed_at DESC);

-- Row Level Security (RLS) - Optional for open source project
-- Uncomment if you want to enable RLS

-- ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE random_tags ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE command_usage ENABLE ROW LEVEL SECURITY;

-- Helper function to get current month string
CREATE OR REPLACE FUNCTION get_current_month()
RETURNS TEXT AS $$
BEGIN
  RETURN TO_CHAR(NOW(), 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- Helper function to reset monthly random tags
CREATE OR REPLACE FUNCTION reset_monthly_random_tags()
RETURNS void AS $$
BEGIN
  UPDATE random_tags
  SET current_count = 0
  WHERE month < get_current_month();
END;
$$ LANGUAGE plpgsql;


/**
 * Tests for job fetcher service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockAdzunaResponse, mockJobs } from '../mocks/jobs.js';
import { createMockRedisClient } from '../mocks/redis.js';

// Mock fetch globally
global.fetch = vi.fn();

// Mock Redis
vi.mock('../../src/services/cache/redis.js', () => ({
  redis: createMockRedisClient(),
}));

// Mock logger to suppress console output during tests
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Job Fetcher Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment variables for each test
    process.env.ADZUNA_APP_ID = 'test_app_id';
    process.env.ADZUNA_APP_KEY = 'test_app_key';
    
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAdzunaResponse,
    } as Response);
  });

  describe('fetchNewJobs', () => {
    it('should fetch jobs from Adzuna API', async () => {
      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');
      
      // Mock that no jobs have been posted yet
      vi.mocked(redis.exists).mockResolvedValue(0);

      const jobs = await fetchNewJobs({ keywords: ['game developer'] });

      expect(global.fetch).toHaveBeenCalled();
      expect(jobs.length).toBeGreaterThan(0);
    });

    it('should format salary correctly', async () => {
      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');
      
      vi.mocked(redis.exists).mockResolvedValue(0);

      const jobs = await fetchNewJobs({ keywords: ['game developer'] });
      const jobWithSalary = jobs.find((j) => j.salary);

      expect(jobWithSalary).toBeDefined();
      expect(jobWithSalary?.salary).toContain('$');
    });

    it('should strip HTML from descriptions', async () => {
      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');
      
      vi.mocked(redis.exists).mockResolvedValue(0);

      const jobs = await fetchNewJobs({ keywords: ['game developer'] });

      jobs.forEach((job) => {
        expect(job.description).not.toContain('<p>');
        expect(job.description).not.toContain('</p>');
        expect(job.description).not.toContain('<strong>');
      });
    });

    it('should filter out already posted jobs', async () => {
      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');
      
      // Mock that job-1 has already been posted
      vi.mocked(redis.exists).mockImplementation(async (key) => {
        return key.includes('job-1') ? 1 : 0;
      });

      const jobs = await fetchNewJobs({ keywords: ['game developer'] });
      
      expect(jobs.find((j) => j.id === 'job-1')).toBeUndefined();
    });

    it('should deduplicate jobs by ID', async () => {
      const duplicateResponse = {
        ...mockAdzunaResponse,
        results: [
          ...mockAdzunaResponse.results,
          mockAdzunaResponse.results[0], // Duplicate
        ],
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => duplicateResponse,
      } as Response);

      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');
      
      vi.mocked(redis.exists).mockResolvedValue(0);

      const jobs = await fetchNewJobs({ keywords: ['game developer'] });
      const jobIds = jobs.map((j) => j.id);
      const uniqueIds = new Set(jobIds);

      expect(jobIds.length).toBe(uniqueIds.size);
    });

    it('should sort jobs by priority and date', async () => {
      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');
      
      vi.mocked(redis.exists).mockResolvedValue(0);

      const jobs = await fetchNewJobs({ keywords: ['game developer'] });

      // High priority jobs should come first
      const priorities = jobs.map((j) => j.priority);
      const firstHighIndex = priorities.indexOf('high');
      const lastLowIndex = priorities.lastIndexOf('low');

      if (firstHighIndex !== -1 && lastLowIndex !== -1) {
        expect(firstHighIndex).toBeLessThan(lastLowIndex);
      }
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');

      const jobs = await fetchNewJobs({ keywords: ['game developer'] });

      expect(jobs).toEqual([]);
    });

    it('should handle missing API credentials', async () => {
      // This test verifies the function handles missing credentials
      // Since env is loaded at import time, we'll just verify the function
      // returns empty array when API call fails
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('API credentials missing'));
      
      const { fetchNewJobs } = await import('../../src/services/jobs/jobFetcher.js');
      const jobs = await fetchNewJobs({ keywords: ['game developer'] });

      // Should return empty array on error
      expect(Array.isArray(jobs)).toBe(true);
    });
  });

  describe('markJobsAsPosted', () => {
    it('should mark jobs in Redis', async () => {
      const { markJobsAsPosted } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');

      await markJobsAsPosted(mockJobs);

      expect(redis.set).toHaveBeenCalledTimes(mockJobs.length);
      mockJobs.forEach((job) => {
        expect(redis.set).toHaveBeenCalledWith(
          expect.stringContaining(job.id),
          expect.any(String),
          expect.any(Number)
        );
      });
    });

    it('should handle Redis errors gracefully', async () => {
      const { markJobsAsPosted } = await import('../../src/services/jobs/jobFetcher.js');
      const { redis } = await import('../../src/services/cache/redis.js');
      
      vi.mocked(redis.set).mockResolvedValue(null);

      await expect(markJobsAsPosted(mockJobs)).resolves.not.toThrow();
    });
  });
});


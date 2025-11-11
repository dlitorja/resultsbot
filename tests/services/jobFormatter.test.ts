/**
 * Tests for job formatter service
 */

import { describe, it, expect } from 'vitest';
import { formatJobEmbed, createJobSummaryMessage } from '../../src/services/jobs/jobFormatter.js';
import { mockJobs } from '../mocks/jobs.js';

describe('Job Formatter Service', () => {
  describe('formatJobEmbed', () => {
    it('should format job with all fields', () => {
      const job = mockJobs[0]; // Epic Games job with salary
      const embed = formatJobEmbed(job);
      const data = embed.toJSON();

      expect(data.title).toBe(job.title);
      expect(data.url).toBe(job.url);
      expect(data.fields).toHaveLength(3); // Company, Location, Salary
      expect(data.fields![0].name).toContain('Company');
      expect(data.fields![0].value).toBe(job.company);
      expect(data.fields![1].name).toContain('Location');
      expect(data.fields![1].value).toBe(job.location);
      expect(data.fields![2].name).toContain('Salary');
      expect(data.fields![2].value).toBe(job.salary);
    });

    it('should format job without salary', () => {
      const job = mockJobs[2]; // Content Creator job without salary
      const embed = formatJobEmbed(job);
      const data = embed.toJSON();

      expect(data.fields).toHaveLength(2); // Only Company and Location
      expect(data.fields!.find((f) => f.name.includes('Salary'))).toBeUndefined();
    });

    it('should use correct color based on priority', () => {
      const highPriorityJob = mockJobs[0]; // Epic Games - high priority
      const mediumPriorityJob = mockJobs[1]; // Indie Studio - medium priority
      const lowPriorityJob = mockJobs[2]; // YouTube - low priority

      const highEmbed = formatJobEmbed(highPriorityJob);
      const mediumEmbed = formatJobEmbed(mediumPriorityJob);
      const lowEmbed = formatJobEmbed(lowPriorityJob);

      expect(highEmbed.toJSON().color).toBe(0xffd700); // Gold for high priority
      expect(mediumEmbed.toJSON().color).toBe(0x5865f2); // Discord Blurple for medium
      expect(lowEmbed.toJSON().color).toBe(0x99aab5); // Gray for low
    });

    it('should include posted date in footer', () => {
      const job = mockJobs[0];
      const embed = formatJobEmbed(job);
      const data = embed.toJSON();

      expect(data.footer).toBeDefined();
      expect(data.footer?.text).toBeDefined();
    });

    it('should truncate long descriptions', () => {
      const longJob = {
        ...mockJobs[0],
        description: 'A'.repeat(600),
      };

      const embed = formatJobEmbed(longJob);
      const data = embed.toJSON();
      expect(data.description!.length).toBeLessThanOrEqual(500);
      expect(data.description).toContain('...');
    });

    it('should include priority badge for high priority jobs', () => {
      const highPriorityJob = mockJobs[0];
      const embed = formatJobEmbed(highPriorityJob);
      const data = embed.toJSON();

      expect(data.footer?.text).toContain('⭐');
      expect(data.footer?.text).toContain('Priority');
    });
  });

  describe('createJobSummaryMessage', () => {
    it('should create message with job counts', () => {
      const message = createJobSummaryMessage(10, 3);

      expect(message).toContain('10');
      expect(message).toContain('3');
      expect(message).toContain('new job');
    });

    it('should handle singular vs plural correctly', () => {
      const singleJob = createJobSummaryMessage(1, 0);
      const multipleJobs = createJobSummaryMessage(5, 2);

      expect(singleJob).toContain('1 new job');
      expect(multipleJobs).toContain('5 new jobs');
    });

    it('should highlight priority jobs', () => {
      const message = createJobSummaryMessage(10, 5);

      expect(message).toContain('priority companies');
    });

    it('should handle zero priority jobs', () => {
      const message = createJobSummaryMessage(10, 0);

      expect(message).toContain('10 new jobs');
      expect(message).not.toContain('featured');
    });
  });
});


/**
 * Tests for job constants and priority logic
 */

import { describe, it, expect } from 'vitest';
import { JOB_KEYWORDS, getJobPriority } from '../../src/services/jobs/constants.js';

describe('Job Constants', () => {
  describe('JOB_KEYWORDS', () => {
    it('should have relevant gaming/creator keywords', () => {
      expect(JOB_KEYWORDS).toContain('partnerships manager');
      expect(JOB_KEYWORDS).toContain('community manager');
      expect(JOB_KEYWORDS.length).toBeGreaterThan(0);
    });

    it('should have keywords as strings', () => {
      JOB_KEYWORDS.forEach((keyword) => {
        expect(typeof keyword).toBe('string');
        expect(keyword.length).toBeGreaterThan(0);
      });
    });
  });

  describe('PRIORITY_COMPANIES', () => {
    it('should include major companies and studios', async () => {
      const { PRIORITY_COMPANIES, PRIORITY_GAME_STUDIOS } = await import('../../src/services/jobs/constants.js');
      expect(PRIORITY_COMPANIES).toContain('google');
      expect(PRIORITY_GAME_STUDIOS).toContain('riot games');
    });
  });

  describe('getJobPriority', () => {
    it('should return high priority for featured companies', () => {
      expect(getJobPriority('Epic Games')).toBe('high');
      expect(getJobPriority('Riot Games')).toBe('high');
      expect(getJobPriority('Valve')).toBe('high');
    });

    it('should be case insensitive', () => {
      expect(getJobPriority('epic games')).toBe('high');
      expect(getJobPriority('EPIC GAMES')).toBe('high');
      expect(getJobPriority('EpIc GaMeS')).toBe('high');
    });

    it('should return medium for companies with game/studio keywords', () => {
      expect(getJobPriority('Amazing Game Studios')).toBe('medium');
      expect(getJobPriority('Interactive Entertainment')).toBe('medium');
      expect(getJobPriority('XYZ Games')).toBe('medium');
    });

    it('should return medium for other companies', () => {
      expect(getJobPriority('Generic Corp')).toBe('medium');
      expect(getJobPriority('Random Company')).toBe('medium');
    });

    it('should handle empty/null company names', () => {
      expect(getJobPriority('')).toBe('medium');
      expect(getJobPriority('   ')).toBe('medium');
    });
  });
});


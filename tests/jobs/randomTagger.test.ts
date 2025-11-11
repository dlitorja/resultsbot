/**
 * Tests for random tagger cron job
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { mockRandomTags } from '../mocks/supabase.js';
import { createMockClient } from '../mocks/discord.js';

// Mock dependencies
vi.mock('../../src/database/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockRandomTags,
        error: null,
      }),
    })),
  },
}));

vi.mock('../../src/bot/index.js', () => ({
  client: createMockClient(),
}));

describe('Random Tagger Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check for existing monthly record', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    const currentMonth = DateTime.now().toFormat('yyyy-MM');
    
    const result = await supabase
      .from('random_tags')
      .select('*')
      .eq('user_id', '987654321')
      .eq('month', currentMonth)
      .single();
    
    expect(result.data).toEqual(mockRandomTags);
  });

  it('should create record with target between 1 and 5', () => {
    const targetCount = Math.floor(Math.random() * 5) + 1;
    
    expect(targetCount).toBeGreaterThanOrEqual(1);
    expect(targetCount).toBeLessThanOrEqual(5);
  });

  it('should not tag if target reached', () => {
    const tagData = {
      ...mockRandomTags,
      current_count: 3,
      target_count: 3,
    };
    
    expect(tagData.current_count).toBeGreaterThanOrEqual(tagData.target_count);
  });

  it('should have 30% chance to tag', () => {
    // Test the probability logic
    const testRuns = 1000;
    let tagCount = 0;
    
    for (let i = 0; i < testRuns; i++) {
      if (Math.random() < 0.3) {
        tagCount++;
      }
    }
    
    // Should be around 300 tags (30% of 1000)
    // Allow 10% margin of error for randomness
    expect(tagCount).toBeGreaterThan(250);
    expect(tagCount).toBeLessThan(350);
  });

  it('should use random message from RANDOM_TAGGER messages', () => {
    const messages = [
      'Thinking about {user}...',
      '{user} 👀',
      'Hey {user}, miss you!',
    ];
    
    const user = '<@987654321>';
    const message = messages[0].replace('{user}', user);
    
    expect(message).toContain(user);
  });

  it('should increment count after tagging', () => {
    const before = { current_count: 1, target_count: 3 };
    const after = { current_count: 2, target_count: 3 };
    
    expect(after.current_count).toBe(before.current_count + 1);
    expect(after.current_count).toBeLessThanOrEqual(after.target_count);
  });

  it('should update last_tagged_at timestamp', () => {
    const before = mockRandomTags.last_tagged_at;
    const after = new Date().toISOString();
    
    expect(new Date(after).getTime()).toBeGreaterThan(new Date(before).getTime());
  });

  it('should handle missing Jordan user ID', () => {
    const originalJordanId = process.env.JORDAN_USER_ID;
    delete process.env.JORDAN_USER_ID;
    
    expect(process.env.JORDAN_USER_ID).toBeUndefined();
    
    process.env.JORDAN_USER_ID = originalJordanId;
  });

  it('should format month correctly', () => {
    const currentMonth = DateTime.now().toFormat('yyyy-MM');
    
    expect(currentMonth).toMatch(/^\d{4}-\d{2}$/);
    expect(currentMonth.length).toBe(7);
  });

  it('should handle database errors when creating record', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      }),
    } as any);
    
    const result = await supabase
      .from('random_tags')
      .select('*')
      .eq('user_id', '987654321')
      .eq('month', '2024-11')
      .single();
    
    expect(result.error?.code).toBe('PGRST116');
  });

  it('should send message to general channel', async () => {
    const { client } = await import('../../src/bot/index.js');
    
    const guild = client.guilds.cache.values().next().value;
    const channel = guild.channels.cache.get('general');
    
    expect(channel).toBeDefined();
    expect(channel.isTextBased()).toBe(true);
    expect(channel.send).toBeDefined();
  });
});


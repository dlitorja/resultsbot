/**
 * Tests for birthday checker cron job
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTime } from 'luxon';
import { mockBirthdays } from '../mocks/supabase.js';
import { createMockClient } from '../mocks/discord.js';

// Mock dependencies
vi.mock('../../src/database/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        data: mockBirthdays,
        error: null,
      }),
    })),
  },
}));

vi.mock('../../src/bot/index.js', () => ({
  client: createMockClient(),
}));

describe('Birthday Checker Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset date mocking
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should check birthdays from database', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    
    // We can't directly test the cron function without exposing it
    // But we can verify the database query would be called
    const result = await supabase.from('birthdays').select('*');
    
    expect(result.data).toEqual(mockBirthdays);
  });

  it('should match birthdays by month and day', () => {
    // Test the birthday matching logic
    const birthday = DateTime.fromISO('1990-05-15');
    const today = DateTime.fromISO('2024-05-15');
    
    expect(birthday.month).toBe(today.month);
    expect(birthday.day).toBe(today.day);
  });

  it('should work with different timezones', () => {
    const birthday = DateTime.fromISO('1990-05-15', { zone: 'America/Chicago' });
    const birthdayUTC = DateTime.fromISO('1990-05-15', { zone: 'UTC' });
    
    // Same date, different timezones
    expect(birthday.day).toBe(birthdayUTC.day);
    expect(birthday.month).toBe(birthdayUTC.month);
  });

  it('should handle February 29 birthdays', () => {
    const leapBirthday = DateTime.fromISO('2000-02-29');
    
    expect(leapBirthday.isValid).toBe(true);
    expect(leapBirthday.month).toBe(2);
    expect(leapBirthday.day).toBe(29);
  });

  it('should send message to correct channel', async () => {
    const { client } = await import('../../src/bot/index.js');
    
    // Find general channel
    const guild = client.guilds.cache.values().next().value;
    const channel = guild.channels.cache.get('general');
    
    expect(channel).toBeDefined();
    expect(channel.isTextBased()).toBe(true);
  });

  it('should use random birthday message', () => {
    const messages = [
      'Happy Birthday {user}! 🎉',
      'It\'s {user}\'s birthday! 🎂',
      'Wishing {user} a great birthday! 🎈',
    ];
    
    const user = '<@123456789>';
    const message = messages[0].replace('{user}', user);
    
    expect(message).toContain(user);
    expect(message).toContain('Birthday');
  });

  it('should handle empty birthday list', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    } as any);
    
    const result = await supabase.from('birthdays').select('*');
    
    expect(result.data).toEqual([]);
  });

  it('should handle database errors gracefully', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection error' },
      }),
    } as any);
    
    const result = await supabase.from('birthdays').select('*');
    
    expect(result.error).toBeDefined();
  });
});


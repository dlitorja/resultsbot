/**
 * Mock Supabase client for testing
 */

import { vi } from 'vitest';

export function createMockSupabaseClient() {
  const mockFrom = vi.fn((table: string) => {
    return {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((callback) => callback({ data: mockBirthdays, error: null })),
    };
  });

  return {
    from: mockFrom,
    auth: {
      signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
}

export const mockBirthdays = [
  {
    id: 1,
    user_id: '123456789',
    birth_date: '1990-05-15',
    timezone: 'America/Chicago',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    user_id: '987654321',
    birth_date: '1995-12-25',
    timezone: 'America/New_York',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockRandomTags = {
  id: 1,
  user_id: '987654321',
  month: '2024-11',
  target_count: 3,
  current_count: 1,
  last_tagged_at: '2024-11-01T00:00:00Z',
  created_at: '2024-11-01T00:00:00Z',
};


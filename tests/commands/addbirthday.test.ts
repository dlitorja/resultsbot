/**
 * Tests for /addbirthday command
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockInteraction, createMockUser } from '../mocks/discord.js';
import { PermissionFlagsBits } from 'discord.js';

// Note: We'll need to mock the supabase import
vi.mock('../../src/database/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

describe('/addbirthday command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct command data', async () => {
    const command = await import('../../src/bot/commands/addbirthday.js');
    expect(command.default.data.name).toBe('addbirthday');
    expect(command.default.data.description).toBeTruthy();
  });

  it('should require administrator permissions', async () => {
    const command = await import('../../src/bot/commands/addbirthday.js');
    const data = command.default.data.toJSON();
    expect(data.default_member_permissions).toBe(String(PermissionFlagsBits.ManageGuild));
  });

  it('should add birthday successfully', async () => {
    const command = await import('../../src/bot/commands/addbirthday.js');
    const mockUser = createMockUser({ id: '999999999' });
    
    const interaction = createMockInteraction({
      options: {
        user: mockUser,
        date: '1990-05-15',
        year: null,
      },
    });
    
    await command.default.execute(interaction);
    
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('set to')
      })
    );
  });

  it('should validate date format', async () => {
    const command = await import('../../src/bot/commands/addbirthday.js');
    const mockUser = createMockUser({ id: '999999999' });
    
    const interaction = createMockInteraction({
      options: {
        user: mockUser,
        date: 'invalid-date',
        year: null,
      },
    });
    
    await command.default.execute(interaction);
    
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Invalid'),
        ephemeral: true
      })
    );
  });

  it('should handle database errors gracefully', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    vi.mocked(supabase.from).mockReturnValueOnce({
      upsert: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    } as any);
    
    const command = await import('../../src/bot/commands/addbirthday.js');
    const mockUser = createMockUser({ id: '999999999' });
    
    const interaction = createMockInteraction({
      options: {
        user: mockUser,
        date: '1990-05-15',
        year: null,
      },
    });
    
    await command.default.execute(interaction);
    
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Failed')
      })
    );
  });
});


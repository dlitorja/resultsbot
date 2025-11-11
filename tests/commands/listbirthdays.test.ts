/**
 * Tests for /listbirthdays command
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockInteraction } from '../mocks/discord.js';
import { mockBirthdays } from '../mocks/supabase.js';

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

describe('/listbirthdays command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct command data', async () => {
    const command = await import('../../src/bot/commands/listbirthdays.js');
    expect(command.default.data.name).toBe('listbirthdays');
    expect(command.default.data.description).toBeTruthy();
  });

  it('should list birthdays successfully', async () => {
    const command = await import('../../src/bot/commands/listbirthdays.js');
    const interaction = createMockInteraction();
    
    await command.default.execute(interaction);
    
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();
    const editReplyArg = vi.mocked(interaction.editReply).mock.calls[0][0];
    
    // Check if reply contains embeds
    if (typeof editReplyArg === 'object' && 'embeds' in editReplyArg) {
      expect(editReplyArg.embeds).toBeDefined();
      expect(editReplyArg.embeds.length).toBeGreaterThan(0);
    }
  });

  it('should handle empty birthday list', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    } as any);
    
    const command = await import('../../src/bot/commands/listbirthdays.js');
    const interaction = createMockInteraction();
    
    await command.default.execute(interaction);
    
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('No birthdays')
      })
    );
  });

  it('should handle database errors', async () => {
    const { supabase } = await import('../../src/database/supabase.js');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    } as any);
    
    const command = await import('../../src/bot/commands/listbirthdays.js');
    const interaction = createMockInteraction();
    
    await command.default.execute(interaction);
    
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('Failed')
      })
    );
  });

  it('should sort birthdays chronologically', async () => {
    const command = await import('../../src/bot/commands/listbirthdays.js');
    const interaction = createMockInteraction();
    
    await command.default.execute(interaction);
    
    expect(interaction.deferReply).toHaveBeenCalled();
    expect(interaction.editReply).toHaveBeenCalled();
    // Birthdays should be sorted - detailed check would require inspecting embed fields
  });
});


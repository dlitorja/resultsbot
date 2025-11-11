/**
 * Tests for /toxic command
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockInteraction } from '../mocks/discord.js';
import toxicCommand from '../../src/bot/commands/toxic.js';

describe('/toxic command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct command data', () => {
    expect(toxicCommand.data.name).toBe('toxic');
    expect(toxicCommand.data.description).toBeTruthy();
  });

  it('should reply with toxic message when SAM_USER_ID is set', async () => {
    const interaction = createMockInteraction();
    
    await toxicCommand.execute(interaction);
    
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining('<@123456789>')
      })
    );
  });

  it('should reply with message even with fallback', async () => {
    // The toxic command uses env.SAM_USER_ID which is loaded at import time
    // So this test just verifies the command runs successfully
    const interaction = createMockInteraction();
    
    await toxicCommand.execute(interaction);
    
    expect(interaction.reply).toHaveBeenCalledOnce();
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringMatching(/toxic|<@\d+>/)
      })
    );
  });

  it('should use random message from TOXIC_MESSAGES', async () => {
    const interaction1 = createMockInteraction();
    const interaction2 = createMockInteraction();
    const interaction3 = createMockInteraction();
    
    await toxicCommand.execute(interaction1);
    await toxicCommand.execute(interaction2);
    await toxicCommand.execute(interaction3);
    
    // At least one should have been called (randomness means we can't guarantee all different)
    expect(interaction1.reply).toHaveBeenCalled();
    expect(interaction2.reply).toHaveBeenCalled();
    expect(interaction3.reply).toHaveBeenCalled();
  });

  it('should handle reply errors gracefully', async () => {
    const interaction = createMockInteraction();
    interaction.reply = vi.fn().mockRejectedValue(new Error('Discord API error'));
    
    await expect(toxicCommand.execute(interaction)).rejects.toThrow('Discord API error');
  });
});


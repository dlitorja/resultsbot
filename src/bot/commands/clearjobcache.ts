import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { redis } from '../../services/cache/redis.js';
import { logger } from '../../utils/logger.js';

/**
 * Clear job cache command (for testing)
 * Clears Redis cache of posted jobs so they can be re-posted
 * Admin only
 */

export default {
  data: new SlashCommandBuilder()
    .setName('clearjobcache')
    .setDescription('Clear job posting cache (allows re-posting jobs for testing)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Get all job cache keys
      const keys = await redis.keys('job:posted:*');
      
      if (keys.length === 0) {
        await interaction.editReply('ℹ️ No job cache entries found.');
        return;
      }

      // Delete all job cache entries
      let deleted = 0;
      for (const key of keys) {
        const result = await redis.del(key);
        if (result === 1) deleted++;
      }

      logger.info({ cleared: deleted }, 'Job cache cleared');
      
      await interaction.editReply(`✅ Cleared ${deleted} job cache entries. You can now run /testjobs to repost jobs.`);
    } catch (error) {
      logger.error({ error }, 'Failed to clear job cache');
      await interaction.editReply('❌ Failed to clear job cache. Check logs for details.');
    }
  },
};


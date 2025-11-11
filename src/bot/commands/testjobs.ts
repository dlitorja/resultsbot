import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { triggerJobPosting } from '../jobs/jobPoster.js';
import { logger } from '../../utils/logger.js';

/**
 * Test command to manually trigger job posting
 * Admin only for testing purposes
 */

export default {
  data: new SlashCommandBuilder()
    .setName('testjobs')
    .setDescription('Manually trigger job posting (admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ 
      content: '🔄 Job posting started! This may take 1-2 minutes. Check the job channel shortly.',
      ephemeral: true 
    });

    // Fire and forget - don't wait for completion to avoid Discord timeout
    triggerJobPosting().catch(error => {
      logger.error({ error }, 'Job posting failed after command was acknowledged');
    });
  },
};


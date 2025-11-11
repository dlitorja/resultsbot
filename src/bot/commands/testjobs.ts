import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { triggerJobPosting } from '../jobs/jobPoster.js';

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
    await interaction.deferReply({ ephemeral: true });

    try {
      await interaction.editReply('🔄 Fetching jobs...');
      
      await triggerJobPosting();
      
      await interaction.editReply('✅ Job posting triggered! Check the job channel.');
    } catch (error) {
      await interaction.editReply('❌ Failed to trigger job posting. Check logs for details.');
    }
  },
};


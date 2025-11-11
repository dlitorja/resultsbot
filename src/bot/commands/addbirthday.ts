import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { supabase } from '../../database/supabase.js';
import { logger } from '../../utils/logger.js';
import { EMOJIS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addbirthday')
    .setDescription('Add or update a birthday')
    .addUserOption((option) =>
      option.setName('user').setDescription('The user').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('date')
        .setDescription('Birthday date (YYYY-MM-DD)')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('year').setDescription('Birth year (optional)').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user', true);
    const dateStr = interaction.options.getString('date', true);
    const year = interaction.options.getInteger('year');

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      await interaction.reply({
        content: '❌ Invalid date format. Please use YYYY-MM-DD (e.g., 1990-05-15)',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const { error } = await supabase.from('birthdays').upsert(
        {
          user_id: user.id,
          birth_date: dateStr,
          birth_year: year,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        throw error;
      }

      await interaction.editReply({
        content: `${EMOJIS.SUCCESS} Birthday for ${user} set to ${dateStr}${
          year ? ` (${year})` : ''
        }!`,
      });

      logger.info(`Birthday added for user ${user.id}: ${dateStr}`);
    } catch (error) {
      logger.error({ error }, 'Failed to add birthday');
      await interaction.editReply({
        content: `${EMOJIS.ERROR} Failed to add birthday. Please try again.`,
      });
    }
  },
};


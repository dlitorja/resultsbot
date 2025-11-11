import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { env } from '../../config/env.js';
import { TOXIC_MESSAGES, EMOJIS, COOLDOWNS } from '../../config/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('toxic')
    .setDescription('Call out Sam for being toxic'),

  cooldown: COOLDOWNS.TOXIC,

  async execute(interaction: ChatInputCommandInteraction) {
    const samUserId = env.SAM_USER_ID;

    if (!samUserId) {
      await interaction.reply({
        content: '❌ Sam user ID is not configured.',
        ephemeral: true,
      });
      return;
    }

    // Get random toxic message
    const message =
      TOXIC_MESSAGES[Math.floor(Math.random() * TOXIC_MESSAGES.length)].replace(
        '{user}',
        `<@${samUserId}>`
      );

    await interaction.reply({
      content: `${EMOJIS.TOXIC} ${message}`,
    });
  },
};


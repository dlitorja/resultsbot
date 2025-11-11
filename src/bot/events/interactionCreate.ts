import { Interaction } from 'discord.js';
import { BotClient } from '../index.js';
import { logger, logCommand, logError } from '../../utils/logger.js';
import { commandsExecuted, commandDuration, timeOperation } from '../../utils/metrics.js';
import { redis } from '../../services/cache/redis.js';
import { COOLDOWNS } from '../../config/constants.js';

export default {
  name: 'interactionCreate',
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as BotClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Unknown command: ${interaction.commandName}`);
      return;
    }

    // Check cooldown
    const cooldownKey = `cooldown:${interaction.user.id}:${interaction.commandName}`;
    const onCooldown = await redis.has(cooldownKey);

    if (onCooldown) {
      const ttl = await redis.ttl(cooldownKey);
      await interaction.reply({
        content: `⏳ This command is on cooldown. Please wait ${ttl} more seconds.`,
        ephemeral: true,
      });
      return;
    }

    try {
      // Execute command with timing
      await timeOperation(
        commandDuration,
        { command_name: interaction.commandName },
        async () => {
          await command.execute(interaction);
        }
      );

      // Log command execution
      logCommand(
        interaction.commandName,
        interaction.user.id,
        interaction.guildId || undefined
      );

      // Track metrics
      commandsExecuted.inc({ command_name: interaction.commandName, status: 'success' });

      // Set cooldown
      const cooldown = command.cooldown || COOLDOWNS.TOXIC;
      await redis.set(cooldownKey, '1', cooldown);
    } catch (error) {
      logError(error as Error, {
        command: interaction.commandName,
        userId: interaction.user.id,
      });

      commandsExecuted.inc({ command_name: interaction.commandName, status: 'error' });

      const errorMessage = {
        content: '❌ An error occurred while executing this command.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  },
};


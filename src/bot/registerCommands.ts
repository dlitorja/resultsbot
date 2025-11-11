import { REST, Routes } from 'discord.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Register slash commands with Discord
 */
async function registerCommands() {
  try {
    logger.info('🔄 Registering slash commands...');

    const commands = [];
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = (await readdir(commandsPath)).filter((file) => file.endsWith('.ts'));

    // Load all command definitions
    for (const file of commandFiles) {
      const filePath = join(commandsPath, file);
      const command = await import(filePath);

      if ('data' in command.default) {
        commands.push(command.default.data.toJSON());
        logger.info(`Loaded command definition: ${command.default.data.name}`);
      }
    }

    // Construct REST client
    const rest = new REST().setToken(env.DISCORD_TOKEN);

    // Register commands
    logger.info(`Registering ${commands.length} commands...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
      { body: commands }
    );

    logger.info(`✅ Successfully registered ${(data as any).length} commands`);
  } catch (error) {
    logger.error({ error }, 'Failed to register commands');
    process.exit(1);
  }
}

registerCommands();


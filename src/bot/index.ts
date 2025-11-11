import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import { logger, logDiscordEvent } from '../utils/logger.js';
import { activeUsers } from '../utils/metrics.js';
import * as Sentry from '@sentry/node';

// Initialize Sentry if DSN is provided
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Command {
  data: {
    name: string;
    description: string;
    toJSON: () => unknown;
  };
  execute: (interaction: any) => Promise<void>;
  cooldown?: number;
}

/**
 * Extended Discord client with commands collection
 */
export class BotClient extends Client {
  commands: Collection<string, Command>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    this.commands = new Collection();
  }
}

export const client = new BotClient();

/**
 * Load all command files
 */
async function loadCommands() {
  const commandsPath = join(__dirname, 'commands');
  const commandFiles = (await readdir(commandsPath)).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(filePath);

    if ('data' in command.default && 'execute' in command.default) {
      client.commands.set(command.default.data.name, command.default);
      logger.info(`Loaded command: ${command.default.data.name}`);
    } else {
      logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
    }
  }
}

/**
 * Load all event handlers
 */
async function loadEvents() {
  const eventsPath = join(__dirname, 'events');
  const eventFiles = (await readdir(eventsPath)).filter((file) => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(filePath);

    if (event.default.once) {
      client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
      client.on(event.default.name, (...args) => event.default.execute(...args));
    }
    logger.info(`Loaded event: ${event.default.name}`);
  }
}

/**
 * Initialize and start the bot
 */
export async function startBot() {
  try {
    logger.info('🤖 Starting Resultsbot...');

    // Load commands and events
    await loadCommands();
    await loadEvents();

    // Login to Discord
    await client.login(env.DISCORD_TOKEN);

    // Update metrics
    client.on('ready', () => {
      if (client.guilds.cache.size > 0) {
        const totalMembers = client.guilds.cache.reduce(
          (acc, guild) => acc + guild.memberCount,
          0
        );
        activeUsers.set(totalMembers);
      }
    });

    logDiscordEvent('bot_started');
  } catch (error) {
    logger.error({ 
      error, 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined 
    }, 'Failed to start bot');
    if (env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
export async function stopBot() {
  logger.info('🛑 Shutting down bot...');
  client.destroy();
  logDiscordEvent('bot_stopped');
}

// Handle process termination
process.on('SIGINT', () => stopBot());
process.on('SIGTERM', () => stopBot());


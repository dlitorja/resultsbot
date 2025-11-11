import pino from 'pino';
import { env } from '../config/env.js';

/**
 * Structured logger using Pino
 * Provides fast, structured logging with different levels
 */
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Log helper for Discord events
 */
export const logDiscordEvent = (event: string, data?: Record<string, unknown>) => {
  logger.info({ event, ...data }, `Discord Event: ${event}`);
};

/**
 * Log helper for errors
 */
export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error({ err: error, ...context }, error.message);
};

/**
 * Log helper for command execution
 */
export const logCommand = (
  commandName: string,
  userId: string,
  guildId?: string,
  data?: Record<string, unknown>
) => {
  logger.info(
    {
      command: commandName,
      userId,
      guildId,
      ...data,
    },
    `Command executed: ${commandName}`
  );
};


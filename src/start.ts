import { startBot } from './bot/index.js';
import { startBirthdayChecker } from './bot/jobs/birthdayChecker.js';
import { startRandomTagger } from './bot/jobs/randomTagger.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';

/**
 * Main entry point for the bot
 */
async function main() {
  try {
    logger.info('🚀 Starting Resultsbot...');
    logger.info(`Environment: ${env.NODE_ENV}`);

    // Start the Discord bot
    await startBot();

    // Start cron jobs
    startBirthdayChecker();
    startRandomTagger();

    logger.info('✅ All systems operational!');
  } catch (error) {
    logger.error({ error }, 'Failed to start application');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

main();


import { startBot } from './bot/index.js';
import { startBirthdayChecker } from './bot/jobs/birthdayChecker.js';
import { startRandomTagger } from './bot/jobs/randomTagger.js';
import { startJobPoster } from './bot/jobs/jobPoster.js';
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
    startJobPoster();

    logger.info('✅ All systems operational!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ 
      error,
      errorMessage,
      errorCode: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined 
    }, 'Failed to start application');
    
    // Log helpful debugging info
    logger.error('Debug info:');
    logger.error(`  - Node version: ${process.version}`);
    logger.error(`  - Environment: ${env.NODE_ENV}`);
    logger.error(`  - Discord token length: ${env.DISCORD_TOKEN?.length || 0}`);
    logger.error(`  - Client ID: ${env.DISCORD_CLIENT_ID ? 'SET' : 'MISSING'}`);
    logger.error(`  - Guild ID: ${env.DISCORD_GUILD_ID ? 'SET' : 'MISSING'}`);
    
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


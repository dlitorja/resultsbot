import { Client } from 'discord.js';
import { logger, logDiscordEvent } from '../../utils/logger.js';
import { testConnection as testDb } from '../../database/supabase.js';
import { testConnection as testRedis } from '../../services/cache/redis.js';

export default {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    if (!client.user) return;

    logger.info(`✅ Logged in as ${client.user.tag}`);
    logger.info(`📊 Serving ${client.guilds.cache.size} guild(s)`);

    // Test connections
    const dbOk = await testDb();
    const redisOk = await testRedis();

    if (!dbOk || !redisOk) {
      logger.warn('⚠️ Some connections failed. Bot may not function correctly.');
    }

    // Set bot status
    client.user.setPresence({
      activities: [{ name: 'with results 📊' }],
      status: 'online',
    });

    logDiscordEvent('ready', {
      guilds: client.guilds.cache.size,
      user: client.user.tag,
    });

    logger.info('🚀 Resultsbot is ready!');
  },
};


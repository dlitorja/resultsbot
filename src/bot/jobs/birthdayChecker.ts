import cron from 'node-cron';
import { client } from '../index.js';
import { supabase } from '../../database/supabase.js';
import { logger } from '../../utils/logger.js';
import { birthdaysCelebrated } from '../../utils/metrics.js';
import { BIRTHDAY_MESSAGES, EMOJIS, CRON_SCHEDULES } from '../../config/constants.js';
import { DateTime } from 'luxon';
import { TextChannel } from 'discord.js';

/**
 * Check for birthdays and send messages
 */
async function checkBirthdays() {
  try {
    logger.info('Checking for birthdays...');

    const { data: birthdays, error } = await supabase.from('birthdays').select('*');

    if (error) {
      throw error;
    }

    if (!birthdays || birthdays.length === 0) {
      logger.debug('No birthdays in database');
      return;
    }

    const today = DateTime.now();

    for (const birthday of birthdays) {
      const birthDate = DateTime.fromISO(birthday.birth_date, {
        zone: birthday.timezone || 'UTC',
      });

      // Check if month and day match
      if (birthDate.month === today.month && birthDate.day === today.day) {
        logger.info(`🎂 Today is ${birthday.user_id}'s birthday!`);

        // Get random birthday message
        const message =
          BIRTHDAY_MESSAGES[Math.floor(Math.random() * BIRTHDAY_MESSAGES.length)].replace(
            '{user}',
            `<@${birthday.user_id}>`
          );

        // Send message to all guilds the bot is in
        for (const guild of client.guilds.cache.values()) {
          try {
            // Try to find a general channel
            const channel = guild.channels.cache.find(
              (ch) =>
                ch.isTextBased() &&
                (ch.name.includes('general') || ch.name.includes('chat'))
            ) as TextChannel;

            if (channel) {
              await channel.send(`${EMOJIS.BIRTHDAY} ${message}`);
              logger.info(`Sent birthday message to ${guild.name}`);
              birthdaysCelebrated.inc();
            }
          } catch (error) {
            logger.error({ error, guild: guild.id }, 'Failed to send birthday message');
          }
        }
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to check birthdays');
  }
}

/**
 * Start birthday checker cron job
 */
export function startBirthdayChecker() {
  cron.schedule(CRON_SCHEDULES.BIRTHDAY_CHECK, checkBirthdays);
  logger.info('🎂 Birthday checker started');
}


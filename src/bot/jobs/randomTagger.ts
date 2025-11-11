import cron from 'node-cron';
import { client } from '../index.js';
import { supabase } from '../../database/supabase.js';
import { logger } from '../../utils/logger.js';
import { randomTagsSent } from '../../utils/metrics.js';
import { RANDOM_TAGGER, CRON_SCHEDULES } from '../../config/constants.js';
import { env } from '../../config/env.js';
import { TextChannel } from 'discord.js';
import { DateTime } from 'luxon';

/**
 * Check if Jordan should be tagged today
 */
async function checkRandomTag() {
  try {
    const jordanUserId = env.JORDAN_USER_ID;

    if (!jordanUserId) {
      logger.debug('Jordan user ID not configured, skipping random tagger');
      return;
    }

    logger.info('Checking if random tag should be sent...');

    const currentMonth = DateTime.now().toFormat('yyyy-MM');

    // Get or create monthly tag tracking
    let { data: tagData, error } = await supabase
      .from('random_tags')
      .select('*')
      .eq('user_id', jordanUserId)
      .eq('month', currentMonth)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows
      throw error;
    }

    // If no record for this month, create one
    if (!tagData) {
      const targetCount =
        Math.floor(Math.random() * (RANDOM_TAGGER.MAX_TAGS - RANDOM_TAGGER.MIN_TAGS + 1)) +
        RANDOM_TAGGER.MIN_TAGS;

      const { data: newData, error: insertError } = await supabase
        .from('random_tags')
        .insert({
          user_id: jordanUserId,
          month: currentMonth,
          target_count: targetCount,
          current_count: 0,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      tagData = newData;
      logger.info(`Created new random tag record for ${jordanUserId}: ${targetCount} tags`);
    }

    // Check if we've reached the target
    if (tagData.current_count >= tagData.target_count) {
      logger.debug('Target tags reached for this month');
      return;
    }

    // Random chance to tag (e.g., 30% chance when checked)
    const shouldTag = Math.random() < 0.3;

    if (!shouldTag) {
      logger.debug('Random check failed, not tagging today');
      return;
    }

    // Get random message
    const message =
      RANDOM_TAGGER.MESSAGES[Math.floor(Math.random() * RANDOM_TAGGER.MESSAGES.length)].replace(
        '{user}',
        `<@${jordanUserId}>`
      );

    // Send message to all guilds
    for (const guild of client.guilds.cache.values()) {
      try {
        // Try to find a general channel
        const channel = guild.channels.cache.find(
          (ch) =>
            ch.isTextBased() &&
            (ch.name.includes('general') || ch.name.includes('chat'))
        ) as TextChannel;

        if (channel) {
          await channel.send(message);
          logger.info(`Sent random tag to ${guild.name}`);
        }
      } catch (error) {
        logger.error({ error, guild: guild.id }, 'Failed to send random tag');
      }
    }

    // Update count
    const { error: updateError } = await supabase
      .from('random_tags')
      .update({
        current_count: tagData.current_count + 1,
        last_tagged_at: new Date().toISOString(),
      })
      .eq('user_id', jordanUserId)
      .eq('month', currentMonth);

    if (updateError) {
      throw updateError;
    }

    randomTagsSent.inc({ user: jordanUserId });
    logger.info(`Random tag sent: ${tagData.current_count + 1}/${tagData.target_count}`);
  } catch (error) {
    logger.error({ error }, 'Failed to check random tag');
  }
}

/**
 * Start random tagger cron job
 */
export function startRandomTagger() {
  cron.schedule(CRON_SCHEDULES.RANDOM_TAGGER_CHECK, checkRandomTag);
  logger.info('🎲 Random tagger started');
}


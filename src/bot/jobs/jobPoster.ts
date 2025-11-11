import cron from 'node-cron';
import { client } from '../index.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { fetchNewJobs, markJobsAsPosted } from '../../services/jobs/jobFetcher.js';
import { formatJobEmbed, createJobSummaryMessage } from '../../services/jobs/jobFormatter.js';
import { TextChannel } from 'discord.js';

/**
 * Job posting cron job
 * Runs daily at 2 PM Central Time to fetch and post new jobs
 */

/**
 * Post jobs to Discord channel
 */
async function postJobs() {
  try {
    const channelId = env.JOB_CHANNEL_ID;

    if (!channelId) {
      logger.debug('Job channel ID not configured, skipping job posting');
      return;
    }

    if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
      logger.warn('Adzuna API credentials not configured, skipping job posting');
      return;
    }

    logger.info('Starting daily job posting...');

    // Fetch new jobs
    const jobs = await fetchNewJobs();

    if (jobs.length === 0) {
      logger.info('No new jobs found');
      return;
    }

    logger.info({ jobCount: jobs.length }, 'Found new jobs to post');

    // Get the Discord channel
    const channel = await client.channels.fetch(channelId);

    if (!channel || !channel.isTextBased()) {
      logger.error({ channelId }, 'Job channel not found or not text-based');
      return;
    }

    const textChannel = channel as TextChannel;

    // Count priority jobs
    const priorityJobs = jobs.filter(job => job.priority === 'high');

    // Send summary message
    const summaryMessage = createJobSummaryMessage(jobs.length, priorityJobs.length);
    await textChannel.send(summaryMessage);

    // Post each job (limit to 10 per day to avoid spam)
    const jobsToPost = jobs.slice(0, 10);
    
    for (const job of jobsToPost) {
      try {
        const embed = formatJobEmbed(job);
        await textChannel.send({ embeds: [embed] });
        
        // Small delay between posts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error({ error, jobId: job.id }, 'Failed to post job to Discord');
      }
    }

    // Mark all jobs as posted (including ones we didn't post due to limit)
    await markJobsAsPosted(jobs);

    logger.info(
      { posted: jobsToPost.length, total: jobs.length },
      'Job posting completed'
    );

    // If we hit the limit, log it
    if (jobs.length > jobsToPost.length) {
      logger.warn(
        { skipped: jobs.length - jobsToPost.length },
        'Some jobs were skipped due to daily limit'
      );
    }
  } catch (error) {
    logger.error({ error }, 'Failed to post jobs');
  }
}

/**
 * Start job poster cron job
 * Runs daily at 2 PM Central Time (America/Chicago timezone)
 * Cron: 0 14 * * * (minute=0, hour=14, every day)
 */
export function startJobPoster() {
  // Run at 2 PM Central Time every day
  cron.schedule(
    '0 14 * * *',
    postJobs,
    {
      timezone: env.DEFAULT_TIMEZONE,
    }
  );

  logger.info('💼 Job poster started (runs daily at 2 PM Central)');
}

/**
 * Manually trigger job posting (for testing)
 */
export async function triggerJobPosting() {
  logger.info('Manually triggering job posting...');
  await postJobs();
}


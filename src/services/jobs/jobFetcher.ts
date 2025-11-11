import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { redis } from '../cache/redis.js';
import { AdzunaResponse, FormattedJob, JobSearchCriteria } from './types.js';
import { JOB_KEYWORDS, getJobPriority } from './constants.js';

/**
 * Job fetcher service
 * Fetches jobs from Adzuna API and formats them
 */

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/us/search/1';
const REDIS_JOB_PREFIX = 'job:posted:';
const JOB_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

/**
 * Fetch jobs from Adzuna API
 */
async function fetchAdzunaJobs(keyword: string, maxAge = 7): Promise<FormattedJob[]> {
  const appId = env.ADZUNA_APP_ID;
  const appKey = env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    logger.warn('Adzuna API credentials not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: keyword,
      where: 'remote', // Focus on remote jobs
      max_days_old: maxAge.toString(),
      results_per_page: '10',
      sort_by: 'date', // Most recent first
    });

    const url = `${ADZUNA_BASE_URL}?${params.toString()}`;
    
    logger.debug({ keyword, url: ADZUNA_BASE_URL }, 'Fetching jobs from Adzuna');
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AdzunaResponse;

    logger.info({ keyword, count: data.results.length }, 'Fetched jobs from Adzuna');

    // Format and return jobs
    return data.results.map(job => {
      const salary = formatSalary(job.salary_min, job.salary_max, job.salary_is_predicted);
      
      return {
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        description: stripHtml(job.description),
        url: job.redirect_url,
        salary,
        posted: new Date(job.created),
        priority: getJobPriority(job.company.display_name),
        source: 'adzuna' as const,
      };
    });
  } catch (error) {
    logger.error({ error, keyword }, 'Failed to fetch jobs from Adzuna');
    return [];
  }
}

/**
 * Format salary range
 */
function formatSalary(
  min?: number,
  max?: number,
  isPredicted?: string
): string | undefined {
  if (!min && !max) return undefined;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const predicted = isPredicted === '1' ? ' (estimated)' : '';

  if (min && max) {
    return `${formatAmount(min)} - ${formatAmount(max)}${predicted}`;
  }
  if (min) {
    return `${formatAmount(min)}+${predicted}`;
  }
  if (max) {
    return `Up to ${formatAmount(max)}${predicted}`;
  }

  return undefined;
}

/**
 * Strip HTML tags from description
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Check if job has already been posted
 * Returns true if job exists OR if Redis has an error (to prevent duplicate posts during outages)
 */
async function isJobPosted(jobId: string): Promise<boolean> {
  const exists = await redis.exists(`${REDIS_JOB_PREFIX}${jobId}`);
  
  // Handle Redis errors: treat as "already posted" to prevent duplicates during outages
  if (exists === null) {
    logger.warn({ jobId }, 'Redis error checking if job was posted - treating as already posted');
    return true;
  }
  
  return exists === 1;
}

/**
 * Mark job as posted
 */
async function markJobAsPosted(jobId: string): Promise<void> {
  const result = await redis.set(
    `${REDIS_JOB_PREFIX}${jobId}`,
    new Date().toISOString(),
    JOB_CACHE_TTL
  );
  
  if (result === null) {
    logger.error({ jobId }, 'Failed to mark job as posted in Redis');
  }
}

/**
 * Fetch all jobs from configured sources
 */
export async function fetchNewJobs(criteria?: Partial<JobSearchCriteria>): Promise<FormattedJob[]> {
  const keywords = criteria?.keywords || JOB_KEYWORDS;
  const maxAge = criteria?.maxAge || 7;

  logger.info({ keywordCount: keywords.length, maxAge }, 'Starting job fetch');

  const allJobs: FormattedJob[] = [];

  // Fetch jobs for each keyword
  for (const keyword of keywords) {
    const jobs = await fetchAdzunaJobs(keyword, maxAge);
    allJobs.push(...jobs);
  }

  logger.info({ totalJobs: allJobs.length }, 'Fetched all jobs');

  // Deduplicate by job ID
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.id, job])).values()
  );

  logger.info({ uniqueJobs: uniqueJobs.length }, 'Deduplicated jobs');

  // Filter out already posted jobs
  const newJobs: FormattedJob[] = [];
  
  for (const job of uniqueJobs) {
    const alreadyPosted = await isJobPosted(job.id);
    if (!alreadyPosted) {
      newJobs.push(job);
    }
  }

  logger.info({ newJobs: newJobs.length }, 'Filtered out already posted jobs');

  // Sort by priority (high first) and then by date (newest first)
  newJobs.sort((a, b) => {
    // Priority sorting
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Date sorting (newest first)
    return b.posted.getTime() - a.posted.getTime();
  });

  return newJobs;
}

/**
 * Mark jobs as posted (call after successfully posting to Discord)
 */
export async function markJobsAsPosted(jobs: FormattedJob[]): Promise<void> {
  for (const job of jobs) {
    await markJobAsPosted(job.id);
  }
  logger.info({ count: jobs.length }, 'Marked jobs as posted');
}


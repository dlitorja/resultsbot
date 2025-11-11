import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { redis } from '../cache/redis.js';
import { AdzunaResponse, MuseResponse, RemotiveResponse, FormattedJob, JobSearchCriteria } from './types.js';
import { JOB_KEYWORDS, getJobPriority, shouldExcludeJob } from './constants.js';

/**
 * Job fetcher service
 * Fetches jobs from multiple APIs: Adzuna, The Muse, and Remotive
 */

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/us/search/1';
const THEMUSE_BASE_URL = 'https://www.themuse.com/api/public/jobs';
const REMOTIVE_BASE_URL = 'https://remotive.com/api/remote-jobs';
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
      where: 'united states', // Broadened from 'remote' only
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
 * Fetch jobs from The Muse API
 */
async function fetchMuseJobs(keyword: string, maxAge = 30): Promise<FormattedJob[]> {
  const apiKey = env.THEMUSE_API_KEY;

  if (!apiKey) {
    logger.debug('The Muse API key not configured');
    return [];
  }

  try {
    // Calculate date threshold for filtering
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - maxAge);

    const params = new URLSearchParams({
      api_key: apiKey,
      page: '0',
      descending: 'true',
    });

    // The Muse doesn't have great keyword search, so we'll fetch recent jobs
    // and filter by keyword ourselves
    const url = `${THEMUSE_BASE_URL}?${params.toString()}`;
    
    logger.debug({ keyword, url: THEMUSE_BASE_URL }, 'Fetching jobs from The Muse');
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`The Muse API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as MuseResponse;

    logger.info({ keyword, count: data.results.length }, 'Fetched jobs from The Muse');

    // Filter by keyword and date, then format
    return data.results
      .filter(job => {
        const jobDate = new Date(job.publication_date);
        const matchesDate = jobDate >= dateThreshold;
        const matchesKeyword = 
          job.name.toLowerCase().includes(keyword.toLowerCase()) ||
          job.contents.toLowerCase().includes(keyword.toLowerCase()) ||
          (job.categories && job.categories.some(c => c.name.toLowerCase().includes(keyword.toLowerCase())));
        return matchesDate && matchesKeyword;
      })
      .map(job => {
        return {
          id: `themuse-${job.id}`,
          title: job.name,
          company: job.company.name,
          location: job.locations.map(l => l.name).join(', ') || 'Not specified',
          description: stripHtml(job.contents),
          url: job.refs.landing_page,
          salary: undefined, // The Muse doesn't provide salary in API
          posted: new Date(job.publication_date),
          priority: getJobPriority(job.company.name),
          source: 'themuse' as const,
        };
      });
  } catch (error) {
    logger.error({ error, keyword }, 'Failed to fetch jobs from The Muse');
    return [];
  }
}

/**
 * Fetch all jobs from Remotive API
 * Note: Remotive returns all jobs in one call, we filter by date
 */
async function fetchAllRemotiveJobs(maxAge = 7): Promise<FormattedJob[]> {
  try {
    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - maxAge);

    logger.debug({ url: REMOTIVE_BASE_URL }, 'Fetching all jobs from Remotive');
    
    const response = await fetch(REMOTIVE_BASE_URL);

    if (!response.ok) {
      throw new Error(`Remotive API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as RemotiveResponse;

    // Filter by date only (keyword filtering happens later)
    const recentJobs = data.jobs.filter(job => {
      const jobDate = new Date(job.publication_date);
      return jobDate >= dateThreshold;
    });

    logger.info({ total: data.jobs.length, recent: recentJobs.length }, 'Fetched jobs from Remotive');

    // Format and return jobs
    return recentJobs.map(job => {
      return {
        id: `remotive-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        description: stripHtml(job.description),
        url: job.url,
        salary: job.salary,
        posted: new Date(job.publication_date),
        priority: getJobPriority(job.company_name),
        source: 'remotive' as const,
      };
    });
  } catch (error) {
    logger.error({ error }, 'Failed to fetch jobs from Remotive');
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
  const maxAge = criteria?.maxAge || 7; // Keep jobs fresh

  logger.info({ keywordCount: keywords.length, maxAge }, 'Starting job fetch from multiple sources');

  const allJobs: FormattedJob[] = [];

  // Fetch jobs for each keyword from keyword-based APIs
  for (const keyword of keywords) {
    // Fetch from Adzuna (keyword-based)
    const adzunaJobs = await fetchAdzunaJobs(keyword, maxAge);
    allJobs.push(...adzunaJobs);

    // Fetch from The Muse (keyword-based)
    const museJobs = await fetchMuseJobs(keyword, maxAge);
    allJobs.push(...museJobs);
  }

  // Fetch from Remotive once (returns all jobs, we filter by all keywords)
  try {
    logger.info('Fetching all jobs from Remotive...');
    const remotiveAllJobs = await fetchAllRemotiveJobs(maxAge);
    
    // Filter Remotive jobs by any of our keywords
    const remotiveFilteredJobs = remotiveAllJobs.filter(job => {
      return keywords.some(keyword => 
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase())
      );
    });
    
    allJobs.push(...remotiveFilteredJobs);
    logger.info({ remotiveMatches: remotiveFilteredJobs.length, remotiveTotal: remotiveAllJobs.length }, 'Filtered Remotive jobs by keywords');
  } catch (error) {
    logger.error({ error }, 'Failed to fetch from Remotive');
  }

  logger.info({ 
    totalJobs: allJobs.length,
    adzunaJobs: allJobs.filter(j => j.source === 'adzuna').length,
    museJobs: allJobs.filter(j => j.source === 'themuse').length,
    remotiveJobs: allJobs.filter(j => j.source === 'remotive').length,
  }, 'Fetched all jobs from all sources');

  // Filter out non-creator economy jobs (healthcare, finance, etc.)
  const relevantJobs = allJobs.filter(job => !shouldExcludeJob(job.title, job.company, job.description));
  
  logger.info({ 
    beforeFilter: allJobs.length,
    afterFilter: relevantJobs.length,
    filtered: allJobs.length - relevantJobs.length,
  }, 'Filtered out non-creator economy jobs');

  // Deduplicate by job ID
  const uniqueJobs = Array.from(
    new Map(relevantJobs.map(job => [job.id, job])).values()
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


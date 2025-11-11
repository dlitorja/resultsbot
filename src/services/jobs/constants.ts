/**
 * Job posting constants
 * Keywords, priority companies, and search criteria
 */

/**
 * Job role keywords to search for
 * Focused on non-technical roles in creator economy
 */
export const JOB_KEYWORDS = [
  // Partnerships
  'partnerships manager',
  'partner manager',
  'partnership coordinator',
  'strategic partnerships',
  
  // Business Development
  'business development',
  'BD manager',
  'growth manager',
  'business development manager',
  
  // Community
  'community manager',
  'community lead',
  'discord manager',
  'social media manager',
  'community coordinator',
  
  // Marketing
  'marketing manager',
  'content marketing',
  'brand manager',
  'influencer marketing',
  'marketing coordinator',
  'digital marketing',
  
  // Operations
  'operations manager',
  'project manager',
  'ops coordinator',
  'operations coordinator',
  'program manager',
];

/**
 * Big tech/media companies to prioritize
 */
export const PRIORITY_COMPANIES = [
  // Big Tech
  'google',
  'meta',
  'facebook',
  'microsoft',
  'apple',
  'amazon',
  'netflix',
  'spotify',
  'tiktok',
  'bytedance',
  'snap',
  'snapchat',
  'twitter',
  'x corp',
  'linkedin',
  'discord',
  'twitch',
  'youtube',
  
  // Gaming Platforms
  'valve',
  'steam',
  'epic games',
  'roblox',
  'unity',
  
  // Creator Economy
  'patreon',
  'substack',
  'medium',
  'beehiiv',
  'convertkit',
  'kajabi',
  'thinkific',
  'teachable',
  'gumroad',
  'memberful',
  'ghost',
];

/**
 * Reputable game studios to prioritize
 */
export const PRIORITY_GAME_STUDIOS = [
  // AAA Studios
  'riot games',
  'blizzard',
  'activision',
  'bungie',
  'rockstar',
  'rockstar games',
  'ubisoft',
  'ea',
  'electronic arts',
  'nintendo',
  'sony',
  'playstation',
  'xbox',
  'bethesda',
  'respawn',
  'infinity ward',
  
  // Notable Indies & Mid-size
  'supergiant',
  'supergiant games',
  'coffee stain',
  'devolver',
  'annapurna',
  'team17',
  'innersloth',
  'among us',
  'mojang',
  'minecraft',
  'rare',
  'double fine',
  'obsidian',
  'insomniac',
  'naughty dog',
  'santa monica',
  
  // Esports Orgs
  'faze',
  'faze clan',
  '100 thieves',
  'team liquid',
  'cloud9',
  'tsm',
  'g2 esports',
  'fnatic',
  'optic',
  'sentinels',
];

/**
 * Check if a company should be prioritized
 */
export function isPriorityCompany(companyName: string): boolean {
  const normalized = companyName.toLowerCase().trim();
  
  return (
    PRIORITY_COMPANIES.some(company => normalized.includes(company)) ||
    PRIORITY_GAME_STUDIOS.some(studio => normalized.includes(studio))
  );
}

/**
 * Determine priority level for a job
 */
export function getJobPriority(companyName: string): 'high' | 'medium' | 'low' {
  if (isPriorityCompany(companyName)) {
    return 'high';
  }
  
  // You can add more logic here for medium priority
  // For now, everything else is medium by default
  return 'medium';
}


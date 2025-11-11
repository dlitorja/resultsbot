/**
 * Application constants
 */

export const COLORS = {
  PRIMARY: 0x5865f2, // Discord Blurple
  SUCCESS: 0x57f287, // Green
  ERROR: 0xed4245, // Red
  WARNING: 0xfee75c, // Yellow
  INFO: 0x5865f2, // Blue
} as const;

export const EMOJIS = {
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  BIRTHDAY: '🎂',
  JOB: '💼',
  TOXIC: '☢️',
  RANDOM: '🎲',
} as const;

/**
 * Command cooldowns in seconds
 */
export const COOLDOWNS = {
  TOXIC: 30, // 30 seconds between /toxic uses
  JOB_SEARCH: 60, // 1 minute between manual job searches
} as const;

/**
 * Cron schedules
 */
export const CRON_SCHEDULES = {
  BIRTHDAY_CHECK: '0 0 * * *', // Daily at midnight
  JOB_POSTING: '0 9,17 * * *', // Twice daily at 9 AM and 5 PM
  RANDOM_TAGGER_CHECK: '0 12 * * *', // Daily at noon
  MONTHLY_RESET: '0 0 1 * *', // First day of month at midnight
} as const;

/**
 * Random tagger configuration
 */
export const RANDOM_TAGGER = {
  MIN_TAGS: 1,
  MAX_TAGS: 5,
  MESSAGES: [
    'Just thinking about you, {user}! 🤔',
    'Random {user} appreciation moment! 🎉',
    '{user} has been randomly selected! 🎲',
    'The algorithm has spoken: {user}! 🤖',
    '*tags {user} for no particular reason*',
    '{user}... that\'s it. That\'s the message.',
  ],
} as const;

/**
 * Birthday messages
 */
export const BIRTHDAY_MESSAGES = [
  '🎂 Happy birthday, {user}! Hope your day is amazing! 🎉',
  '🎈 It\'s {user}\'s birthday! Everyone wish them a happy birthday! 🎊',
  '🎁 Happy birthday to {user}! Another year older, another year wiser! 🎂',
  '🎉 {user} is celebrating their birthday today! 🥳',
  '🎂 Wishing {user} the happiest of birthdays! 🎈',
];

/**
 * Toxic command messages
 */
export const TOXIC_MESSAGES = [
  '{user} is toxic 🧪',
  'Everyone, {user} is being toxic again! ☢️',
  'Toxicity levels rising: {user} detected! 🚨',
  'Warning: {user} toxic behavior detected! ⚠️',
  '{user} bringing the toxicity today! 💀',
];

/**
 * Cache durations in seconds
 */
export const CACHE_TTL = {
  JOB_POSTINGS: 3600, // 1 hour
  USER_DATA: 300, // 5 minutes
  COMMAND_COOLDOWN: 60, // 1 minute
} as const;

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  JOB_API_CALLS_PER_MINUTE: 10,
  COMMANDS_PER_USER_PER_MINUTE: 5,
} as const;


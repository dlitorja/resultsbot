import { EmbedBuilder } from 'discord.js';
import { FormattedJob } from './types.js';

/**
 * Job formatter for Discord embeds
 * Creates beautiful, informative job posting embeds
 */

/**
 * Format a single job as a Discord embed
 */
export function formatJobEmbed(job: FormattedJob): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(job.title)
    .setURL(job.url)
    .setColor(getColorForPriority(job.priority))
    .setTimestamp(job.posted);

  // Company field
  embed.addFields({
    name: '🏢 Company',
    value: job.company,
    inline: true,
  });

  // Location field
  embed.addFields({
    name: '📍 Location',
    value: job.location,
    inline: true,
  });

  // Salary field (if available)
  if (job.salary) {
    embed.addFields({
      name: '💰 Salary',
      value: job.salary,
      inline: true,
    });
  }

  // Description (truncated to fit Discord limits)
  const truncatedDescription = truncateDescription(job.description);
  if (truncatedDescription) {
    embed.setDescription(truncatedDescription);
  }

  // Footer with priority indicator
  if (job.priority === 'high') {
    embed.setFooter({ text: '⭐ Priority Company/Studio' });
  } else {
    embed.setFooter({ text: `Source: ${job.source}` });
  }

  return embed;
}

/**
 * Get embed color based on priority
 */
function getColorForPriority(priority: 'high' | 'medium' | 'low'): number {
  switch (priority) {
    case 'high':
      return 0xffd700; // Gold
    case 'medium':
      return 0x5865f2; // Discord Blurple
    case 'low':
      return 0x99aab5; // Gray
  }
}

/**
 * Truncate description to fit Discord embed limits
 * Discord embed descriptions max out at 4096 characters
 */
function truncateDescription(description: string, maxLength = 500): string {
  if (description.length <= maxLength) {
    return description;
  }

  // Find the last complete sentence within the limit
  const truncated = description.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastSentenceEnd > 0 && lastSentenceEnd > maxLength * 0.7) {
    // If we found a sentence ending in the last 30% of the text, use it
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  // Otherwise, just truncate and add ellipsis
  return truncated.substring(0, maxLength - 3) + '...';
}

/**
 * Create a summary message for multiple jobs
 */
export function createJobSummaryMessage(jobCount: number, priorityCount: number): string {
  const emoji = priorityCount > 0 ? '⭐' : '💼';
  const priorityText = priorityCount > 0 
    ? ` (${priorityCount} from priority companies!)`
    : '';
  
  return `${emoji} **Found ${jobCount} new job${jobCount !== 1 ? 's' : ''}${priorityText}**\n\n`;
}


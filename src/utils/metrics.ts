import client from 'prom-client';
import { env } from '../config/env.js';

/**
 * Prometheus metrics for monitoring bot performance
 */

// Create a Registry to register the metrics
export const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

/**
 * Custom metrics
 */

// Commands executed counter
export const commandsExecuted = new client.Counter({
  name: 'resultsbot_commands_total',
  help: 'Total number of commands executed',
  labelNames: ['command_name', 'status'],
  registers: [register],
});

// Command execution duration
export const commandDuration = new client.Histogram({
  name: 'resultsbot_command_duration_seconds',
  help: 'Duration of command execution',
  labelNames: ['command_name'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Jobs posted counter
export const jobsPosted = new client.Counter({
  name: 'resultsbot_jobs_posted_total',
  help: 'Total number of job postings shared',
  labelNames: ['source'],
  registers: [register],
});

// Birthdays celebrated counter
export const birthdaysCelebrated = new client.Counter({
  name: 'resultsbot_birthdays_celebrated_total',
  help: 'Total number of birthdays celebrated',
  registers: [register],
});

// Random tags sent counter
export const randomTagsSent = new client.Counter({
  name: 'resultsbot_random_tags_total',
  help: 'Total number of random tags sent',
  labelNames: ['user'],
  registers: [register],
});

// Active users gauge
export const activeUsers = new client.Gauge({
  name: 'resultsbot_active_users',
  help: 'Number of active users',
  registers: [register],
});

// Discord API latency
export const discordApiLatency = new client.Histogram({
  name: 'resultsbot_discord_api_latency_ms',
  help: 'Discord API latency in milliseconds',
  buckets: [10, 50, 100, 200, 500, 1000],
  registers: [register],
});

// Redis operations counter
export const redisOperations = new client.Counter({
  name: 'resultsbot_redis_operations_total',
  help: 'Total number of Redis operations',
  labelNames: ['operation', 'status'],
  registers: [register],
});

// Database query duration
export const dbQueryDuration = new client.Histogram({
  name: 'resultsbot_db_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

/**
 * Helper function to time async operations
 */
export async function timeOperation<T>(
  histogram: client.Histogram,
  labels: Record<string, string>,
  operation: () => Promise<T>
): Promise<T> {
  const end = histogram.startTimer(labels);
  try {
    return await operation();
  } finally {
    end();
  }
}

/**
 * Export metrics endpoint handler
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

// Optional: Start metrics server if configured
if (env.PROMETHEUS_PORT) {
  const port = parseInt(env.PROMETHEUS_PORT, 10);
  import('http').then(({ createServer }) => {
    const server = createServer(async (req, res) => {
      if (req.url === '/metrics') {
        res.setHeader('Content-Type', register.contentType);
        res.end(await getMetrics());
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      console.log(`📊 Metrics server listening on port ${port}`);
    });
  });
}


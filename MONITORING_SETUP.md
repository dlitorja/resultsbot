# Monitoring Setup Guide

This guide walks you through setting up complete observability for Resultsbot using Grafana Cloud, Prometheus, and UptimeRobot.

---

## 📊 Overview

The bot exposes Prometheus metrics on port 9090 and includes:
- Command execution metrics
- Job posting statistics
- Birthday celebrations
- Random tags sent
- System resources (CPU, memory, event loop)
- Database and Redis performance
- Discord API latency

---

## 🔧 Part 1: Prometheus Metrics Endpoint

### What's Already Configured

The bot automatically starts a Prometheus metrics server on port 9090 (configurable via `PROMETHEUS_PORT` environment variable).

**Metrics endpoint:** `http://your-bot-url:9090/metrics`

### Testing Locally

1. Start the bot:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:9090/metrics` in your browser

3. You should see metrics output like:
   ```
   # HELP resultsbot_commands_total Total number of commands executed
   # TYPE resultsbot_commands_total counter
   resultsbot_commands_total{command_name="toxic",status="success"} 5
   
   # HELP process_cpu_user_seconds_total Total user CPU time spent
   # TYPE process_cpu_user_seconds_total counter
   process_cpu_user_seconds_total 0.156
   ...
   ```

---

## 📈 Part 2: Grafana Cloud Setup

Grafana Cloud offers a free tier perfect for monitoring a Discord bot.

### Step 1: Create Grafana Cloud Account

1. Go to [grafana.com](https://grafana.com/auth/sign-up/create-user)
2. Sign up for a free account
3. Create a new stack (choose a region close to your Fly.io deployment)
4. Note your stack URL (e.g., `https://your-username.grafana.net`)

### Step 2: Configure Prometheus Data Source

#### Option A: Use Grafana Agent (Recommended for Fly.io)

Grafana Agent is lightweight and perfect for scraping metrics from your bot.

1. **In Grafana Cloud Dashboard:**
   - Go to "Connections" → "Add new connection"
   - Search for "Prometheus"
   - Click "Add new data source"
   - Get your Prometheus remote write endpoint and credentials

2. **Create `grafana-agent.yml` in your project:**

```yaml
server:
  log_level: info

metrics:
  global:
    scrape_interval: 30s
    remote_write:
      - url: https://prometheus-YOUR-STACK.grafana.net/api/prom/push
        basic_auth:
          username: YOUR_PROMETHEUS_USERNAME
          password: YOUR_GRAFANA_CLOUD_API_KEY

  configs:
    - name: resultsbot
      scrape_configs:
        - job_name: resultsbot
          static_configs:
            - targets: ['localhost:9090']
              labels:
                job: resultsbot
                environment: production
```

3. **Add Grafana Agent to your Dockerfile:**

```dockerfile
# Add before the CMD line
RUN wget https://github.com/grafana/agent/releases/download/v0.38.1/grafana-agent-linux-amd64.zip && \
    unzip grafana-agent-linux-amd64.zip && \
    mv grafana-agent-linux-amd64 /usr/local/bin/grafana-agent && \
    chmod +x /usr/local/bin/grafana-agent

COPY grafana-agent.yml /etc/grafana-agent.yml

# Modify CMD to run both bot and agent
CMD grafana-agent --config.file=/etc/grafana-agent.yml & npm start
```

4. **Add secrets to Fly.io:**
   ```bash
   fly secrets set GRAFANA_CLOUD_USERNAME="your_prometheus_username"
   fly secrets set GRAFANA_CLOUD_API_KEY="your_api_key"
   ```

#### Option B: Direct Scraping (if exposing metrics publicly)

If your bot's metrics endpoint is publicly accessible:

1. In Grafana Cloud, go to "Connections" → "Data sources" → "Add data source"
2. Select "Prometheus"
3. Configure:
   - **Name:** Resultsbot
   - **URL:** `https://your-bot.fly.dev:9090`
   - **Scrape interval:** 30s
   - **HTTP Method:** GET
4. Click "Save & test"

### Step 3: Import Dashboard

1. In Grafana Cloud, click "+" → "Import dashboard"
2. Click "Upload JSON file"
3. Select the `grafana-dashboard.json` file from the project
4. Select your Prometheus data source
5. Click "Import"

You should now see the Resultsbot dashboard with all metrics visualized!

### Step 4: Set Up Alerts (Optional but Recommended)

Create alerts for critical issues:

#### High Error Rate Alert

1. Go to "Alerting" → "Alert rules" → "New alert rule"
2. Configure:
   - **Name:** High Command Error Rate
   - **Query:** 
     ```promql
     rate(resultsbot_commands_total{status="error"}[5m]) > 0.1
     ```
   - **Condition:** Alert when above 0.1 errors/second
   - **For:** 5 minutes
   - **Notification:** Email/Slack/Discord webhook

#### Bot Down Alert

1. Create new alert rule:
   - **Name:** Bot Down
   - **Query:**
     ```promql
     up{job="resultsbot"} == 0
     ```
   - **Condition:** Alert when down
   - **For:** 2 minutes
   - **Notification:** Email/Slack/Discord webhook

#### High Memory Usage Alert

1. Create new alert rule:
   - **Name:** High Memory Usage
   - **Query:**
     ```promql
     nodejs_heap_size_used_bytes{job="resultsbot"} > 200000000
     ```
   - **Condition:** Alert when heap > 200MB
   - **For:** 10 minutes
   - **Notification:** Email/Slack/Discord webhook

### Step 5: Set Up Notification Channels

1. Go to "Alerting" → "Contact points" → "New contact point"
2. Choose your preferred method:
   - **Email:** Enter your email
   - **Discord:** Create a webhook in Discord channel settings
   - **Slack:** Create a Slack webhook
   - **PagerDuty:** For critical alerts
3. Test the notification
4. Link it to your alert rules

---

## 🔔 Part 3: UptimeRobot Setup

UptimeRobot monitors your bot's availability and sends alerts if it goes down.

### Step 1: Create Account

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free account (free tier includes 50 monitors)
3. Verify your email

### Step 2: Add Bot Monitor

1. Click "Add New Monitor"
2. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Resultsbot Production
   - **URL:** `https://your-bot.fly.dev:9090/metrics`
   - **Monitoring Interval:** 5 minutes (free tier)
   - **Monitor Timeout:** 30 seconds
   - **HTTP Method:** GET
3. Click "Create Monitor"

### Step 3: Set Up Alerts

1. Go to "My Settings" → "Alert Contacts"
2. Add alert contact:
   - **Type:** Email, SMS, or webhook
   - **Friendly Name:** Primary Alert
   - **Email/Phone:** Your contact info
3. Enable alerts for the monitor

### Step 4: Create Status Page (Optional)

1. Go to "Public Status Pages" → "Add New Status Page"
2. Select your monitor
3. Configure:
   - **Page Title:** Resultsbot Status
   - **Custom domain:** (optional)
   - **Show uptime:** Yes
4. Share the public URL with your friends/server

---

## 📱 Part 4: Sentry Error Tracking (Already Configured)

Sentry is already integrated in the codebase for error tracking.

### Enable Sentry

1. Go to [sentry.io](https://sentry.io)
2. Create a free account
3. Create new project (select Node.js)
4. Copy your DSN
5. Add to your environment:
   ```bash
   # In .env.local
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

6. Deploy with Sentry enabled:
   ```bash
   fly secrets set SENTRY_DSN="your_dsn_here"
   fly deploy
   ```

All unhandled errors will now be automatically reported to Sentry with full stack traces and context.

---

## 🎯 Part 5: Metrics Reference

### Custom Metrics Exposed

| Metric | Type | Description | Labels |
|--------|------|-------------|--------|
| `resultsbot_commands_total` | Counter | Total commands executed | `command_name`, `status` |
| `resultsbot_command_duration_seconds` | Histogram | Command execution time | `command_name` |
| `resultsbot_jobs_posted_total` | Counter | Jobs posted to Discord | `source` |
| `resultsbot_birthdays_celebrated_total` | Counter | Birthdays celebrated | - |
| `resultsbot_random_tags_total` | Counter | Random tags sent | `user` |
| `resultsbot_redis_operations_total` | Counter | Redis operations | `operation`, `status` |
| `resultsbot_db_query_duration_seconds` | Histogram | Database query duration | `query_type` |
| `resultsbot_discord_api_latency_ms` | Histogram | Discord API latency | - |

### Node.js Default Metrics

The bot also exposes standard Node.js metrics:
- `process_cpu_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_heap_size_total_bytes` - Total heap size
- `nodejs_heap_size_used_bytes` - Used heap size
- `nodejs_eventloop_lag_seconds` - Event loop lag
- `nodejs_active_handles_total` - Active handles
- `nodejs_active_requests_total` - Active requests

---

## 🔍 Part 6: Useful Queries

### PromQL Queries for Troubleshooting

**Commands per minute:**
```promql
rate(resultsbot_commands_total[5m]) * 60
```

**Error rate percentage:**
```promql
(rate(resultsbot_commands_total{status="error"}[5m]) / rate(resultsbot_commands_total[5m])) * 100
```

**Memory growth over time:**
```promql
deriv(process_resident_memory_bytes[1h])
```

**Average command duration by command:**
```promql
rate(resultsbot_command_duration_seconds_sum[5m]) / rate(resultsbot_command_duration_seconds_count[5m])
```

**Jobs posted today:**
```promql
increase(resultsbot_jobs_posted_total[24h])
```

**Redis operation success rate:**
```promql
(rate(resultsbot_redis_operations_total{status="success"}[5m]) / rate(resultsbot_redis_operations_total[5m])) * 100
```

---

## 🚨 Troubleshooting

### Metrics Endpoint Not Responding

1. Check bot is running: `fly status`
2. Check logs: `fly logs`
3. Verify port 9090 is exposed in `fly.toml`
4. Test locally first: `curl http://localhost:9090/metrics`

### Grafana Not Receiving Metrics

1. Verify Grafana Agent is running
2. Check agent logs for errors
3. Verify remote write credentials
4. Test data source connection in Grafana

### Alerts Not Firing

1. Check alert rule query returns data
2. Verify notification channel is configured
3. Check alert evaluation interval
4. Review alert history in Grafana

### UptimeRobot Showing Down

1. Verify bot is responding: `curl https://your-bot.fly.dev:9090/metrics`
2. Check Fly.io status
3. Review bot logs for crashes
4. Verify SSL certificate is valid

---

## 📝 Best Practices

1. **Set up alerts gradually** - Start with critical alerts, add more over time
2. **Monitor alert fatigue** - Too many alerts = ignored alerts
3. **Review dashboards weekly** - Look for trends and anomalies
4. **Set SLOs** - Define what "good" looks like (e.g., 99.9% uptime, <100ms p95 latency)
5. **Document incidents** - When alerts fire, document what happened and how you fixed it
6. **Regular dashboard reviews** - Update dashboards as the bot evolves

---

## 🎉 Monitoring Checklist

- [ ] Prometheus metrics endpoint accessible
- [ ] Grafana Cloud account created
- [ ] Prometheus data source configured
- [ ] Dashboard imported and working
- [ ] Critical alerts configured
- [ ] Notification channels set up and tested
- [ ] UptimeRobot monitor created
- [ ] Sentry error tracking enabled
- [ ] Status page created (optional)
- [ ] Team members have access

---

## 📚 Additional Resources

- [Prometheus Query Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/)
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/)
- [UptimeRobot Documentation](https://uptimerobot.com/api/)
- [Sentry Node.js Guide](https://docs.sentry.io/platforms/node/)

---

**Need help?** Open an issue on GitHub or check the main README for support links.


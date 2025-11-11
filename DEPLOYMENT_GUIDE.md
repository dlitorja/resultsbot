# Deployment Guide - Fly.io

This guide walks you through deploying Resultsbot to Fly.io, a platform offering free tier hosting perfect for Discord bots.

---

## 🎯 Prerequisites

Before deploying, ensure you have:

- [ ] Tested the bot locally and it works
- [ ] Discord bot token and client ID
- [ ] Supabase database set up with schema
- [ ] Upstash Redis database created
- [ ] All environment variables documented
- [ ] Registered Discord slash commands

---

## 💰 Fly.io Free Tier

Fly.io offers generous free tier limits:
- 3 shared-cpu-1x VMs with 256MB RAM each
- 3GB persistent volume storage
- 160GB outbound data transfer

**Perfect for a Discord bot!** Your bot will run 24/7 at no cost.

---

## 🚀 Part 1: Initial Setup

### Step 1: Install Fly CLI

**Windows (PowerShell):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Verify installation:**
```bash
fly version
```

### Step 2: Create Fly.io Account

```bash
fly auth signup
```

Or if you already have an account:
```bash
fly auth login
```

This will open your browser for authentication.

### Step 3: Verify Account

After signing up, verify your email and add payment method (required even for free tier, but you won't be charged).

---

## 📦 Part 2: Prepare Your App

### Step 1: Review fly.toml

Your `fly.toml` is already configured, but let's review key settings:

```toml
app = "resultsbot"                    # Your app name (must be globally unique)
primary_region = "sjc"                # San Jose - change to closest region

[http_service]
  internal_port = 9090                # Prometheus metrics port
  force_https = true
  auto_stop_machines = false          # Keep bot running 24/7
  auto_start_machines = true
  min_machines_running = 1            # Always have 1 instance
```

### Step 2: Update App Name (if needed)

If "resultsbot" is taken, change it in `fly.toml`:

```toml
app = "resultsbot-yourname"
```

### Step 3: Choose Your Region

Pick the region closest to your users:

| Region Code | Location |
|-------------|----------|
| `sjc` | San Jose, California |
| `ord` | Chicago, Illinois |
| `iad` | Ashburn, Virginia |
| `lhr` | London, UK |
| `fra` | Frankfurt, Germany |
| `nrt` | Tokyo, Japan |
| `syd` | Sydney, Australia |

See all regions: `fly platform regions`

---

## 🚢 Part 3: Deploy Your Bot

### Step 1: Launch App

From your project directory:

```bash
fly launch
```

You'll see:
```
? Choose an app name (leave blank to generate one): resultsbot
? Choose a region for deployment: San Jose, California (US) (sjc)
? Would you like to set up a Postgresql database now? No
? Would you like to set up an Upstash Redis database now? No
? Would you like to deploy now? No
```

**Important:** 
- Choose your app name
- Select your region
- Say **No** to Postgresql (we use Supabase)
- Say **No** to Upstash (we already have one)
- Say **No** to deploy (we need to set secrets first)

### Step 2: Set Secrets

Secrets are encrypted environment variables. Set all required variables:

```bash
# Required Discord Configuration
fly secrets set DISCORD_TOKEN="your_discord_bot_token_here"
fly secrets set DISCORD_CLIENT_ID="your_discord_client_id_here"
fly secrets set DISCORD_GUILD_ID="your_discord_guild_id_here"

# Required Database Configuration
fly secrets set SUPABASE_URL="https://your-project.supabase.co"
fly secrets set SUPABASE_KEY="your_supabase_anon_key"

# Required Redis Configuration
fly secrets set UPSTASH_REDIS_URL="https://your-redis.upstash.io"
fly secrets set UPSTASH_REDIS_TOKEN="your_upstash_redis_token"
```

**Optional but recommended:**

```bash
# User IDs for features
fly secrets set SAM_USER_ID="sam_discord_user_id"
fly secrets set JORDAN_USER_ID="jordan_discord_user_id"

# Job posting
fly secrets set JOB_CHANNEL_ID="discord_channel_id_for_jobs"
fly secrets set ADZUNA_APP_ID="your_adzuna_app_id"
fly secrets set ADZUNA_APP_KEY="your_adzuna_app_key"

# Monitoring
fly secrets set SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
```

**Verify secrets:**
```bash
fly secrets list
```

### Step 3: Deploy!

```bash
fly deploy
```

This will:
1. Build your Docker image
2. Push it to Fly.io registry
3. Deploy to your selected region
4. Start the bot

**Watch the deployment:**
```bash
fly status
```

### Step 4: View Logs

Check if the bot started successfully:

```bash
fly logs
```

You should see:
```
🚀 Starting Resultsbot...
Environment: production
✅ Logged in as YourBot#1234
✅ Database connection successful
✅ Redis connection successful
🎂 Birthday checker started
🎲 Random tagger started
💼 Job poster started
📊 Metrics server listening on port 9090
✅ All systems operational!
```

---

## 🔧 Part 4: Post-Deployment

### Step 1: Verify Bot is Online

1. Check Discord - your bot should show as online
2. Try a slash command: `/toxic` or `/listbirthdays`
3. Check metrics: `https://your-app.fly.dev:9090/metrics`

### Step 2: Monitor the Bot

```bash
# Real-time logs
fly logs

# VM status
fly status

# SSH into the VM (if needed)
fly ssh console

# Restart the bot
fly apps restart resultsbot
```

### Step 3: Set Up Autoscaling (Optional)

By default, the bot runs 1 instance. For high-traffic bots:

```bash
# Scale to 2 instances
fly scale count 2

# Scale memory (if needed)
fly scale memory 512
```

---

## 🔄 Part 5: GitHub Actions (Automated Deployment)

Your repository includes GitHub Actions for automatic deployment on push to main.

### Step 1: Get Fly.io API Token

```bash
fly auth token
```

Copy the token that's printed.

### Step 2: Add GitHub Secret

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `FLY_API_TOKEN`
5. Value: [paste your token]
6. Click "Add secret"

### Step 3: Push to Main

Now whenever you push to `main` branch:

```bash
git add .
git commit -m "Update bot"
git push origin main
```

GitHub Actions will:
1. Run linter
2. Check formatting
3. Type check
4. Run tests
5. Deploy to Fly.io automatically

**View deployment status:** Go to your repo → Actions tab

---

## 🐛 Part 6: Troubleshooting

### Bot Won't Start

**Check logs:**
```bash
fly logs
```

**Common issues:**
- Missing secrets: `fly secrets list`
- Invalid Discord token
- Database connection failed
- Redis connection failed

**Solution:**
1. Verify all secrets are set correctly
2. Test locally first: `npm run dev`
3. Check Supabase and Upstash dashboards

### Bot Crashes or Restarts

**Check resource usage:**
```bash
fly status
fly vm status
```

**Check for memory issues:**
```bash
fly logs | grep -i memory
```

**Solution:**
- Increase memory: `fly scale memory 512`
- Check for memory leaks in code
- Review Sentry for errors

### Commands Not Working

**Register commands to production:**

```bash
# Update your .env.local with production GUILD_ID
# Or register globally (takes up to 1 hour):
npm run register-commands
```

**Verify bot permissions:**
- Check bot has necessary permissions in Discord
- Verify `DISCORD_GUILD_ID` matches your server

### Can't Access Metrics Endpoint

**Check if port is accessible:**
```bash
curl https://your-app.fly.dev:9090/metrics
```

**If it fails:**
- Verify `http_service.internal_port = 9090` in `fly.toml`
- Check firewall settings
- Redeploy: `fly deploy`

### High Latency or Slow Responses

**Check region:**
```bash
fly status
```

**Move to closer region:**
```bash
fly regions list
fly regions add ord      # Add Chicago
fly regions remove sjc   # Remove San Jose
```

### Database Connection Errors

**Verify Supabase is accessible:**
```bash
fly ssh console
curl https://your-project.supabase.co
```

**Check secrets:**
```bash
fly secrets list
```

**Recreate secret if needed:**
```bash
fly secrets set SUPABASE_URL="correct_url"
```

---

## 🔐 Part 7: Security Best Practices

### Secrets Management

✅ **DO:**
- Use `fly secrets` for all sensitive data
- Rotate tokens regularly
- Use different credentials for dev/prod
- Enable 2FA on all services

❌ **DON'T:**
- Commit secrets to git
- Share secrets in Discord/Slack
- Use same password everywhere
- Disable SSL/HTTPS

### Discord Bot Security

1. **Bot Permissions:** Only grant necessary permissions
2. **Admin Commands:** Use `setDefaultMemberPermissions(PermissionFlagsBits.Administrator)`
3. **Input Validation:** Always validate user input
4. **Rate Limiting:** Prevent abuse with cooldowns

### Database Security

1. **Use Supabase RLS:** Enable Row Level Security
2. **Limit Privileges:** Use read-only keys where possible
3. **Backup Regularly:** Enable Supabase automatic backups
4. **Monitor Access:** Check Supabase logs for suspicious activity

---

## 💰 Part 8: Cost Management

### Monitor Usage

1. **Fly.io Dashboard:** [fly.io/dashboard](https://fly.io/dashboard)
   - Check resource usage
   - Review billing
   - Set up alerts

2. **Set Spending Limit:**
   ```bash
   fly orgs billing
   ```

### Stay Within Free Tier

Current configuration uses:
- ✅ 1 VM × 256MB RAM = Free
- ✅ ~1GB outbound/month = Free
- ✅ No persistent storage = Free

**To avoid charges:**
- Don't scale beyond 3 VMs
- Keep memory at 256MB
- Monitor bandwidth usage

### Optimize Costs

1. **Reduce logging:** Lower log verbosity in production
2. **Cache aggressively:** Use Redis for frequently accessed data
3. **Batch operations:** Post jobs in batches, not individually
4. **Monitor metrics:** Use Grafana to track resource usage

---

## 🎯 Part 9: Deployment Checklist

### Pre-Deployment

- [ ] Bot tested locally
- [ ] All tests passing
- [ ] Linter passing
- [ ] Environment variables documented
- [ ] Database schema applied
- [ ] Slash commands registered

### Deployment

- [ ] Fly.io account created and verified
- [ ] App launched with `fly launch`
- [ ] All secrets configured
- [ ] Successfully deployed with `fly deploy`
- [ ] Bot shows online in Discord
- [ ] Commands work in production

### Post-Deployment

- [ ] Logs reviewed, no errors
- [ ] Metrics endpoint accessible
- [ ] Monitoring set up (Grafana/UptimeRobot)
- [ ] Alerts configured
- [ ] GitHub Actions configured
- [ ] Documentation updated
- [ ] Team members have access

---

## 📈 Part 10: Scaling & Optimization

### When to Scale

Scale up if you notice:
- Commands timing out
- High CPU usage (>80%)
- High memory usage (>200MB)
- Event loop lag
- Frequent restarts

### Horizontal Scaling (More Instances)

```bash
# Add more instances
fly scale count 2

# Auto-scale based on load
fly autoscale set min=1 max=3
```

### Vertical Scaling (More Resources)

```bash
# Increase RAM
fly scale memory 512

# Upgrade CPU
fly scale vm shared-cpu-2x
```

### Performance Tips

1. **Connection Pooling:** Supabase already does this
2. **Redis Caching:** Cache frequently accessed data
3. **Rate Limiting:** Prevent abuse
4. **Lazy Loading:** Load commands on-demand
5. **Database Indexing:** Add indexes to frequently queried columns

---

## 🔄 Part 11: Rollback & Recovery

### Rollback to Previous Version

```bash
# List releases
fly releases

# Rollback to previous version
fly releases rollback
```

### Manual Recovery

```bash
# Restart the app
fly apps restart resultsbot

# Redeploy current version
fly deploy

# Scale down and up (force restart)
fly scale count 0
fly scale count 1
```

### Database Backup & Restore

Supabase automatically backs up your database. To restore:

1. Go to Supabase Dashboard → Backups
2. Select backup
3. Click "Restore"

---

## 📚 Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [Fly.io Status](https://status.flyio.net/)
- [Discord.js Guide - Hosting](https://discordjs.guide/improving-dev-environment/hosting.html)
- [Monitoring Setup Guide](./MONITORING_SETUP.md)

---

## 🆘 Getting Help

**Bot not working?**
1. Check logs: `fly logs`
2. Check status: `fly status`
3. Check Discord bot status
4. Review Sentry errors
5. Open GitHub issue

**Fly.io issues?**
- [Community Forum](https://community.fly.io/)
- [Discord Server](https://fly.io/discord)
- Email: support@fly.io

---

## 🎉 Success!

Your bot should now be running 24/7 on Fly.io. 

**Next steps:**
- Set up monitoring dashboards
- Configure alerts
- Invite friends to use the bot
- Monitor performance and iterate

---

**Happy deploying! 🚀**


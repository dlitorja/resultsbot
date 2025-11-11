# Resultsbot Setup Guide

## 🎉 Your Bot is Ready!

The project has been fully scaffolded and is ready for development. Here's what you need to do next:

---

## 📋 Immediate Next Steps

### 1. Install Dependencies

```bash
cd C:\Users\dlito\Resultsbot
npm install
```

This will install all the required packages (~50 packages for the full stack).

### 2. Set Up Your Accounts

You need to create accounts and get credentials for:

#### Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Go to "OAuth2" → "URL Generator"
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Read Messages`, `Use Slash Commands`, `Manage Roles`
6. Copy the generated URL and invite the bot to your server
7. Copy your Client ID from "General Information"
8. Enable "Server Members Intent" and "Message Content Intent" in Bot settings

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the URL and `anon` key
5. Go to SQL Editor and run the contents of `database/schema.sql`

#### Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Create a free Redis database
3. Copy the REST URL and token

#### Sentry (Optional)
1. Go to [sentry.io](https://sentry.io)
2. Create a new project (Node.js)
3. Copy the DSN

#### UptimeRobot (Optional)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Set up after deployment to monitor your bot

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual credentials
notepad .env.local  # or use your preferred editor
```

**Required variables:**
- `DISCORD_TOKEN` - From Discord Developer Portal
- `DISCORD_CLIENT_ID` - From Discord Developer Portal
- `DISCORD_GUILD_ID` - Your Discord server ID (Enable Developer Mode in Discord, right-click server, Copy ID)
- `SUPABASE_URL` - From Supabase dashboard
- `SUPABASE_KEY` - From Supabase dashboard
- `UPSTASH_REDIS_URL` - From Upstash dashboard
- `UPSTASH_REDIS_TOKEN` - From Upstash dashboard

**Feature-specific variables:**
- `SAM_USER_ID` - Sam's Discord user ID (for /toxic command)
- `JORDAN_USER_ID` - Jordan's Discord user ID (for random tagging)
- `JOB_CHANNEL_ID` - Channel ID where jobs should be posted

**Optional:**
- `SENTRY_DSN` - For error tracking
- `ADZUNA_APP_ID` - For job posting (get from developer.adzuna.com)
- `ADZUNA_APP_KEY` - For job posting (get from developer.adzuna.com)

### 4. Register Slash Commands

```bash
npm run register-commands
```

This registers your bot's slash commands with Discord.

### 5. Start the Bot

```bash
# Development mode (with hot reload)
npm run dev
```

If everything is configured correctly, you should see:
```
✅ Logged in as YourBot#1234
✅ Database connection successful
✅ Redis connection successful
🚀 Resultsbot is ready!
```

---

## 🧪 Testing Your Bot

Try these commands in your Discord server:

1. `/toxic` - Should tag Sam (if SAM_USER_ID is set)
2. `/addbirthday @user 1990-05-15` - Add a birthday (admin only)
3. `/listbirthdays` - Show upcoming birthdays
4. `/testjobs` - Manually trigger job posting (admin only, for testing)

---

## 🚀 Deployment to Fly.io (When Ready)

### First Time Setup

1. **Install Fly CLI**
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Launch the app**
   ```bash
   fly launch
   ```
   
   Follow the prompts:
   - Choose app name (or use suggested)
   - Choose region (closest to you)
   - Don't set up Postgres (we're using Supabase)
   - Don't deploy yet

4. **Set secrets**
   ```bash
   fly secrets set DISCORD_TOKEN="your_token_here"
   fly secrets set DISCORD_CLIENT_ID="your_client_id"
   fly secrets set DISCORD_GUILD_ID="your_guild_id"
   fly secrets set SUPABASE_URL="your_supabase_url"
   fly secrets set SUPABASE_KEY="your_supabase_key"
   fly secrets set UPSTASH_REDIS_URL="your_redis_url"
   fly secrets set UPSTASH_REDIS_TOKEN="your_redis_token"
   fly secrets set SAM_USER_ID="sam_user_id"
   fly secrets set JORDAN_USER_ID="jordan_user_id"
   fly secrets set JOB_CHANNEL_ID="channel_id"
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

---

## 🎓 Learning Resources

### Technologies Used

- [Discord.js Guide](https://discordjs.guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Prometheus Client](https://github.com/siimon/prom-client)
- [Luxon Documentation](https://moment.github.io/luxon/)
- [Vitest Documentation](https://vitest.dev/)

---

## 📝 Development Workflow

### Before Committing

```bash
# Run linter
npm run lint

# Check formatting
npm run format:check

# Run type check
npm run typecheck

# Run tests
npm test
```

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/my-new-feature

# Make changes and commit
git add .
git commit -m "Add my new feature"

# Push to GitHub (after creating remote)
git push origin feature/my-new-feature
```

---

## 🔧 Adding New Features

### Adding a New Command

1. Create file in `src/bot/commands/mycommand.ts`:

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mycommand')
    .setDescription('My command description'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Hello from my command!');
  },
};
```

2. Register commands: `npm run register-commands`
3. Restart the bot

### Adding a New Cron Job

1. Create file in `src/bot/jobs/myjob.ts`
2. Import and start it in `src/start.ts`

---

## 🐛 Troubleshooting

### Bot doesn't respond to commands
- Check bot has proper permissions in Discord
- Verify `DISCORD_GUILD_ID` matches your server
- Check bot status is "Online" in Discord
- Run `npm run register-commands` again

### Database errors
- Verify Supabase credentials
- Check you ran the schema SQL
- Check Supabase project is active

### Redis errors
- Verify Upstash credentials
- Check your Upstash database is active
- Free tier has limits - check usage

### Build errors
- Delete `node_modules` and `dist` folders
- Run `npm install` again
- Check TypeScript version

---

## 🎯 Feature Implementation Order

We recommend implementing features in this order:

1. ✅ Basic bot setup (DONE)
2. ✅ Birthday system (DONE)
3. ✅ Toxic command (DONE)
4. ✅ Random tagger (DONE)
5. ✅ Job posting service (DONE)
6. 🔲 Set up monitoring dashboards
7. 🔲 Write tests
8. 🔲 Deploy to production
9. 🔲 Link summarization (future)

---

## 📊 Monitoring URLs

Once deployed:
- Metrics: `https://your-app.fly.dev:9090/metrics`
- Logs: `fly logs` (via CLI)
- Sentry: [sentry.io](https://sentry.io) dashboard
- UptimeRobot: [uptimerobot.com](https://uptimerobot.com) dashboard

---

## 🎉 You're All Set!

Your bot is fully scaffolded with:
- ✅ Modern TypeScript setup
- ✅ Discord.js v14 with slash commands
- ✅ Database (Supabase) and caching (Redis)
- ✅ Structured logging and metrics
- ✅ Error tracking ready
- ✅ CI/CD pipeline configured
- ✅ Production-ready deployment setup

**Next:** Install dependencies and start coding! 🚀

---

For questions or issues, check:
- README.md for general documentation
- PROJECT_PLAN.md for the full project plan
- GitHub Issues (once you push to GitHub)

Happy coding! 🎮


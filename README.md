# Resultsbot 🤖

A fun Discord bot with both serious and joke features, built with modern technologies and best practices.

## ✨ Features

### Serious Features
- **Job Postings**: Automatically fetch and share creator/game industry job postings
- **Birthday System**: Track and automatically celebrate birthdays
- **Monitoring**: Full observability with Prometheus, Grafana, and Sentry

### Fun Features
- **`/toxic`**: Call out Sam for being toxic ☢️
- **Random Tagging**: Randomly tag Jordan 1-5 times per month 🎲

## 🛠️ Tech Stack

- **Discord.js v14** - Discord bot framework
- **TypeScript** - Type safety
- **Supabase** - PostgreSQL database
- **Upstash Redis** - Caching and rate limiting
- **Pino** - Structured logging
- **Prometheus + Grafana** - Metrics and dashboards
- **Sentry** - Error tracking
- **Luxon** - Date/time handling
- **Vitest** - Testing framework
- **Fly.io** - Deployment platform

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- Supabase Account ([supabase.com](https://supabase.com))
- Upstash Redis Account ([upstash.com](https://upstash.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/resultsbot.git
   cd resultsbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your actual credentials:
   - Discord bot token, client ID, and guild ID
   - Supabase URL and key
   - Upstash Redis URL and token
   - (Optional) Sentry DSN, job API keys

4. **Set up the database**
   
   Run the schema SQL in your Supabase SQL editor:
   ```bash
   # Copy contents of database/schema.sql to Supabase SQL Editor
   ```

5. **Register Discord commands**
   ```bash
   npm run register-commands
   ```

6. **Start the bot**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 📝 Available Commands

### Bot Commands

- `/toxic` - Call out Sam for being toxic
- `/addbirthday <user> <date>` - Add a birthday (Admin only)
- `/listbirthdays` - List upcoming birthdays
- `/jobsearch [keywords]` - Search for jobs (Coming soon)

### Development Commands

```bash
npm run dev              # Start in development mode
npm run build            # Build TypeScript
npm start                # Start production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run test             # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run typecheck        # Type check without building
```

## 🏗️ Project Structure

```
resultsbot/
├── src/
│   ├── bot/
│   │   ├── commands/       # Slash commands
│   │   ├── events/         # Discord event handlers
│   │   ├── jobs/           # Cron jobs
│   │   └── index.ts        # Bot client
│   ├── services/
│   │   ├── jobs/           # Job posting service
│   │   ├── birthdays/      # Birthday logic
│   │   ├── randomTagger/   # Random tagger logic
│   │   └── cache/          # Redis cache
│   ├── database/
│   │   └── supabase.ts     # Database client
│   ├── config/
│   │   ├── env.ts          # Environment validation
│   │   └── constants.ts    # App constants
│   └── utils/
│       ├── logger.ts       # Pino logger
│       └── metrics.ts      # Prometheus metrics
├── database/
│   └── schema.sql          # Database schema
├── tests/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions
└── ...
```

## 🚢 Deployment

### Deploying to Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io**
   ```bash
   fly auth login
   ```

3. **Create a new app**
   ```bash
   fly launch
   ```

4. **Set environment secrets**
   ```bash
   fly secrets set DISCORD_TOKEN="your_token"
   fly secrets set DISCORD_CLIENT_ID="your_client_id"
   fly secrets set DISCORD_GUILD_ID="your_guild_id"
   fly secrets set SUPABASE_URL="your_supabase_url"
   fly secrets set SUPABASE_KEY="your_supabase_key"
   fly secrets set UPSTASH_REDIS_URL="your_redis_url"
   fly secrets set UPSTASH_REDIS_TOKEN="your_redis_token"
   # Add other secrets as needed
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

### GitHub Actions (Auto-deployment)

The project includes GitHub Actions for automatic deployment:

1. Add `FLY_API_TOKEN` to your repository secrets
2. Push to `main` branch to trigger deployment

## 🔧 Configuration

All configuration is done via environment variables. See `.env.example` for a complete list.

### Key Configuration Options

- `DISCORD_TOKEN` - Your Discord bot token
- `DISCORD_CLIENT_ID` - Your Discord application client ID
- `DISCORD_GUILD_ID` - Your Discord server ID
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anonymous key
- `UPSTASH_REDIS_URL` - Your Upstash Redis REST URL
- `UPSTASH_REDIS_TOKEN` - Your Upstash Redis token
- `SAM_USER_ID` - Sam's Discord user ID (for /toxic command)
- `JORDAN_USER_ID` - Jordan's Discord user ID (for random tagging)

## 📊 Monitoring

### Prometheus Metrics

The bot exposes Prometheus metrics on port 9090 (configurable):

- Command execution counts and duration
- Job postings shared
- Birthdays celebrated
- Random tags sent
- Redis operations
- Database query duration

Access metrics at: `http://localhost:9090/metrics`

### Grafana Dashboards

Connect Grafana Cloud to your Prometheus endpoint to visualize:
- Bot uptime and health
- Command usage patterns
- Error rates
- System resources

### Sentry Error Tracking

Errors are automatically reported to Sentry (if configured) for debugging.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 🤝 Contributing

Contributions are welcome! This is an open-source learning project.

### Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- Follow ESLint and Prettier rules
- Write tests for new features
- Update `.env.example` if adding new environment variables
- Document complex logic with comments
- **Never commit secrets** - use `.env.local`

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Discord.js](https://discord.js.org/)
- Hosted on [Fly.io](https://fly.io)
- Database by [Supabase](https://supabase.com)
- Caching by [Upstash](https://upstash.com)

## 📧 Support

Having issues? Please open an issue on GitHub or reach out to the maintainers.

---

Made with ❤️ and TypeScript


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

### 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions for local development
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deploy to Fly.io production
- **[MONITORING_SETUP.md](./MONITORING_SETUP.md)** - Set up Grafana, Prometheus, and UptimeRobot
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing guide with examples
- **[.env.example](./.env.example)** - All environment variables explained

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

### Quick Start

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh  # macOS/Linux
# or
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"  # Windows

# Login and deploy
fly auth login
fly launch
fly secrets set DISCORD_TOKEN="..." SUPABASE_URL="..." # ... all secrets
fly deploy
```

### Complete Guide

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed instructions including:
- Full setup walkthrough with screenshots
- Setting all environment secrets
- GitHub Actions for auto-deployment
- Troubleshooting common issues
- Monitoring and scaling
- Cost optimization tips
- Security best practices

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

The bot includes comprehensive observability with Prometheus metrics, Grafana dashboards, and error tracking.

### Quick Overview

- **Metrics Endpoint:** `http://localhost:9090/metrics` (or your Fly.io URL)
- **Metrics Tracked:**
  - Command execution counts and duration
  - Job postings shared
  - Birthdays celebrated
  - Random tags sent
  - Redis operations
  - Database query duration
  - System resources (CPU, memory, event loop)

### Full Setup

See **[MONITORING_SETUP.md](./MONITORING_SETUP.md)** for complete instructions on:
- Setting up Grafana Cloud with pre-built dashboards
- Configuring alerts for critical issues
- Setting up UptimeRobot for availability monitoring
- Connecting Sentry for error tracking
- Useful PromQL queries for troubleshooting

## 🧪 Testing

The project includes comprehensive tests for all commands, services, and cron jobs.

### Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run full CI check (lint + format + typecheck + coverage)
npm run ci
```

### Test Coverage

- ✅ **Commands** - `/toxic`, `/addbirthday`, `/listbirthdays`, `/testjobs`
- ✅ **Services** - Job fetcher, formatter, constants
- ✅ **Cron Jobs** - Birthday checker, random tagger
- ✅ **Mocks** - Discord.js, Supabase, Redis

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for detailed information on:
- Writing tests
- Using mocks
- Debugging tests
- Best practices
- Coverage reports

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
- **Use modern, non-deprecated APIs** - Always check for deprecation warnings and use current best practices (see PROJECT_PLAN.md for details)

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


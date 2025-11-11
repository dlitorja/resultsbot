# Discord Bot Project Plan
*Non-serious Discord bot for friends with some actually useful features*

---

## ðŸŽ¯ Project Overview

A fun Discord bot for a friends server that combines joke features with practical functionality. Built with modern technologies to learn new tools while keeping everything completely free (or nearly free).

**Deployment Target:** Fly.io  
**Primary Goal:** Free deployment with robust architecture  
**Secondary Goal:** Learning opportunity for new technologies  
**Open Source:** This project will be publicly available on GitHub, GitLab, and potentially BitBucket

### ðŸ”“ Open Source Strategy
This bot will be **fully open source** to share with the community and demonstrate best practices. All sensitive information (tokens, API keys, database credentials) will be:
- Stored in `.env.local` (gitignored)
- Never committed to version control
- Documented via `.env.example` with placeholder values
- Abstracted through environment variable validation (Zod)

---

## âœ¨ Features

### 1. **Job Posting System** (SERIOUS FEATURE)
Retrieve and share job postings for creator/game industry jobs in a dedicated channel.

**Implementation:**
- Use **Adzuna API** or **RapidAPI Job Search APIs** (free tiers)
- Scheduled checks (e.g., daily or twice daily)
- Post new jobs to designated channel
- Cache posted jobs in Redis to avoid duplicates
- Store job history in Supabase

### 2. **`/toxic` Command**
Tags friend Sam with a message calling him toxic.

### 3. **Random Jordan Tagging**
Randomly tags friend Jordan 1-5 times per month at unpredictable intervals.

### 4. **Birthday System**
Replace third-party birthday bot with custom solution.

### 5. **Link Summarization** (FUTURE FEATURE - DEFERRED)
*Deferred until financially feasible*

---

## ðŸ› ï¸ Technology Stack

- **Discord.js v14**, **Node.js 18+**, **TypeScript**, **Supabase**
- **tsx**, **ESLint + Prettier**, **Zod**, **Vitest**
- **node-cron**
- **Redis (Upstash)**
- **Luxon**
- **Sentry**, **Pino**, **UptimeRobot**, **Prometheus + Grafana Cloud**
- **Fly.io**, **GitHub Actions**

---

*See full plan in repository documentation*

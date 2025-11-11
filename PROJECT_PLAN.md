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

## 📐 Code Quality & Best Practices

### **Staying Current with Technology**

**Critical Principle:** Always use modern, non-deprecated APIs and patterns.

#### Guidelines:
- **Before implementing:** Check official documentation for deprecation warnings
- **Prefer modern alternatives:** Use current, recommended approaches over legacy methods
- **Monitor updates:** Keep dependencies up-to-date with non-breaking changes
- **Plan for deprecations:** When a feature is marked "soon-to-be deprecated," migrate proactively

#### Examples of Modern Practices We Follow:
- ✅ **ES Modules** (`import/export`) instead of CommonJS (`require`)
- ✅ **Native Fetch API** (Node 18+) instead of `node-fetch` library
- ✅ **Discord.js v14 interactions** instead of message commands
- ✅ **Slash commands** (modern) instead of prefix commands (legacy)
- ✅ **TypeScript's modern syntax** following latest stable features
- ✅ **Luxon** instead of deprecated Moment.js
- ✅ **Vitest** (modern) instead of older testing frameworks

#### Deprecation Monitoring:
- Check release notes when updating packages
- Review Discord.js changelogs for API changes
- Follow Node.js LTS schedule
- Subscribe to library deprecation notices
- Use `npm outdated` regularly to check for updates

#### When in Doubt:
1. Check official documentation first
2. Look for "Recommended" or "Best Practice" sections
3. Review recent GitHub issues/discussions
4. Choose the approach that will be maintained long-term
5. Document why a particular approach was chosen

**Goal:** Build a codebase that remains maintainable and modern for years, not just today.

---

*See full plan in repository documentation*

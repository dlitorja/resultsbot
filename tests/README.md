# Test Suite

This directory contains all tests for Resultsbot.

## 📁 Structure

```
tests/
├── README.md                   # This file
├── setup.ts                    # Global test setup & environment
│
├── mocks/                      # Mock objects & data
│   ├── discord.ts              # Discord.js mocks (interaction, client, user, channel)
│   ├── supabase.ts             # Supabase client mocks & sample data
│   ├── redis.ts                # Redis client mock with in-memory storage
│   └── jobs.ts                 # Job data mocks (Adzuna responses, formatted jobs)
│
├── commands/                   # Slash command tests
│   ├── toxic.test.ts           # /toxic command
│   ├── addbirthday.test.ts     # /addbirthday command
│   ├── listbirthdays.test.ts   # /listbirthdays command
│   └── testjobs.test.ts        # /testjobs command
│
├── services/                   # Service layer tests
│   ├── jobFetcher.test.ts      # Job API fetching & filtering
│   ├── jobFormatter.test.ts    # Job embed formatting
│   └── constants.test.ts       # Job constants & priority logic
│
└── jobs/                       # Cron job tests
    ├── birthdayChecker.test.ts # Birthday checking logic
    └── randomTagger.test.ts    # Random tagging logic
```

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Interactive UI
npm run test:ui
```

## 📝 Writing Tests

### Import Test Utilities

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockInteraction } from '../mocks/discord.js';
```

### Basic Test

```typescript
describe('My Feature', () => {
  it('should work correctly', () => {
    expect(myFunction()).toBe('expected');
  });
});
```

### Async Test

```typescript
it('should handle promises', async () => {
  const result = await asyncFunction();
  expect(result).toBe('value');
});
```

### Mock External Modules

```typescript
vi.mock('../../src/database/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));
```

## 🎭 Using Mocks

### Discord Mocks

```typescript
import { createMockInteraction } from '../mocks/discord.js';

const interaction = createMockInteraction({
  user: { id: 'custom_id', username: 'TestUser' },
  options: { date: '2024-11-10' },
  commandName: 'mycommand',
});

await command.execute(interaction);

expect(interaction.reply).toHaveBeenCalledWith('expected message');
```

### Database Mocks

```typescript
import { mockBirthdays } from '../mocks/supabase.js';

// Use predefined sample data
expect(mockBirthdays).toHaveLength(2);
expect(mockBirthdays[0].user_id).toBe('123456789');
```

### Redis Mocks

```typescript
import { createMockRedisClient } from '../mocks/redis.js';

const redis = createMockRedisClient();
await redis.set('key', 'value');
const result = await redis.get('key');

expect(result).toBe('value');
```

## 📊 Coverage

Target coverage: **70%** for lines, functions, branches, and statements.

View coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## 🔍 Debugging

### Run Single Test File

```bash
npx vitest tests/commands/toxic.test.ts
```

### Run Single Test

```bash
npx vitest -t "should reply with toxic message"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

## 📚 More Information

See **[TESTING_GUIDE.md](../TESTING_GUIDE.md)** for comprehensive documentation.

## ✅ Test Checklist

When adding new features, ensure you:

- [ ] Write tests for happy path
- [ ] Write tests for error cases
- [ ] Mock all external dependencies
- [ ] Test edge cases
- [ ] Keep tests fast (<100ms each)
- [ ] Use descriptive test names
- [ ] Maintain >70% coverage
- [ ] Run `npm run ci` before committing

---

**Happy testing! 🧪**


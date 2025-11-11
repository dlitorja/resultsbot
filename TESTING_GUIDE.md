# Testing Guide

Comprehensive guide for testing the Resultsbot Discord bot.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Mocking](#mocking)
- [Coverage](#coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

---

## 🎯 Overview

This project uses **Vitest** as the testing framework. Vitest is:
- Fast (powered by Vite)
- Modern (ES modules, TypeScript support)
- Compatible with Jest API
- Built-in coverage with V8

### Test Coverage

The test suite covers:
- ✅ **Commands** - All slash commands (`/toxic`, `/addbirthday`, `/listbirthdays`, `/testjobs`)
- ✅ **Services** - Job fetcher, job formatter, Redis caching
- ✅ **Cron Jobs** - Birthday checker, random tagger, job poster
- ✅ **Utilities** - Mocks for Discord.js, Supabase, Redis

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with UI (interactive browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests with coverage and UI
npm run test:coverage:ui

# Run full CI check (lint + format + typecheck + coverage)
npm run ci
```

### Environment

Tests automatically use the test environment with mocked credentials (see `tests/setup.ts`).

You don't need to set up a `.env.local` file for testing.

---

## 📁 Test Structure

```
tests/
├── setup.ts                    # Global test setup
├── mocks/                      # Mock objects
│   ├── discord.ts              # Discord.js mocks
│   ├── supabase.ts             # Supabase mocks
│   ├── redis.ts                # Redis mocks
│   └── jobs.ts                 # Job data mocks
├── commands/                   # Command tests
│   ├── toxic.test.ts
│   ├── addbirthday.test.ts
│   ├── listbirthdays.test.ts
│   └── testjobs.test.ts
├── services/                   # Service tests
│   ├── jobFetcher.test.ts
│   ├── jobFormatter.test.ts
│   └── constants.test.ts
└── jobs/                       # Cron job tests
    ├── birthdayChecker.test.ts
    └── randomTagger.test.ts
```

---

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Testing Commands

```typescript
import { createMockInteraction } from '../mocks/discord.js';
import myCommand from '../../src/bot/commands/mycommand.js';

it('should reply with correct message', async () => {
  const interaction = createMockInteraction();
  
  await myCommand.execute(interaction);
  
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.stringContaining('expected text')
  );
});
```

### Testing with Mocked Databases

```typescript
import { mockBirthdays } from '../mocks/supabase.js';

vi.mock('../../src/database/supabase.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        data: mockBirthdays,
        error: null,
      }),
    })),
  },
}));

it('should fetch birthdays', async () => {
  const { supabase } = await import('../../src/database/supabase.js');
  const result = await supabase.from('birthdays').select('*');
  
  expect(result.data).toEqual(mockBirthdays);
});
```

### Testing API Calls

```typescript
global.fetch = vi.fn();

vi.mocked(global.fetch).mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'test' }),
} as Response);

it('should call API', async () => {
  await fetchData();
  
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('api.example.com')
  );
});
```

---

## 🎭 Mocking

### Discord.js Mocks

```typescript
import { 
  createMockInteraction, 
  createMockClient,
  createMockUser,
  createMockChannel 
} from '../mocks/discord.js';

// Mock interaction with custom options
const interaction = createMockInteraction({
  user: { id: 'custom_id' },
  options: { date: '2024-11-10' },
});

// Mock client
const client = createMockClient({
  guilds: { /* custom guilds */ },
});
```

### Supabase Mocks

```typescript
import { createMockSupabaseClient, mockBirthdays } from '../mocks/supabase.js';

// Use predefined mock data
expect(mockBirthdays).toHaveLength(2);

// Create custom mock client
const supabase = createMockSupabaseClient();
```

### Redis Mocks

```typescript
import { createMockRedisClient } from '../mocks/redis.js';

const redis = createMockRedisClient();

await redis.set('key', 'value');
const result = await redis.get('key');

expect(result).toBe('value');
expect(redis._storage.size).toBe(1); // Access internal storage
```

---

## 📊 Coverage

### Viewing Coverage

After running `npm run test:coverage`, you'll see:

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.42 |    78.15 |   87.23 |   85.42 |
 bot/commands       |   90.12 |    85.32 |   92.45 |   90.12 |
  addbirthday.ts    |   88.43 |    82.14 |   90.00 |   88.43 |
  toxic.ts          |   95.23 |    90.48 |   100.0 |   95.23 |
 services/jobs      |   82.34 |    75.21 |   85.12 |   82.34 |
  jobFetcher.ts     |   78.92 |    70.15 |   80.45 |   78.92 |
  jobFormatter.ts   |   92.15 |    88.76 |   95.34 |   92.15 |
--------------------|---------|----------|---------|---------|
```

HTML coverage report: `coverage/index.html`

### Coverage Goals

Current thresholds (in `vitest.config.ts`):
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

These will fail the build if not met.

### Excluded from Coverage

- `node_modules/`
- `dist/`
- `tests/`
- `*.d.ts` (TypeScript declaration files)
- `*.config.*` (Configuration files)
- `src/bot/registerCommands.ts` (CLI script)
- `src/start.ts` (Entry point)

---

## 🔄 CI/CD Integration

### GitHub Actions

Tests run automatically on every push (see `.github/workflows/deploy.yml`):

```yaml
- name: Run tests
  run: npm run test
```

### Pre-deployment Checks

The CI pipeline runs:
1. ✅ Linter (`npm run lint`)
2. ✅ Format check (`npm run format:check`)
3. ✅ Type check (`npm run typecheck`)
4. ✅ Tests (`npm run test`)

If any fail, deployment is blocked.

### Running CI Locally

```bash
npm run ci
```

This runs all checks in sequence, just like CI.

---

## 💡 Best Practices

### 1. Test Naming

Use descriptive test names:

```typescript
// ❌ Bad
it('works', () => { ... });

// ✅ Good
it('should return formatted job embed with all fields', () => { ... });
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should add birthday successfully', async () => {
  // Arrange
  const mockUser = createMockUser({ id: '123' });
  const interaction = createMockInteraction({ options: { user: mockUser } });
  
  // Act
  await command.execute(interaction);
  
  // Assert
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.stringContaining('added')
  );
});
```

### 3. Test One Thing at a Time

```typescript
// ❌ Bad - tests multiple things
it('should work', () => {
  expect(result.name).toBe('John');
  expect(result.age).toBe(30);
  expect(result.email).toContain('@');
});

// ✅ Good - separate tests
it('should have correct name', () => {
  expect(result.name).toBe('John');
});

it('should have correct age', () => {
  expect(result.age).toBe(30);
});

it('should have valid email', () => {
  expect(result.email).toContain('@');
});
```

### 4. Clean Up After Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers(); // If using fake timers
});
```

### 5. Use Snapshots Sparingly

Snapshots are great for embeds and complex objects:

```typescript
it('should create correct embed', () => {
  const embed = formatJobEmbed(mockJob);
  expect(embed).toMatchSnapshot();
});
```

But don't overuse - they make tests brittle.

### 6. Test Edge Cases

```typescript
describe('formatSalary', () => {
  it('should handle min and max', () => { ... });
  it('should handle only min', () => { ... });
  it('should handle only max', () => { ... });
  it('should handle no salary', () => { ... });
  it('should handle predicted salary', () => { ... });
});
```

### 7. Mock External Dependencies

Always mock:
- ❌ Discord API calls
- ❌ Database queries
- ❌ HTTP requests
- ❌ File system operations
- ❌ Environment-specific code

### 8. Use Type Safety

```typescript
// ✅ Good - TypeScript will catch errors
const interaction: ChatInputCommandInteraction = createMockInteraction();

// ❌ Bad - Loses type safety
const interaction = createMockInteraction() as any;
```

### 9. Test Error Handling

```typescript
it('should handle database errors gracefully', async () => {
  vi.mocked(supabase.from).mockReturnValueOnce({
    select: vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Connection failed' },
    }),
  } as any);
  
  await command.execute(interaction);
  
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.stringContaining('error')
  );
});
```

### 10. Keep Tests Fast

- Mock slow operations
- Avoid real network calls
- Don't sleep unnecessarily
- Use parallel execution (Vitest default)

---

## 🐛 Debugging Tests

### Running Single Test File

```bash
npx vitest tests/commands/toxic.test.ts
```

### Running Single Test

```bash
npx vitest -t "should reply with toxic message"
```

### Debug Mode

```bash
# Node inspector
npx vitest --inspect-brk

# VS Code: Add to launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

### Verbose Output

```bash
npx vitest --reporter=verbose
```

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Discord.js Testing Guide](https://discordjs.guide/creating-your-bot/testing.html)
- [Testing Best Practices](https://testingjavascript.com/)

---

## 🎯 Quick Reference

### Common Matchers

```typescript
expect(value).toBe(expected);                  // Strict equality (===)
expect(value).toEqual(expected);               // Deep equality
expect(value).toBeTruthy();                    // Truthy check
expect(value).toBeFalsy();                     // Falsy check
expect(value).toBeNull();                      // Null check
expect(value).toBeUndefined();                 // Undefined check
expect(value).toBeDefined();                   // Not undefined
expect(value).toBeGreaterThan(num);           // >
expect(value).toBeLessThan(num);              // <
expect(string).toContain(substring);          // Substring check
expect(string).toMatch(/regex/);              // Regex match
expect(array).toHaveLength(num);              // Array length
expect(array).toContain(item);                // Array includes
expect(fn).toHaveBeenCalled();                // Mock called
expect(fn).toHaveBeenCalledWith(args);        // Mock called with
expect(fn).toHaveBeenCalledTimes(num);        // Mock call count
expect(promise).resolves.toBe(value);         // Async resolve
expect(promise).rejects.toThrow(error);       // Async reject
```

### Common Mocking

```typescript
// Mock function
const fn = vi.fn();
fn.mockReturnValue('value');
fn.mockResolvedValue('async value');
fn.mockRejectedValue(new Error('fail'));

// Mock module
vi.mock('module-name', () => ({
  export: vi.fn(),
}));

// Spy on object
const spy = vi.spyOn(object, 'method');

// Fake timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

---

**Happy testing! 🧪**


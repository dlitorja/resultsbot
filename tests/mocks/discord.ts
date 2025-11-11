/**
 * Mock Discord.js objects for testing
 */

import { vi } from 'vitest';

export function createMockInteraction(overrides: any = {}) {
  const optionsData = overrides.options || {};
  
  const mockInteraction = {
    user: {
      id: '123456789',
      username: 'TestUser',
      tag: 'TestUser#1234',
      ...overrides.user,
    },
    guild: {
      id: 'test_guild_id',
      name: 'Test Guild',
      ...overrides.guild,
    },
    channel: {
      id: 'test_channel_id',
      name: 'test-channel',
      send: vi.fn().mockResolvedValue({}),
      ...overrides.channel,
    },
    member: {
      id: '123456789',
      permissions: {
        has: vi.fn().mockReturnValue(true),
      },
      ...overrides.member,
    },
    reply: vi.fn().mockResolvedValue({}),
    editReply: vi.fn().mockResolvedValue({}),
    deferReply: vi.fn().mockResolvedValue({}),
    followUp: vi.fn().mockResolvedValue({}),
    options: {
      get: vi.fn((name: string) => optionsData[name]),
      getString: vi.fn((name: string, required?: boolean) => optionsData[name]),
      getUser: vi.fn((name: string, required?: boolean) => optionsData[name]),
      getInteger: vi.fn((name: string, required?: boolean) => optionsData[name]),
    },
    commandName: overrides.commandName || 'test',
  };
  
  // Don't spread overrides at the end to avoid overwriting options
  return mockInteraction;
}

export function createMockClient(overrides = {}) {
  return {
    user: {
      id: 'bot_user_id',
      username: 'TestBot',
      tag: 'TestBot#0000',
      ...overrides.user,
    },
    guilds: {
      cache: new Map([
        [
          'test_guild_id',
          {
            id: 'test_guild_id',
            name: 'Test Guild',
            channels: {
              cache: new Map([
                [
                  'general',
                  {
                    id: 'general',
                    name: 'general',
                    isTextBased: () => true,
                    send: vi.fn().mockResolvedValue({}),
                  },
                ],
              ]),
              fetch: vi.fn().mockResolvedValue({
                id: 'test_channel_id',
                isTextBased: () => true,
                send: vi.fn().mockResolvedValue({}),
              }),
            },
          },
        ],
      ]),
      ...overrides.guilds,
    },
    channels: {
      fetch: vi.fn().mockResolvedValue({
        id: 'test_channel_id',
        name: 'test-channel',
        isTextBased: () => true,
        send: vi.fn().mockResolvedValue({}),
      }),
      ...overrides.channels,
    },
    login: vi.fn().mockResolvedValue('token'),
    on: vi.fn(),
    once: vi.fn(),
    emit: vi.fn(),
    ...overrides,
  };
}

export function createMockUser(overrides = {}) {
  return {
    id: '123456789',
    username: 'TestUser',
    tag: 'TestUser#1234',
    bot: false,
    discriminator: '1234',
    ...overrides,
  };
}

export function createMockChannel(overrides = {}) {
  return {
    id: 'test_channel_id',
    name: 'test-channel',
    type: 0, // TEXT
    isTextBased: () => true,
    send: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

export function createMockEmbed(overrides = {}) {
  return {
    title: 'Test Embed',
    description: 'Test description',
    fields: [],
    color: 0x0099ff,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}


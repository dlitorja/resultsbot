/**
 * Quick script to test if Discord token is valid
 * Run with: node scripts/test-discord-token.js
 */

import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

// Load .env.local
dotenv.config({ path: '.env.local' });

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ DISCORD_TOKEN not found in .env.local');
  process.exit(1);
}

console.log('🔍 Testing Discord token...');
console.log(`Token length: ${token.length} characters`);
console.log(`Token starts with: ${token.substring(0, 10)}...`);
console.log('');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log('✅ Token is VALID!');
  console.log(`✅ Logged in as: ${client.user.tag}`);
  console.log(`✅ Bot ID: ${client.user.id}`);
  console.log(`✅ Guilds: ${client.guilds.cache.size}`);
  console.log('');
  console.log('🎉 Your Discord token works correctly!');
  console.log('');
  console.log('📝 Next: Make sure these intents are enabled in Discord Developer Portal:');
  console.log('   - MESSAGE CONTENT INTENT ✓');
  console.log('   - SERVER MEMBERS INTENT ✓');
  console.log('   - PRESENCE INTENT (optional)');
  console.log('');
  client.destroy();
  process.exit(0);
});

client.on('error', (error) => {
  console.error('❌ Discord Client Error:');
  console.error(error);
  process.exit(1);
});

// Set timeout for login attempt
setTimeout(() => {
  console.error('❌ Login timed out after 10 seconds');
  console.error('');
  console.error('Possible issues:');
  console.error('  1. Invalid token - regenerate in Discord Developer Portal');
  console.error('  2. Required intents not enabled - check Gateway Intents');
  console.error('  3. Network connectivity issues');
  console.error('  4. Token has extra spaces/newlines - check .env.local');
  console.log('');
  process.exit(1);
}, 10000);

// Attempt login
client.login(token).catch((error) => {
  console.error('❌ Failed to login to Discord:');
  console.error('');
  console.error(`Error: ${error.message}`);
  console.error('');
  console.error('Common causes:');
  console.error('  1. Invalid token - Token may have been regenerated');
  console.error('  2. Privileged intents not enabled:');
  console.error('     → Go to https://discord.com/developers/applications');
  console.error('     → Select your application');
  console.error('     → Go to "Bot" section');
  console.error('     → Enable "MESSAGE CONTENT INTENT"');
  console.error('     → Enable "SERVER MEMBERS INTENT"');
  console.error('  3. Token format issue - Remove quotes/spaces');
  console.error('');
  process.exit(1);
});


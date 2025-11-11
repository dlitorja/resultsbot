# Discord Bot Setup Checklist

**Issue Found:** `Used disallowed intents` - Your bot token is valid but Gateway Intents are not enabled!

---

## ✅ Required Steps to Fix

### Step 1: Enable Gateway Intents

1. **Go to Discord Developer Portal:**
   - Visit: https://discord.com/developers/applications
   - You'll need to login if you aren't already

2. **Select Your Bot Application:**
   - Find and click on your bot from the list
   - (Look for the one matching your CLIENT_ID from .env.local)

3. **Navigate to Bot Settings:**
   - Click "Bot" in the left sidebar menu

4. **Scroll Down to "Privileged Gateway Intents"**

5. **Enable These Intents:** ⚠️ **CRITICAL**
   ```
   ☐ PRESENCE INTENT (optional - for seeing online status)
   ☑️ SERVER MEMBERS INTENT (REQUIRED - for member events)
   ☑️ MESSAGE CONTENT INTENT (REQUIRED - for reading messages)
   ```

6. **Save Changes:**
   - Click "Save Changes" button at the bottom
   - You'll see a confirmation message

---

### Step 2: Verify Token is Still Valid

Run the test script to verify:

```powershell
node scripts/test-discord-token.js
```

**Expected output:**
```
✅ Token is VALID!
✅ Logged in as: YourBot#1234
✅ Bot ID: 123456789...
✅ Guilds: 1
🎉 Your Discord token works correctly!
```

**If you see errors:**
- Token might be invalid/expired
- Go back to step 1 and verify intents are enabled
- You may need to regenerate the token (see below)

---

### Step 3: (If Needed) Regenerate Token

**Only do this if the token test fails:**

1. Go to Discord Developer Portal → Your App → Bot
2. Click "Reset Token"
3. Copy the new token (you only get to see it once!)
4. Update your `.env.local`:
   ```env
   DISCORD_TOKEN=your_new_token_here
   ```
5. Update Fly.io secret:
   ```powershell
   fly secrets set DISCORD_TOKEN="your_new_token_here"
   ```

---

### Step 4: Redeploy

Once intents are enabled and token is verified:

```powershell
# Rebuild and deploy
npm run build
fly deploy
```

---

## 🔍 Troubleshooting

### Issue: "Invalid Bot Token"

**Solution:**
1. Regenerate token in Developer Portal
2. Update `.env.local`
3. Run `.\scripts\set-fly-secrets.ps1` to update Fly.io
4. Redeploy with `fly deploy`

### Issue: Bot still crash-looping after enabling intents

**Wait 1-2 minutes** - Discord can take a moment to propagate intent changes.

Then restart the machines:
```powershell
fly machines restart --app resultsbot
```

### Issue: Token has extra spaces/newlines

Check your `.env.local` file:
```env
# ❌ Bad (has quotes and spaces)
DISCORD_TOKEN = " MTQz... "

# ✅ Good (no quotes, no spaces)
DISCORD_TOKEN=MTQzNzYyMj...
```

---

## 📝 What Gateway Intents Do

### SERVER MEMBERS INTENT
- Required to see guild members
- Needed for birthday system
- Needed for tagging users

### MESSAGE CONTENT INTENT
- Required to read message content
- Needed for the bot to function properly
- Discord requires explicit opt-in

### PRESENCE INTENT  
- Optional
- Allows seeing online/offline status
- Good for enhanced features

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Intents enabled in Discord Developer Portal
- [ ] Test script passes: `node scripts/test-discord-token.js`
- [ ] Bot shows as online in Discord
- [ ] Can run slash commands in your server
- [ ] No crash loops in `fly logs`

---

## 🚀 Once Fixed, Deploy

```powershell
# Test locally first
npm run dev

# If working locally, deploy to Fly.io
fly deploy

# Watch logs
fly logs
```

You should see:
```
✅ Logged in as YourBot#1234
✅ All systems operational!
🎂 Birthday checker started
🎲 Random tagger started
💼 Job poster started
```

---

## 📞 Still Having Issues?

1. **Check bot permissions in your Discord server**
   - Right-click the server → Server Settings → Roles
   - Find your bot's role
   - Ensure it has required permissions

2. **Verify bot is invited to server**
   - The bot must be a member of the server
   - Guild ID in secrets must match your server

3. **Check Discord status**
   - Visit: https://discordstatus.com
   - Ensure Discord API is operational

---

**Next:** Once intents are enabled, rerun the token test then redeploy! 🚀


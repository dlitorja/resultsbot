# Generate Discord bot invite URL

$envFile = Get-Content .env.local
$clientId = ($envFile | Select-String "DISCORD_CLIENT_ID" | ForEach-Object { $_ -replace 'DISCORD_CLIENT_ID=','' }).Trim('"').Trim("'")

$permissions = "2416045056" # Send Messages, Embed Links, Use Slash Commands, etc.
$url = "https://discord.com/api/oauth2/authorize?client_id=$clientId" + "&permissions=$permissions" + "&scope=bot%20applications.commands"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Bot Invite URL" -ForegroundColor Green  
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host $url -ForegroundColor Yellow
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. Copy the URL above" -ForegroundColor White
Write-Host "2. Paste it in your browser" -ForegroundColor White
Write-Host "3. Select your Discord server" -ForegroundColor White
Write-Host "4. Click 'Authorize'" -ForegroundColor White
Write-Host ""


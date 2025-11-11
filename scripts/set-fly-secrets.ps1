# PowerShell script to set Fly.io secrets from .env.local
# Run this script to transfer your environment variables to Fly.io

Write-Host "Setting Fly.io secrets from .env.local..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Error: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your credentials first." -ForegroundColor Yellow
    exit 1
}

# Read .env.local and parse it
$envVars = @{}
Get-Content .env.local | ForEach-Object {
    $line = $_.Trim()
    # Skip empty lines and comments
    if ($line -and -not $line.StartsWith('#')) {
        if ($line -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            # Remove quotes if present
            $value = $value.Trim('"').Trim("'")
            if ($value) {
                $envVars[$key] = $value
            }
        }
    }
}

Write-Host "Found $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

# Required secrets
$requiredSecrets = @(
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID',
    'DISCORD_GUILD_ID',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'UPSTASH_REDIS_URL',
    'UPSTASH_REDIS_TOKEN'
)

# Check if all required secrets are present
$missingSecrets = @()
foreach ($secret in $requiredSecrets) {
    if (-not $envVars.ContainsKey($secret) -or -not $envVars[$secret]) {
        $missingSecrets += $secret
    }
}

if ($missingSecrets.Count -gt 0) {
    Write-Host "Missing required secrets:" -ForegroundColor Red
    $missingSecrets | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Please add these to your .env.local file and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "All required secrets found!" -ForegroundColor Green
Write-Host ""
Write-Host "Setting secrets in Fly.io (this may take a moment)..." -ForegroundColor Cyan
Write-Host ""

# Set each secret
$secretCount = 0
foreach ($key in $envVars.Keys) {
    # Skip NODE_ENV and other non-secret configs
    if ($key -in @('NODE_ENV', 'PROMETHEUS_PORT', 'DEFAULT_TIMEZONE')) {
        Write-Host "Skipping $key (not a secret)" -ForegroundColor Gray
        continue
    }
    
    Write-Host "Setting $key..." -ForegroundColor Yellow
    $value = $envVars[$key]
    
    # Use fly secrets set
    fly secrets set "$key=$value" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SUCCESS: $key set" -ForegroundColor Green
        $secretCount++
    } else {
        Write-Host "  FAILED: $key" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Set $secretCount secrets successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify: fly secrets list" -ForegroundColor White
Write-Host "  2. Deploy: fly deploy" -ForegroundColor White
Write-Host "  3. Monitor: fly logs" -ForegroundColor White
Write-Host ""
Write-Host "Ready to deploy!" -ForegroundColor Green

# PowerShell script to clean Cloudflare API token
# Removes whitespace, newlines, and validates format

Write-Host ""
Write-Host "🔧 Cloudflare API Token Cleaner" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you clean your API token from spaces/newlines." -ForegroundColor Yellow
Write-Host ""

# Get token from user
Write-Host "Paste your Cloudflare API token below and press Enter:" -ForegroundColor White
Write-Host "(It's safe - this script only runs locally)" -ForegroundColor Gray
$token = Read-Host

Write-Host ""
Write-Host "📋 Analyzing token..." -ForegroundColor Cyan
Write-Host ""

# Original length
$originalLength = $token.Length
Write-Host "Original length: $originalLength characters" -ForegroundColor White

# Clean token (remove all whitespace, newlines, carriage returns)
$cleanToken = $token.Trim() -replace '\s+', ''

# Cleaned length
$cleanLength = $cleanToken.Length
Write-Host "Cleaned length: $cleanLength characters" -ForegroundColor White

# Check if cleaning made a difference
if ($originalLength -ne $cleanLength) {
    Write-Host ""
    Write-Host "⚠️  WARNING: Found whitespace/newlines!" -ForegroundColor Yellow
    Write-Host "   Removed: $($originalLength - $cleanLength) characters" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Cleaned token:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host $cleanToken -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Validate format
if ($cleanLength -lt 20) {
    Write-Host "❌ ERROR: Token seems too short ($cleanLength chars)" -ForegroundColor Red
    Write-Host "   Cloudflare API tokens are usually 40+ characters" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please verify you copied the complete token from Cloudflare." -ForegroundColor Yellow
    exit 1
}

# Check for spaces (shouldn't happen after cleaning, but double-check)
if ($cleanToken -match '\s') {
    Write-Host "❌ ERROR: Token still contains spaces!" -ForegroundColor Red
    Write-Host "   This shouldn't happen. Please copy token again." -ForegroundColor Red
    exit 1
}

# Check format (should be alphanumeric with underscore/hyphen)
if ($cleanToken -notmatch '^[a-zA-Z0-9_-]+$') {
    Write-Host "⚠️  WARNING: Token contains unusual characters" -ForegroundColor Yellow
    Write-Host "   Expected: letters, numbers, underscores, hyphens only" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "✅ Token format looks valid!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. The cleaned token has been copied to your clipboard!" -ForegroundColor White
Write-Host "2. Go to GitHub: Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "3. Delete old CLOUDFLARE_API_TOKEN (if exists)" -ForegroundColor White
Write-Host "4. Create new secret:" -ForegroundColor White
Write-Host "   Name: CLOUDFLARE_API_TOKEN" -ForegroundColor White
Write-Host "   Value: [Ctrl+V to paste cleaned token]" -ForegroundColor White
Write-Host "5. Click 'Add secret'" -ForegroundColor White
Write-Host ""

# Copy to clipboard (works on Windows)
try {
    Set-Clipboard -Value $cleanToken
    Write-Host "✅ Token copied to clipboard!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠️  Could not copy to clipboard automatically" -ForegroundColor Yellow
    Write-Host "   Please copy the token manually from above" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


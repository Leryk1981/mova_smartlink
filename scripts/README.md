# Helper Scripts

Utility scripts for managing MOVA Smartlink deployment.

## clean-token - Cloudflare API Token Cleaner

Helps fix the common "invalid header value" error by cleaning your API token from whitespace and newlines.

### Why do you need this?

When copying the Cloudflare API token, you might accidentally include:
- Leading/trailing spaces
- Newline characters
- Tab characters
- Other invisible whitespace

This causes the error:
```
Headers.set: "***\n  ***" is an invalid header value
```

The script cleans your token and validates it before you add it to GitHub Secrets.

### Usage

#### Windows (PowerShell)

```powershell
# Run the script
.\scripts\clean-token.ps1

# Paste your token when prompted
# The script will:
# 1. Clean the token
# 2. Validate format
# 3. Copy to clipboard automatically
# 4. Show instructions
```

#### Linux/Mac (Bash)

```bash
# Make script executable
chmod +x scripts/clean-token.sh

# Run the script
./scripts/clean-token.sh

# Or with token as argument
./scripts/clean-token.sh "your-token-here"
```

### What the script does

1. ✅ Removes all whitespace (spaces, tabs, newlines)
2. ✅ Trims leading/trailing characters
3. ✅ Validates token length (should be 40+ chars)
4. ✅ Checks for invalid characters
5. ✅ Shows cleaned token for copying
6. ✅ (PowerShell) Copies to clipboard automatically

### Example Output

```
🔧 Cloudflare API Token Cleaner
================================

Paste your Cloudflare API token below and press Enter:
[you paste token here]

📋 Analyzing token...

Original length: 48 characters
Cleaned length: 45 characters

⚠️  WARNING: Found whitespace/newlines!
   Removed: 3 characters

✅ Cleaned token:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cloudflare_api_token_abc123xyz789...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Token format looks valid!

📋 Next steps:
1. Copy the cleaned token above
2. Go to GitHub: Settings → Secrets → Actions
3. Delete old CLOUDFLARE_API_TOKEN
4. Create new secret with cleaned token
```

### After cleaning

1. **Delete old secret** in GitHub
2. **Create new secret** with cleaned token
3. **Run deployment** workflow again

### Troubleshooting

**"Token seems too short"**
- You didn't copy the complete token
- Go back to Cloudflare and copy the entire token

**"Token contains unusual characters"**
- Might be OK (some tokens have special chars)
- But double-check you copied correctly

**Script doesn't run (PowerShell)**
```powershell
# Enable script execution
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\clean-token.ps1
```

**Script doesn't run (Bash)**
```bash
# Make executable
chmod +x scripts/clean-token.sh
./scripts/clean-token.sh
```

---

## Future Scripts

Additional helper scripts will be added here:
- `deploy-local.sh` - Test deployment locally
- `verify-secrets.sh` - Verify all GitHub Secrets are set
- `setup-cloudflare.sh` - Interactive Cloudflare setup

---

**See also**:
- [QUICK_START_DEPLOYMENT.md](../QUICK_START_DEPLOYMENT.md) - Deployment guide
- [docs/CLOUDFLARE_PAGES_SETUP.md](../docs/CLOUDFLARE_PAGES_SETUP.md) - Detailed setup


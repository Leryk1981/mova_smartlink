# GitHub Actions Workflows

This directory contains CI/CD workflows for the MOVA Smartlink project.

## Available Workflows

### 1. CI (Continuous Integration)
**File**: `ci.yml`  
**Trigger**: Push to any branch, Pull Requests  
**Purpose**: Build, lint, and test all packages  

**What it does**:
- ✅ Installs dependencies
- ✅ Builds core library
- ✅ Lints all packages
- ✅ Runs unit tests

**Status badge**:
```markdown
![CI](https://github.com/Leryk1981/mova_smartlink/workflows/CI/badge.svg)
```

---

### 2. Deploy Worker
**File**: `deploy-worker.yml`  
**Trigger**: Manual dispatch, Version tags (`v*.*.*`)  
**Purpose**: Deploy Worker to Cloudflare  

**Required secrets**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

**Usage**:
```
Actions → Deploy Worker → Run workflow → Select environment
```

---

### 3. Deploy Pages
**File**: `deploy-pages.yml`  
**Trigger**: Automatic on push to `main` (when SPA/core changes), Manual dispatch  
**Purpose**: Deploy Admin SPA to Cloudflare Pages  

**Required secrets**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`

**Usage**:
- **Automatic**: Push to `main` with changes in `packages/spa-admin/` or `packages/core-smartlink/`
- **Manual**: `Actions → Deploy Pages → Run workflow`

**What it does**:
1. Builds core library and SPA
2. Lints SPA code
3. Verifies build output
4. Deploys to Cloudflare Pages using wrangler-action

---

### 4. Deploy Pages (Manual Wrangler)
**File**: `deploy-pages-manual.yml`  
**Trigger**: Manual dispatch only  
**Purpose**: Alternative Pages deployment using direct wrangler CLI  

**When to use**:
- If `deploy-pages.yml` has issues with `cloudflare/wrangler-action`
- For troubleshooting deployment problems
- When you need more control over the deployment process

**Required secrets**: Same as Deploy Pages

**Usage**:
```
Actions → Deploy Pages (Manual Wrangler) → Run workflow
```

**Differences from `deploy-pages.yml`**:
- Uses direct `wrangler` CLI instead of GitHub Action
- More verbose logging
- Better error messages
- Includes troubleshooting steps

---

## Setup Instructions

### Prerequisites

1. **Cloudflare Account** with:
   - Account ID
   - API Token with proper permissions

2. **GitHub Secrets** configured:
   - Go to: `Settings → Secrets and variables → Actions`
   - Add required secrets (see below)

### Required GitHub Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `CLOUDFLARE_API_TOKEN` | API token for deployments | [Get token](https://dash.cloudflare.com/profile/api-tokens) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | In dashboard URL or sidebar |
| `CLOUDFLARE_PAGES_PROJECT` | Pages project name | Choose name (e.g., `mova-smartlink-admin`) |

### Setting Up Secrets

1. **Get Cloudflare API Token**:
   ```
   Cloudflare Dashboard
     → My Profile
     → API Tokens
     → Create Token
     → Use "Edit Cloudflare Workers" template
     → Create Token
     → Copy token
   ```

2. **Add to GitHub**:
   ```
   Repository Settings
     → Secrets and variables
     → Actions
     → New repository secret
     → Name: CLOUDFLARE_API_TOKEN
     → Value: [paste token]
     → Add secret
   ```

3. **Repeat for other secrets**

### Detailed Guides

- **Pages Setup**: See `docs/CLOUDFLARE_PAGES_SETUP.md`
- **Worker Setup**: See `docs/CLOUDFLARE_WORKER_SETUP.md` (if exists)

---

## Troubleshooting

### "Secrets not set" Error

**Problem**: Workflow fails with "CLOUDFLARE_API_TOKEN is not set"

**Solution**:
1. Verify secrets exist: `Settings → Secrets and variables → Actions`
2. Secret names must match exactly (case-sensitive)
3. No spaces in secret names
4. Secret values should have no leading/trailing spaces

### "Invalid header value" Error

**Problem**: Wrangler fails with header error

**Solution**:
1. API token might have newlines or spaces
2. Delete and recreate `CLOUDFLARE_API_TOKEN` secret
3. When pasting token, use Ctrl+V (don't type manually)
4. Ensure token is on a single line

### "Project not found" Error

**Problem**: Cloudflare Pages project doesn't exist

**Solution**:
- Current workflows auto-create project on first deploy
- Ensure `CLOUDFLARE_PAGES_PROJECT` matches desired name
- Name must be URL-safe (lowercase, hyphens, no spaces)

### Workflow Fails but No Clear Error

**Try this**:
1. Use `deploy-pages-manual.yml` for better error messages
2. Check workflow logs in Actions tab
3. Verify all secrets are set
4. Check API token permissions in Cloudflare
5. Ensure account has Cloudflare Pages enabled

---

## Workflow Status

You can check workflow status:

1. **In GitHub**: Go to `Actions` tab
2. **In README**: Add status badges:
   ```markdown
   ![CI](https://github.com/Leryk1981/mova_smartlink/workflows/CI/badge.svg)
   ![Deploy Pages](https://github.com/Leryk1981/mova_smartlink/workflows/Deploy%20Pages/badge.svg)
   ```

---

## Manual Workflow Runs

All workflows except CI can be triggered manually:

1. Go to `Actions` tab
2. Select workflow from left sidebar
3. Click `Run workflow` button
4. Choose branch (usually `main`)
5. Click `Run workflow`

---

## Best Practices

1. **CI First**: Ensure CI passes before deploying
2. **Test Locally**: Test builds locally before pushing
3. **Review Logs**: Always check workflow logs if deployment fails
4. **Rotate Tokens**: Update API tokens periodically for security
5. **Use Manual Deploy**: Test with manual workflow before setting up automatic deploys

---

## Support

- **Documentation**: See `docs/` folder
- **Issues**: Check workflow logs in Actions tab
- **Cloudflare Docs**: https://developers.cloudflare.com/pages/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/

---

**Last Updated**: 2025-11-27


# GitHub Actions Workflows

This directory contains CI/CD workflows for MOVA Smartlink Atom v1.

## Workflows

### 1. CI - Continuous Integration
**File**: `workflows/ci.yml`  
**Trigger**: Automatic on push/PR to `main` branch

**What it does**:
- ✅ Installs dependencies
- ✅ Builds core-smartlink library
- ✅ Lints all packages (worker + SPA)
- ✅ Runs unit tests (10 tests in core-smartlink)
- ✅ Builds SPA to verify production build works
- ✅ Verifies MOVA core files are not modified

**Local equivalent**:
```bash
npm run ci
```

---

### 2. Deploy Worker
**File**: `workflows/deploy-worker.yml`  
**Trigger**: 
- Manual (workflow_dispatch) with environment selection
- Automatic on version tags (`v*.*.*`)

**What it does**:
- ✅ Builds and lints worker
- ✅ Deploys to Cloudflare Workers (production or staging)
- ✅ Verifies deployment

**Required Secrets**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_SUBDOMAIN` (optional)

**Environment**: Uses GitHub Environments for approval gates (optional)

---

### 3. Deploy Pages
**File**: `workflows/deploy-pages.yml`  
**Trigger**:
- Manual (workflow_dispatch)
- Automatic on push to `main` (when SPA files change)

**What it does**:
- ✅ Builds core-smartlink (dependency)
- ✅ Builds SPA production bundle
- ✅ Deploys to Cloudflare Pages

**Required Secrets**:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`

---

## Setting Up Secrets

### Step 1: Get Cloudflare Credentials

1. **API Token**:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use template: "Edit Cloudflare Workers"
   - Add permissions:
     - Account > Cloudflare Pages > Edit
     - Account > Workers Scripts > Edit
   - Copy the token (you'll only see it once!)

2. **Account ID**:
   - Go to: https://dash.cloudflare.com/
   - Select any site/domain
   - Copy "Account ID" from the right sidebar

3. **Pages Project Name**:
   - Go to: https://dash.cloudflare.com/ → Pages
   - Create a new project (or note existing project name)
   - Copy the project name (e.g., `smartlink-admin`)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret:

| Secret Name | Value | Required For |
|-------------|-------|--------------|
| `CLOUDFLARE_API_TOKEN` | Your API token from step 1 | Worker + Pages |
| `CLOUDFLARE_ACCOUNT_ID` | Your account ID from step 1 | Worker + Pages |
| `CLOUDFLARE_PAGES_PROJECT` | Your Pages project name | Pages only |
| `CLOUDFLARE_SUBDOMAIN` | Your workers.dev subdomain | Worker only (optional) |

### Step 3: Configure Worker Production Settings

Before first deployment, update `packages/worker-smartlink/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV_SMARTLINK_RULES"
id = "your_production_kv_id"  # ← Replace with actual KV namespace ID
preview_id = "your_preview_kv_id"

[env.production]
name = "smartlink-worker"  # Production worker name
vars = { ENVIRONMENT = "production" }
# Optional: add routes, custom domains, etc.
```

Get production KV ID:
```bash
cd packages/worker-smartlink
npx wrangler kv:namespace create "KV_SMARTLINK_RULES"
# Copy the "id" value to wrangler.toml
```

---

## Testing Workflows Locally

### Test CI workflow
```bash
# From repository root
npm install
npm run ci
```

### Test Worker deployment (local check)
```bash
cd packages/worker-smartlink
npm run lint
# If passes, Worker is ready to deploy
```

### Test SPA build
```bash
cd packages/spa-admin
npm run build
ls -lh dist/  # Should see index.html and assets
```

---

## Triggering Workflows

### CI (Automatic)
Just push or create a PR:
```bash
git push origin main
```

### Deploy Worker (Manual)
1. Go to: **Actions** → **Deploy Worker**
2. Click **"Run workflow"**
3. Select environment (production/staging)
4. Click **"Run workflow"**

### Deploy Worker (Automatic via Tag)
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Deploy Pages (Manual)
1. Go to: **Actions** → **Deploy Pages**
2. Click **"Run workflow"**
3. Click **"Run workflow"**

---

## Troubleshooting

### ❌ CI fails with "Cannot find module '@mova/core-smartlink'"
**Fix**: Core library not built. Workflow should build it first.

### ❌ Worker deployment fails with "Authentication error"
**Fix**: Check `CLOUDFLARE_API_TOKEN` is valid and has correct permissions.

### ❌ Pages deployment fails with "Project not found"
**Fix**: Verify `CLOUDFLARE_PAGES_PROJECT` matches actual project name in Cloudflare dashboard.

### ❌ KV namespace errors in Worker
**Fix**: 
1. Create KV namespace: `npx wrangler kv:namespace create "KV_SMARTLINK_RULES"`
2. Update `wrangler.toml` with production `id`
3. Redeploy

### ❌ MOVA core files modified error
**Fix**: CI detected changes to `mova-core/` directory. These files should never be modified. Reset them:
```bash
git checkout mova-core/
```

---

## Best Practices

1. **Always run CI locally before pushing**:
   ```bash
   npm run ci
   ```

2. **Test deployments in staging first**:
   - Deploy to staging environment
   - Verify functionality
   - Then deploy to production

3. **Use version tags for production releases**:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

4. **Monitor deployments**:
   - Check GitHub Actions logs
   - Monitor Cloudflare Workers analytics
   - Test deployed URLs immediately

5. **Never commit secrets**:
   - Always use GitHub Secrets
   - Never hardcode API tokens in code
   - Review changes before committing

---

## Security Notes

- API tokens have read/write access to Workers and Pages
- Use scoped tokens (not Global API Key)
- Rotate tokens periodically
- Use GitHub Environments for approval gates on production deployments
- Review deployment logs for sensitive information

---

For more details, see:
- [COMMANDS.md](../COMMANDS.md) - Command reference
- [SETUP.md](../SETUP.md) - Setup guide
- [BUILD_AND_TEST_REPORT.md](../BUILD_AND_TEST_REPORT.md) - Build verification


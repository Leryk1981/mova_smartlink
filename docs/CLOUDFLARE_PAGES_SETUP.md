# Cloudflare Pages Deployment Setup

This guide explains how to set up automatic deployment of the Smartlink Admin SPA to Cloudflare Pages via GitHub Actions.

## Prerequisites

- Cloudflare account
- GitHub repository with Actions enabled
- Admin access to both GitHub repo and Cloudflare account

## Step 1: Get Cloudflare Credentials

### 1.1 Get Account ID

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click on **Pages** in the left sidebar
3. Your **Account ID** is visible in the URL or in the right sidebar
   - Format: `https://dash.cloudflare.com/{ACCOUNT_ID}/pages`

### 1.2 Create API Token

1. Go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers** or create custom token with:
   - **Permissions**:
     - `Account` → `Cloudflare Pages` → `Edit`
   - **Account Resources**:
     - Include → `Your Account`
4. Click **Continue to summary** → **Create Token**
5. **Copy the token immediately** (you won't see it again)

### 1.3 Choose Project Name

Decide on a project name for your Pages site:
- Example: `mova-smartlink-admin` or `smartlink-spa`
- Must be URL-safe (lowercase, no spaces)
- Will be available at: `https://{PROJECT_NAME}.pages.dev`

## Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | `your-api-token` | Token from Step 1.2 |
| `CLOUDFLARE_ACCOUNT_ID` | `your-account-id` | Account ID from Step 1.1 |
| `CLOUDFLARE_PAGES_PROJECT` | `mova-smartlink-admin` | Your chosen project name |

### Adding Secrets in GitHub

```
Repository → Settings → Secrets and variables → Actions → New repository secret

Name: CLOUDFLARE_API_TOKEN
Secret: ••••••••••••••••••••••••

Name: CLOUDFLARE_ACCOUNT_ID
Secret: ••••••••••••••••••••••••

Name: CLOUDFLARE_PAGES_PROJECT
Secret: mova-smartlink-admin
```

## Step 3: Deploy

### Automatic Deployment

The workflow deploys automatically when:
- You push to `main` branch
- Changes are made to:
  - `packages/spa-admin/**`
  - `packages/core-smartlink/**`
  - `.github/workflows/deploy-pages.yml`

### Manual Deployment

Trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy Pages** workflow
3. Click **Run workflow** → **Run workflow**

## Step 4: Verify Deployment

1. Check GitHub Actions logs for deployment status
2. Visit your site: `https://{PROJECT_NAME}.pages.dev`
3. Verify the SPA loads correctly

## Step 5: Configure Production Settings (Optional)

### Custom Domain

1. Go to Cloudflare Pages → Your Project
2. Click **Custom domains** → **Set up a custom domain**
3. Follow instructions to add DNS records

### Environment Variables

If your SPA needs environment variables:

1. Go to Pages → Your Project → **Settings** → **Environment variables**
2. Add variables like:
   - `VITE_API_BASE_URL` = `https://worker.your-domain.com`
   - `VITE_ENVIRONMENT` = `production`

### Build Settings

The default build command is configured in the workflow:
```bash
npm install
npm run build:pages
```

Output directory: `packages/spa-admin/dist`

## Troubleshooting

### Error: "Project not found"

**Problem**: Cloudflare Pages project doesn't exist yet.

**Solution**: The workflow now automatically creates the project on first deploy using `wrangler pages deploy`.

### Error: "Invalid API Token"

**Problem**: API token doesn't have correct permissions.

**Solution**: 
1. Regenerate token with `Cloudflare Pages` → `Edit` permission
2. Update `CLOUDFLARE_API_TOKEN` secret in GitHub

### Error: "Build output not found"

**Problem**: SPA build failed or output directory incorrect.

**Solution**:
1. Check that `npm run build:pages` works locally
2. Verify `packages/spa-admin/dist` exists after build
3. Check GitHub Actions logs for build errors

### Pages Site Shows 404

**Problem**: Build succeeded but site doesn't load.

**Solution**:
1. Check that `index.html` exists in build output
2. Verify asset paths in built HTML are correct (should be relative)
3. Check browser console for errors

## Local Testing Before Deploy

Test the production build locally:

```bash
# Build SPA
npm run build:pages

# Preview built site
cd packages/spa-admin
npx vite preview

# Open http://localhost:4173
```

## Workflow Details

The GitHub Actions workflow:

1. ✅ Checks out code
2. ✅ Installs Node.js and dependencies
3. ✅ Lints SPA code
4. ✅ Builds core library and SPA
5. ✅ Verifies build output
6. ✅ Deploys to Cloudflare Pages using Wrangler
7. ✅ Outputs deployment URL

## Security Notes

- ⚠️ **Never commit API tokens to git**
- ✅ Always use GitHub Secrets for credentials
- ✅ Limit API token permissions to only what's needed
- ✅ Rotate tokens periodically
- ✅ Review token access in Cloudflare dashboard regularly

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Next Steps**: After Pages is deployed, configure your Worker to handle API requests from the SPA. See [Deploy Worker Guide](./CLOUDFLARE_WORKER_SETUP.md).


# Quick Start: Deploying to Cloudflare

This guide will get your Smartlink project deployed to Cloudflare in under 10 minutes.

## ⚡ TL;DR

```bash
# 1. Get Cloudflare credentials (see below)
# 2. Add 3 secrets to GitHub
# 3. Run: Actions → Deploy Pages (Manual Wrangler) → Run workflow
# 4. Done! Your SPA is live at https://[PROJECT-NAME].pages.dev
```

---

## 📋 Step-by-Step Guide

### Step 1: Get Cloudflare Credentials (5 minutes)

#### 1.1 Get Account ID

1. Go to https://dash.cloudflare.com
2. Click **Pages** in left sidebar
3. Copy **Account ID** from URL or sidebar
   - Format: `1234567890abcdef1234567890abcdef`

#### 1.2 Create API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Click **Use template** on **Edit Cloudflare Workers**
4. Click **Continue to summary**
5. Click **Create Token**
6. **Copy the entire token** (starts with `cloudflare_api_token_...`)
   - ⚠️ You won't see it again!
   - Copy the WHOLE thing (they're long)

#### 1.3 Choose Project Name

Pick a name for your site (e.g., `mova-smartlink-admin`)
- Must be lowercase, no spaces
- Will be available at: `https://your-name.pages.dev`

---

### Step 2: Add Secrets to GitHub (2 minutes)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these 3 secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| **CLOUDFLARE_API_TOKEN** | Your API token from Step 1.2 | `cloudflare_api_token_...` |
| **CLOUDFLARE_ACCOUNT_ID** | Your account ID from Step 1.1 | `1234567890abcdef...` |
| **CLOUDFLARE_PAGES_PROJECT** | Your chosen project name | `mova-smartlink-admin` |

**Important when pasting**:
- Use **Ctrl+V** (don't type)
- **No quotes** around the value
- **No spaces** before/after
- Each secret on **one line**

---

### Step 3: Deploy! (2 minutes)

You have 2 options:

#### Option A: Manual Deployment (Recommended First Time)

1. Go to **Actions** tab in GitHub
2. Click **Deploy Pages (Manual Wrangler)** in left sidebar
3. Click **Run workflow** button (right side)
4. Click **Run workflow** (green button)
5. Wait ~2 minutes
6. Visit your site: `https://[PROJECT-NAME].pages.dev`

#### Option B: Automatic Deployment

Just push changes to `main` branch:
```bash
git push origin main
```

Deploys automatically when you change:
- `packages/spa-admin/**`
- `packages/core-smartlink/**`

---

## ✅ Verify It Works

After deployment completes:

1. Check **Actions** tab - workflow should be green ✓
2. Visit your site: `https://[PROJECT-NAME].pages.dev`
3. You should see the Smartlink Admin interface

---

## 🚨 Troubleshooting

### ❌ "Secrets not set" Error

**Problem**: Workflow says secrets are missing

**Fix**:
1. Go to `Settings → Secrets and variables → Actions`
2. Check all 3 secrets exist
3. Names must be EXACT (case-sensitive)
4. Delete and recreate if unsure

---

### ❌ "Invalid header value" Error

**Problem**: API token format is wrong

**Fix**:
1. Go to Cloudflare and create NEW token
2. When copying:
   - Select ALL text (triple-click)
   - Use Ctrl+C to copy
3. In GitHub Secrets:
   - Delete old CLOUDFLARE_API_TOKEN
   - Create new one
   - Use Ctrl+V to paste (don't type!)
4. Try deployment again

---

### ❌ Workflow Fails with Wrangler Error

**Fix**:
1. Try the **Manual Wrangler** workflow instead:
   ```
   Actions → Deploy Pages (Manual Wrangler) → Run workflow
   ```
2. Check the logs for detailed error messages
3. Verify API token has **Cloudflare Pages** permission

---

### ❌ Site Deploys But Shows 404

**Problem**: Build output is wrong

**Fix**:
1. Test build locally:
   ```bash
   npm run build:pages
   ls packages/spa-admin/dist/
   ```
2. Check that `index.html` exists
3. Re-run deployment

---

## 📚 Detailed Documentation

- **Full Pages Setup**: `docs/CLOUDFLARE_PAGES_SETUP.md`
- **Workflows Guide**: `.github/workflows/README.md`
- **Troubleshooting**: See docs above

---

## 🎯 What's Next?

After successful deployment:

### 1. Deploy the Worker

```
Actions → Deploy Worker → Run workflow
```

(Requires same secrets as Pages)

### 2. Configure Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Click **Custom domains**
3. Add your domain

### 3. Set Production API URL (Optional)

If Worker is on different domain:

1. Edit `packages/spa-admin/vite.config.ts`
2. Set production API URL
3. Rebuild and redeploy

---

## 🆘 Still Having Issues?

1. **Check workflow logs**:
   - Actions tab → Click on failed run → Click on job → Read logs

2. **Use Manual workflow**:
   - Has better error messages
   - Shows detailed troubleshooting steps

3. **Verify credentials**:
   ```
   ✓ All 3 secrets exist in GitHub
   ✓ API token is valid (not expired)
   ✓ Account ID matches Cloudflare account
   ✓ Project name is URL-safe (lowercase, hyphens only)
   ```

4. **Check Cloudflare**:
   - Account has Pages enabled
   - No quota limits reached
   - Token permissions are correct

---

## 💡 Pro Tips

1. **Test locally first**:
   ```bash
   npm run build:pages
   cd packages/spa-admin
   npx vite preview
   ```

2. **Use Manual workflow for first deploy**:
   - Better error messages
   - Easier to debug
   - Can switch to automatic later

3. **Keep tokens secure**:
   - Never commit them to git
   - Rotate periodically
   - Use minimum required permissions

4. **Monitor deployments**:
   - Check Actions tab after each push
   - Set up email notifications (GitHub Settings)

---

## ✅ Success Checklist

- [ ] Got Cloudflare Account ID
- [ ] Created API Token with Pages permission
- [ ] Added all 3 secrets to GitHub
- [ ] Ran deployment workflow
- [ ] Verified site loads at .pages.dev URL
- [ ] (Optional) Configured custom domain
- [ ] (Optional) Deployed Worker

---

**Estimated Time**: 10 minutes  
**Difficulty**: Easy  
**Cost**: Free (Cloudflare Pages Free Tier)

---

**Need Help?** Check detailed guides in `docs/` folder or GitHub Actions logs.

**Ready to Deploy?** Go to: `Actions → Deploy Pages (Manual Wrangler) → Run workflow` 🚀


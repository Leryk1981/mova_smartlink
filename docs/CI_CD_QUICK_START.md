# CI/CD Quick Start Guide

**Setup Time**: ~20 minutes  
**Status**: Ready to configure ✅

---

## What Was Implemented

✅ **3 GitHub Actions Workflows**:
1. **CI** - Automatic testing on every commit
2. **Deploy Worker** - Deploy to Cloudflare Workers
3. **Deploy Pages** - Deploy Admin SPA to Cloudflare Pages

✅ **Updated .gitignore** - Proper exclusions for Node/Cloudflare/build artifacts

✅ **Updated Documentation** - CI/CD sections in README, COMMANDS, and detailed .github/README

---

## Before You Start

You need:
- [ ] Cloudflare account
- [ ] GitHub repository for this project
- [ ] 10 minutes to get Cloudflare credentials
- [ ] 10 minutes to configure GitHub secrets

---

## Step 1: Get Cloudflare Credentials (5 min)

### API Token
1. Visit: https://dash.cloudflare.com/profile/api-tokens
2. "Create Token" → "Edit Cloudflare Workers" template
3. Add permissions: Workers Scripts + Cloudflare Pages (Edit)
4. Copy token (save it - you'll only see it once!)

### Account ID
1. Visit: https://dash.cloudflare.com/
2. Select any site
3. Copy "Account ID" from right sidebar

### KV Namespace (Production)
```bash
cd packages/worker-smartlink
npx wrangler kv:namespace create "KV_SMARTLINK_RULES"
```
Copy the `id` and update in `packages/worker-smartlink/wrangler.toml`:
```toml
id = "paste_here"
```

### Pages Project
1. Visit: https://dash.cloudflare.com/ → Pages
2. "Create a project"
3. Name it: `smartlink-admin` (or your choice)
4. Remember the name

---

## Step 2: Add GitHub Secrets (5 min)

Go to: **Your Repo → Settings → Secrets and variables → Actions**

Add these secrets:

| Secret Name | Where to Get It | Required For |
|-------------|-----------------|--------------|
| `CLOUDFLARE_API_TOKEN` | From Step 1 | All deployments |
| `CLOUDFLARE_ACCOUNT_ID` | From Step 1 | All deployments |
| `CLOUDFLARE_PAGES_PROJECT` | From Step 1 | Pages deployment |

Optional:
| `CLOUDFLARE_SUBDOMAIN` | Your workers.dev subdomain | Worker URL display |

---

## Step 3: Test CI (2 min)

Push any change to `main` branch:
```bash
git add .
git commit -m "test: enable CI/CD"
git push origin main
```

Check: **GitHub → Actions** tab  
Expected: ✅ Green checkmark for "CI" workflow

---

## Step 4: Deploy (5 min)

### Deploy Worker
1. **GitHub → Actions → Deploy Worker**
2. Click "Run workflow"
3. Select "production"
4. Click "Run workflow"
5. Wait ~2 minutes

Test:
```bash
curl https://smartlink-worker.YOUR-SUBDOMAIN.workers.dev/api/smartlinks/test
```
Expected: `404` error (correct - no smartlink exists yet)

### Deploy Pages
1. **GitHub → Actions → Deploy Pages**
2. Click "Run workflow"
3. Wait ~2 minutes

Visit: `https://YOUR-PROJECT-NAME.pages.dev`  
Expected: ✅ Admin UI loads

---

## Step 5: Load Example Data (2 min)

```bash
curl -X PUT https://smartlink-worker.YOUR-SUBDOMAIN.workers.dev/api/smartlinks/spring_sale_2026 \
  -H "Content-Type: application/json" \
  --data-binary @examples/ecommerce/smartlink_rules.spring_sale_2026.json
```

Test redirect:
```bash
curl -I "https://smartlink-worker.YOUR-SUBDOMAIN.workers.dev/s/spring_sale_2026?utm_source=tiktok"
```
Expected: `302` redirect

---

## ✅ Done!

You now have:
- ✅ Automatic testing on every commit
- ✅ One-click deployments to production
- ✅ Live Worker at: `smartlink-worker.YOUR-SUBDOMAIN.workers.dev`
- ✅ Live Admin UI at: `YOUR-PROJECT.pages.dev`

---

## Daily Usage

### Making Changes
```bash
# 1. Make changes locally
# 2. Test
npm run ci

# 3. Commit and push
git push origin main

# 4. CI runs automatically ✅
```

### Deploying to Production
```bash
# Option A: Manual
# GitHub → Actions → Deploy Worker/Pages → Run workflow

# Option B: Version tag (Worker only)
git tag v1.0.1
git push origin v1.0.1
# Deploys automatically ✅
```

---

## Need Help?

- 📖 **Detailed Setup**: See `CI_CD_SETUP_CHECKLIST.md`
- 🔧 **Commands**: See `COMMANDS.md` → CI/CD section
- 📚 **Workflows Info**: See `.github/README.md`
- 🐛 **Troubleshooting**: See `CI_CD_IMPLEMENTATION_REPORT.md`

---

## Common Issues

**❌ CI fails with "Cannot find module '@mova/core-smartlink'"**  
→ Run `npm run build` locally first

**❌ Worker deploy: "Authentication error"**  
→ Check API token is valid and has correct permissions

**❌ Pages deploy: "Project not found"**  
→ Verify `CLOUDFLARE_PAGES_PROJECT` secret matches actual project name

**❌ KV errors in Worker**  
→ Update `wrangler.toml` with production KV namespace ID

---

**Next Steps**:
1. Follow Step 1-5 above (~20 min)
2. Customize workflows if needed
3. Add custom domains (optional)
4. Set up monitoring/alerts (optional)

**Status**: Production Ready ✅


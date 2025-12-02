# CI/CD Setup Checklist

Quick checklist for setting up CI/CD for MOVA Smartlink Atom v1.

## Prerequisites

- [ ] GitHub repository created
- [ ] Cloudflare account with Workers and Pages access
- [ ] Local development working (`npm install`, `npm run ci` passes)

---

## 1. Cloudflare Setup (5 minutes)

### Get API Token
- [ ] Go to: https://dash.cloudflare.com/profile/api-tokens
- [ ] Click "Create Token"
- [ ] Template: "Edit Cloudflare Workers"
- [ ] Add permissions:
  - ✓ Account → Cloudflare Pages → Edit
  - ✓ Account → Workers Scripts → Edit
- [ ] Copy token (save securely, you'll only see it once)

### Get Account ID
- [ ] Go to: https://dash.cloudflare.com/
- [ ] Select any site/domain
- [ ] Copy "Account ID" from right sidebar

### Create KV Namespace (Production)
```bash
cd packages/worker-smartlink
npx wrangler kv:namespace create "KV_SMARTLINK_RULES"
```
- [ ] Copy the `id` value
- [ ] Update `packages/worker-smartlink/wrangler.toml`:
  ```toml
  [[kv_namespaces]]
  binding = "KV_SMARTLINK_RULES"
  id = "paste_production_id_here"  # ← Update this
  preview_id = "paste_preview_id_here"
  ```

### Create Pages Project
- [ ] Go to: https://dash.cloudflare.com/ → Pages
- [ ] Click "Create a project"
- [ ] Name: `smartlink-admin` (or your preferred name)
- [ ] Note the project name

---

## 2. GitHub Secrets Setup (3 minutes)

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Click **"New repository secret"** for each:

- [ ] `CLOUDFLARE_API_TOKEN` = `<your-api-token>`
- [ ] `CLOUDFLARE_ACCOUNT_ID` = `<your-account-id>`
- [ ] `CLOUDFLARE_PAGES_PROJECT` = `smartlink-admin` (or your project name)
- [ ] `CLOUDFLARE_SUBDOMAIN` = `<your-subdomain>` (optional, for workers.dev)

---

## 3. Test CI Locally (2 minutes)

```bash
# From repository root
npm install
npm run ci
```

Expected output:
- ✅ Core built
- ✅ All packages linted
- ✅ 10/10 tests passed

---

## 4. Enable GitHub Actions (1 minute)

- [ ] Go to: **GitHub Repository → Actions**
- [ ] If disabled, click "I understand my workflows, go ahead and enable them"
- [ ] Verify you see 3 workflows:
  - CI
  - Deploy Worker
  - Deploy Pages

---

## 5. Test CI Workflow (2 minutes)

Push a small change:
```bash
git add .
git commit -m "test: verify CI workflow"
git push origin main
```

- [ ] Go to: **Actions** tab
- [ ] Verify "CI" workflow runs
- [ ] Check all jobs complete successfully (green checkmarks)

---

## 6. Test Worker Deployment (3 minutes)

### Option A: Manual
- [ ] Go to: **Actions → Deploy Worker**
- [ ] Click "Run workflow"
- [ ] Select environment: `production`
- [ ] Click "Run workflow"
- [ ] Wait for completion
- [ ] Verify: https://smartlink-worker.YOUR-SUBDOMAIN.workers.dev

### Option B: Via Tag
```bash
git tag v1.0.0
git push origin v1.0.0
```
- [ ] Check Actions tab for automatic deployment

### Verify Deployment
```bash
curl https://smartlink-worker.YOUR-SUBDOMAIN.workers.dev/api/smartlinks/test
```
Expected: `{"error":"Not Found","message":"Smartlink not found: test","status":404}`

---

## 7. Test Pages Deployment (3 minutes)

- [ ] Go to: **Actions → Deploy Pages**
- [ ] Click "Run workflow"
- [ ] Click "Run workflow"
- [ ] Wait for completion
- [ ] Visit: https://smartlink-admin.pages.dev (or your project URL)
- [ ] Verify SPA loads correctly

---

## 8. Load Example Data (2 minutes)

```bash
# Create example smartlink in production
curl -X PUT https://smartlink-worker.YOUR-SUBDOMAIN.workers.dev/api/smartlinks/spring_sale_2026 \
  -H "Content-Type: application/json" \
  --data-binary @examples/ecommerce/smartlink_rules.spring_sale_2026.json
```

- [ ] Test redirect:
```bash
curl -I "https://smartlink-worker.YOUR-SUBDOMAIN.workers.dev/s/spring_sale_2026?utm_source=tiktok"
```
Expected: `HTTP/2 302` with `location:` header

---

## 9. Configure Production Settings (Optional)

### Custom Domain for Worker
Edit `packages/worker-smartlink/wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "smartlink.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

### Custom Domain for Pages
- [ ] Go to Cloudflare Pages → smartlink-admin → Custom domains
- [ ] Add your domain
- [ ] Update DNS records

### Environment Variables
If your SPA needs custom API URL:
- [ ] Go to Pages → Settings → Environment variables
- [ ] Add: `VITE_API_BASE_URL` = `https://smartlink.yourdomain.com`
- [ ] Redeploy Pages

---

## 10. Final Verification (5 minutes)

- [ ] CI runs automatically on new commits
- [ ] Worker is accessible and responds correctly
- [ ] SPA loads and can connect to Worker API
- [ ] Example smartlink redirects correctly
- [ ] GitHub Actions logs show no errors
- [ ] Cloudflare Analytics shows traffic

---

## Troubleshooting

### CI fails
```bash
# Run locally to debug
npm run ci
```

### Worker deployment fails
- Check API token permissions
- Verify Account ID is correct
- Check wrangler.toml configuration
- Review GitHub Actions logs

### Pages deployment fails
- Verify project name matches `CLOUDFLARE_PAGES_PROJECT`
- Check if build output exists: `packages/spa-admin/dist/`
- Review build logs in Actions

### KV errors
```bash
# Verify KV namespace exists
cd packages/worker-smartlink
npx wrangler kv:namespace list
```

---

## Maintenance

### Update Dependencies
```bash
npm update
npm run ci  # Verify still works
git commit -am "chore: update dependencies"
git push
```

### Rotate API Token
1. Create new token in Cloudflare
2. Update `CLOUDFLARE_API_TOKEN` secret in GitHub
3. Revoke old token

### Monitor Deployments
- Check GitHub Actions for failed runs
- Monitor Cloudflare Analytics
- Set up alerts for errors

---

## ✅ Completion

When all checkboxes are marked:
- ✅ CI/CD is fully configured
- ✅ Automatic testing on every commit
- ✅ One-click deployments to production
- ✅ Monitoring and logs accessible

**Total Setup Time**: ~20-25 minutes

**Next Steps**:
- Customize workflows as needed
- Add more environments (staging, dev)
- Set up approval gates for production
- Configure custom domains
- Add monitoring and alerting

---

For detailed documentation, see:
- [.github/README.md](./.github/README.md) - Workflows documentation
- [COMMANDS.md](./COMMANDS.md) - Command reference
- [SETUP.md](./SETUP.md) - Setup guide


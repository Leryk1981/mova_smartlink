# Quick Command Reference

Essential commands for working with Smartlink v1.

## Setup & Installation

```bash
# Install all dependencies
npm install

# Build core library
cd packages/core-smartlink && npm run build
```

## Development

### Start all services

```bash
# Terminal 1: Worker
cd packages/worker-smartlink
npm run dev
# → http://localhost:8787

# Terminal 2: SPA
cd packages/spa-admin
npm run dev
# → http://localhost:3000
```

### Run tests

```bash
# Core library unit tests
cd packages/core-smartlink
npm test

# Type checking (all packages)
npm run lint
```

## Cloudflare KV

### Create namespace

```bash
cd packages/worker-smartlink

# Production
npx wrangler kv:namespace create "KV_SMARTLINK_RULES"

# Preview (local dev)
npx wrangler kv:namespace create "KV_SMARTLINK_RULES" --preview
```

### Manage data

```bash
# List all namespaces
npx wrangler kv:namespace list

# Put key (example data)
npx wrangler kv:key put \
  --binding=KV_SMARTLINK_RULES \
  --local \
  "link:spring_sale_2026" \
  "$(cat ../../examples/ecommerce/smartlink_rules.spring_sale_2026.json | jq -c '{core: ., updated_at: now|todate}')"

# Get key
npx wrangler kv:key get --binding=KV_SMARTLINK_RULES "link:spring_sale_2026"

# Delete key
npx wrangler kv:key delete --binding=KV_SMARTLINK_RULES "link:spring_sale_2026"

# List keys in namespace
npx wrangler kv:key list --binding=KV_SMARTLINK_RULES
```

## Testing

### Manual API testing

```bash
# Get smartlink config
curl http://localhost:8787/api/smartlinks/spring_sale_2026

# Test redirect (no redirect, return JSON)
curl "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok&debug=1"

# Test redirect (follow redirect)
curl -L "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok"

# Test redirect (show headers only)
curl -I "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok"

# Update smartlink config
curl -X PUT http://localhost:8787/api/smartlinks/spring_sale_2026 \
  -H "Content-Type: application/json" \
  -d @examples/ecommerce/smartlink_rules.spring_sale_2026.json
```

### Simulate context

```bash
# German mobile user from TikTok
curl "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok&debug=1" \
  -H "CF-IPCountry: DE" \
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  -H "Accept-Language: de-DE,de;q=0.9"

# US desktop user from email
curl "http://localhost:8787/s/spring_sale_2026?utm_source=email&utm_campaign=spring_2026&debug=1" \
  -H "CF-IPCountry: US" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" \
  -H "Accept-Language: en-US,en;q=0.9"
```

## Deployment

### Deploy Worker

```bash
cd packages/worker-smartlink
npm run deploy
# → https://smartlink-worker.<your-subdomain>.workers.dev
```

### Deploy SPA to Cloudflare Pages

```bash
cd packages/spa-admin
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=smartlink-admin
# → https://smartlink-admin.pages.dev
```

## CI/CD

### GitHub Actions Workflows

**Continuous Integration** (`.github/workflows/ci.yml`):
- Triggers: Automatically on `push` or `pull_request` to `main`
- Actions:
  - Install dependencies
  - Build core-smartlink
  - Lint all packages
  - Run unit tests
  - Verify MOVA core files unchanged

```bash
# Run CI locally (same commands as CI)
npm run ci
```

**Deploy Worker** (`.github/workflows/deploy-worker.yml`):
- Triggers: 
  - Manual via GitHub Actions → "Deploy Worker" (workflow_dispatch)
  - Automatic on version tags (`v*.*.*`)
- Actions:
  - Build and lint
  - Deploy to Cloudflare Workers (production or staging)

**Required Secrets** (configure in GitHub → Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers deploy permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_SUBDOMAIN` - Your workers.dev subdomain (optional)

**Deploy Pages** (`.github/workflows/deploy-pages.yml`):
- Triggers:
  - Manual via GitHub Actions → "Deploy Pages" (workflow_dispatch)
  - Automatic on `push` to `main` (when SPA files change)
- Actions:
  - Build SPA
  - Deploy to Cloudflare Pages

**Additional Required Secrets**:
- `CLOUDFLARE_PAGES_PROJECT` - Your Cloudflare Pages project name

### Manual Deployment

To deploy without CI/CD:

```bash
# Worker
cd packages/worker-smartlink
npm run deploy

# Pages
cd packages/spa-admin
npm run build
npx wrangler pages deploy dist --project-name=your-project-name
```

### Setting Up Secrets

1. Get Cloudflare API Token:
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create token with "Edit Cloudflare Workers" permissions
   - Copy token

2. Get Account ID:
   - Go to: https://dash.cloudflare.com/
   - Select your domain
   - Copy Account ID from sidebar

3. Add to GitHub:
   - Go to: https://github.com/your-org/mova_smartlink/settings/secrets/actions
   - Click "New repository secret"
   - Add each secret

### Deployment Checklist

Before first deployment:

- [ ] Configure KV namespace in `wrangler.toml` (production ID)
- [ ] Add GitHub secrets (API token, Account ID, etc.)
- [ ] Create Cloudflare Pages project
- [ ] Test Worker locally with `npm run dev:worker`
- [ ] Test SPA build with `cd packages/spa-admin && npm run build`
- [ ] Review `wrangler.toml` environment settings

## Monitoring

### View Worker logs

```bash
cd packages/worker-smartlink

# Tail logs in real-time
npx wrangler tail

# Tail with filters
npx wrangler tail --status error
```

### Worker metrics

```bash
# View analytics (requires Cloudflare dashboard)
npx wrangler metrics
```

## Building

```bash
# Build core library
cd packages/core-smartlink
npm run build
# → dist/

# Build SPA for production
cd packages/spa-admin
npm run build
# → dist/

# Build all packages
cd ../..
npm run build
```

## Troubleshooting

```bash
# Clear Worker cache
npx wrangler dev --local-protocol https

# Check Wrangler version
npx wrangler --version

# Verify Node version
node --version  # Should be >= 18

# Check package linking
npm ls @mova/core-smartlink

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Useful aliases (add to ~/.bashrc or ~/.zshrc)

```bash
# Quick start all services
alias smartlink-dev='
  (cd packages/worker-smartlink && npm run dev) &
  (cd packages/spa-admin && npm run dev)
'

# Run all tests
alias smartlink-test='cd packages/core-smartlink && npm test'

# Deploy everything
alias smartlink-deploy='
  cd packages/worker-smartlink && npm run deploy &&
  cd ../spa-admin && npm run build && npx wrangler pages deploy dist
'
```

---

**See also:**
- [SETUP.md](./SETUP.md) - Full setup guide
- [TESTING.md](./TESTING.md) - Testing guide
- [README.md](./README.md) - Overview


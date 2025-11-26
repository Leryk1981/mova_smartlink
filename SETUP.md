# Smartlink v1 - Setup Guide

Complete setup instructions for MOVA Smartlink Atom v1.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Cloudflare account (for deployment)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

This will install dependencies for all packages (monorepo setup).

### 2. Build core library

```bash
cd packages/core-smartlink
npm run build
```

### 3. Setup Cloudflare Worker

#### Create KV namespace

```bash
cd packages/worker-smartlink

# Production KV
npx wrangler kv:namespace create "KV_SMARTLINK_RULES"

# Preview KV (for local dev)
npx wrangler kv:namespace create "KV_SMARTLINK_RULES" --preview
```

Copy the namespace IDs from the output and update `packages/worker-smartlink/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "KV_SMARTLINK_RULES"
id = "your_production_id_here"
preview_id = "your_preview_id_here"
```

#### Load example data

```bash
# From worker directory
npx wrangler kv:key put --binding=KV_SMARTLINK_RULES --local \
  "link:spring_sale_2026" \
  "$(cat ../../examples/ecommerce/smartlink_rules.spring_sale_2026.json | jq -c '{core: ., updated_at: now|todate}')"
```

If you don't have `jq`, you can manually create a JSON file with this structure:

```json
{
  "core": { ... paste content from spring_sale_2026.json ... },
  "updated_at": "2024-11-26T12:00:00Z"
}
```

### 4. Start development servers

Open 2 terminal windows:

**Terminal 1: Worker**
```bash
cd packages/worker-smartlink
npm run dev
```

Worker will run on `http://localhost:8787`

**Terminal 2: SPA**
```bash
cd packages/spa-admin
npm run dev
```

SPA will run on `http://localhost:3000`

### 5. Test the setup

#### Test Worker directly

```bash
# Test redirect (should return 302)
curl -I "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok"

# Test with debug mode (should return JSON)
curl "http://localhost:8787/s/spring_sale_2026?utm_source=tiktok&debug=1"

# Test admin API
curl "http://localhost:8787/api/smartlinks/spring_sale_2026"
```

#### Test SPA

1. Open `http://localhost:3000` in browser
2. Link ID should be `spring_sale_2026` by default
3. Go to **Editor** tab - you should see the example rules
4. Go to **Test** tab - try different contexts and see which rule matches
5. Edit rules in Editor and save
6. Verify changes in Test panel

## Running Tests

### Core library tests

```bash
cd packages/core-smartlink
npm test
```

Should run all unit tests for `evaluate()` function.

## Manual E2E Test Flow

### Scenario: Edit rules and test redirect

1. **Start both servers** (Worker + SPA)

2. **Open SPA** at `http://localhost:3000`

3. **Edit a rule:**
   - Go to Editor tab
   - Expand first rule (de_tiktok_mobile)
   - Change target URL to `https://example.de/NEW-TARGET`
   - Click "Save Changes"
   - Verify success message

4. **Test in Test panel:**
   - Go to Test tab
   - Set context:
     - Country: `DE`
     - Device: `mobile`
     - UTM Source: `tiktok`
   - Click "Run Test"
   - Verify result shows new target: `https://example.de/NEW-TARGET`

5. **Test real redirect:**
   - Copy public URL from Test panel
   - Open in new browser tab (or use curl)
   - Verify redirect to new target

6. **Test fallback:**
   - In Test panel, change Country to `FR` (no rules match)
   - Click "Run Test"
   - Should show branch: `fallback` and fallback_target URL

## Deployment

### Deploy Worker

```bash
cd packages/worker-smartlink
npm run deploy
```

Your Worker will be deployed to `https://smartlink-worker.<your-subdomain>.workers.dev`

### Deploy SPA to Cloudflare Pages

```bash
cd packages/spa-admin
npm run build

# Deploy
npx wrangler pages deploy dist --project-name=smartlink-admin
```

Or connect GitHub repo to Cloudflare Pages for automatic deployments.

### Update SPA to use production Worker

After deploying Worker, update SPA's Vite config to point to production API:

```typescript
// packages/spa-admin/vite.config.ts
proxy: {
  '/api': 'https://smartlink-worker.<your-subdomain>.workers.dev',
  '/s': 'https://smartlink-worker.<your-subdomain>.workers.dev',
}
```

Or set API base URL via environment variable in production build.

## Troubleshooting

### Worker can't find KV namespace

- Verify `wrangler.toml` has correct KV namespace IDs
- Try `npx wrangler kv:namespace list` to see all namespaces
- Make sure binding name is `KV_SMARTLINK_RULES`

### SPA can't connect to Worker

- Verify Worker is running on port 8787
- Check browser console for CORS errors
- Verify proxy config in `vite.config.ts`

### Tests fail

- Run `npm install` in core package
- Verify Node.js version >= 18
- Try `npm run build` before running tests

### Data not saving

- Check KV namespace is created and bound
- Verify JSON in request body matches schema
- Check Worker logs: `npx wrangler tail`

## Next Steps

- Read [SMARTLINK_SPEC.md](./docs/SMARTLINK_SPEC.md) for architecture details
- Read [TASKS_SMARTLINK_V1.md](./docs/TASKS_SMARTLINK_V1.md) for implementation checklist
- Add JSON Schema validation with Ajv in Worker
- Implement Queue for observability events
- Add authentication for admin panel
- Create more example smartlinks
- Add analytics dashboard

## Support

For issues, questions, or contributions, see the main [README.md](./README.md).


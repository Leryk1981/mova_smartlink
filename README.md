# MOVA Smartlink Atom v1

⚡ **Smart link routing on the edge** - Route users to different destinations based on country, device, UTM parameters, and more.

## Overview

This repository contains a complete MOVA 3.6.x atom for **Smartlink edge routing**:

- **MOVA artifacts**: Data schemas, envelopes, global catalog, and meta-model
- **Core library** (`@mova/core-smartlink`): Pure TypeScript evaluation logic
- **Cloudflare Worker** (`@mova/worker-smartlink`): Edge routing with KV storage
- **Admin SPA** (`@mova/spa-admin`): React-based rule editor

## Features

### Core Routing
✅ **Declarative routing** - Define rules in JSON, no code changes needed  
✅ **Edge-first** - Run on Cloudflare Workers for global low-latency  
✅ **Context-aware** - Route by country, language, device, UTM params  
✅ **Priority-based** - Control rule evaluation order explicitly  
✅ **Debug mode** - Test rules without redirects (`?debug=1`)  
✅ **Visual editor** - Manage rules via modern admin UI  
✅ **Type-safe** - Full TypeScript support across all packages

### v2 Advanced Features 🆕
✅ **Rule enablement** - Pause/resume rules with `enabled: false`  
✅ **Time-based activation** - Schedule campaigns with `start_at` / `end_at`  
✅ **A/B testing** - Weighted traffic distribution with `weight`  
✅ **Enhanced priority** - Fine-grained control over rule evaluation order  

📖 **Learn more**: [Smartlink v2 Features](./docs/SMARTLINK_V2_FEATURES.md)

## Quick Start

```bash
# Install dependencies
npm install

# Setup and run (see SETUP.md for details)
cd packages/worker-smartlink && npm run dev  # Terminal 1
cd packages/spa-admin && npm run dev         # Terminal 2

# Open http://localhost:3000
```

📖 **Full setup guide**: [SETUP.md](./SETUP.md)

## Architecture

```
┌─────────────────┐
│  Admin SPA      │  React app for editing rules
│  (Vite + React) │  → /api/smartlinks/:linkId
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Worker         │  Cloudflare Worker
│  /s/:linkId     │  → Evaluates rules
│  /api/...       │  → Stores in KV
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Core Library   │  Pure TypeScript
│  evaluate()     │  → Rule matching logic
└─────────────────┘
```

### Packages

- **`packages/core-smartlink`** - Pure rule evaluation logic (no HTTP/CF deps)
- **`packages/worker-smartlink`** - Cloudflare Worker for edge routing
- **`packages/spa-admin`** - React SPA for rule management

### MOVA Artifacts

- **`schemas/ds.smartlink_rules_v1.schema.json`** - Data schema for SmartlinkCore
- **`schemas/env.smartlink_default_v1.json`** - Envelope (declarative flow)
- **`schemas/global.smartlink_v1.json`** - Domain-specific global catalog
- **`schemas/meta.smartlink_v1.json`** - Template set metadata
- **`examples/ecommerce/`** - Real-world example instance

## Example Use Case

**Campaign**: Spring Sale 2026 across TikTok, email, and Google Ads

**Rules**:
1. 🇩🇪 Germany + 📱 Mobile + TikTok → Mobile-optimized German landing page
2. 📧 Email + Campaign "spring_2026" → Email-specific landing page
3. 🇩🇪 Germany (any device/source) → German landing page
4. **Fallback** → Global English landing page

One smartlink URL (`/s/spring_sale_2026`) routes to 4 different destinations based on context.

## Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and deployment guide
- **[docs/SMARTLINK_SPEC.md](./docs/SMARTLINK_SPEC.md)** - Architecture specification
- **[docs/TASKS_SMARTLINK_V1.md](./docs/TASKS_SMARTLINK_V1.md)** - Implementation checklist
- **[docs/AI_RULES_SMARTLINK.md](./docs/AI_RULES_SMARTLINK.md)** - Guidelines for AI agents

## Development

```bash
# Run tests (core library)
cd packages/core-smartlink
npm test

# Run worker in dev mode
cd packages/worker-smartlink
npm run dev

# Run SPA in dev mode
cd packages/spa-admin
npm run dev

# Build all packages
npm run build
```

## Deployment

### Cloudflare Worker

```bash
cd packages/worker-smartlink
npm run deploy
```

### Cloudflare Pages (SPA)

```bash
cd packages/spa-admin
npm run build
npx wrangler pages deploy dist --project-name=smartlink-admin
```

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## CI/CD

Automated workflows via GitHub Actions:

- **CI** (`.github/workflows/ci.yml`) - Runs on every push/PR to `main`
  - Builds all packages
  - Runs tests and linting
  - Verifies MOVA core files unchanged

- **Deploy Worker** (`.github/workflows/deploy-worker.yml`) - Manual or on version tags
  - Deploys Worker to Cloudflare
  - Requires: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

- **Deploy Pages** (`.github/workflows/deploy-pages.yml`) - Manual or on push to `main`
  - Deploys SPA to Cloudflare Pages
  - Requires: `CLOUDFLARE_PAGES_PROJECT`

Configure secrets in GitHub repository settings. See [COMMANDS.md](./COMMANDS.md) for detailed CI/CD setup.

## License

MIT

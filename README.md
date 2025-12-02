# SmartLink — Smart Links for Edge Routing

⚡ **MOVA 4.0.0 Data-First Smart Routing** — Route users to different destinations based on country, device, UTM parameters, and more.

**Status:** MOVA 4.0.0 Migration Complete ✅ | Build & Tests: ✅ PASSING  
**Domain:** E-commerce, marketing campaigns, edge routing  
**MOVA:** 4.0.0 (data-first contract language with genetic layer)

## Overview

SmartLink is a **MOVA 4.0.0-based** system for smart link routing at the edge.

It enables marketers to create a single link that routes users to different destinations based on:
- Geographic location (country)
- Device type (mobile, tablet, desktop)
- Language preference
- UTM campaign parameters
- Custom query parameters

**Key principle:** Configuration is data, not code. Routing rules are expressed as structured JSON that validates against MOVA schemas.

## Architecture (MOVA 4.0.0)

SmartLink implements the full MOVA 4.0 stack:

```
┌─────────────────────────────────────────┐
│  UX / Applications (L3)                 │
│  - Admin SPA (React)                    │
│  - Analytics dashboards                 │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  MOVA Layer (L2) ← THIS SPECIFICATION   │
│  - Data schemas (ds.*)                  │
│  - Envelopes (env.*)                    │
│  - Episodes (genetic layer)             │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Executors (L1)                         │
│  - Cloudflare Worker                    │
│  - Core evaluation library              │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Models & Tools (L0)                    │
│  - KV storage, Analytics, GeoIP, etc.   │
└─────────────────────────────────────────┘
```

**MOVA defines *what* should happen** (data + contracts).  
**Executors implement *how* it happens** (workers, agents, tools).

## Features

### Core Routing
✅ **Declarative routing** - Define rules in JSON, no code changes needed  
✅ **Edge-first** - Run on Cloudflare Workers for global low-latency  
✅ **Context-aware** - Route by country, language, device, UTM params  
✅ **Priority-based** - Control rule evaluation order explicitly  
✅ **Debug mode** - Test rules without redirects (`?debug=1`)  
✅ **Visual editor** - Manage rules via modern admin UI  
✅ **Type-safe** - Full TypeScript support across all packages

### MOVA 4.0.0 Features 🆕
✅ **Data-first contracts** - Clear separation between data, envelopes, and execution  
✅ **Genetic layer** - Episode recording for pattern memory and learning  
✅ **Declarative envelopes** - Speech-acts (route, get) without execution logic  
✅ **Statistics & Analytics** - Structured query/report schemas  
✅ **Versioned schemas** - JSON Schema 2020-12 with semantic versioning  
✅ **Comprehensive examples** - Validated instances for all schemas

📖 **Learn more**: [SmartLink 4.0 Specification](./mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md)

## Repository Structure

```text
smartlink/
  /mova4-smartlink/           # 🆕 MOVA 4.0.0 artifacts (ACTIVE)
    /schemas/                 # Data schemas, envelopes, episodes
      ds.smartlink_config_v1.schema.json
      ds.smartlink_click_context_v1.schema.json
      ds.smartlink_resolution_result_v1.schema.json
      ds.smartlink_stats_query_v1.schema.json
      ds.smartlink_stats_report_v1.schema.json
      env.smartlink_resolve_v1.schema.json
      env.smartlink_stats_get_v1.schema.json
      ds.episode_smartlink_resolution_v1.schema.json
    /examples/                # Validated examples
    /docs/                    # MOVA 4.0 specification
      SMARTLINK_SPEC_4.0.md
    README.md

  /legacy/                    # 🗄️ MOVA 3.6 artifacts (ARCHIVED)
    /schemas/                 # Old schemas
    /mova-core/               # MOVA 3.6.0 core specs
    README.md

  /docs/                      # Project documentation
    AI_RULES_SMARTLINK.md     # AI agent integration rules
    TASKS_SMARTLINK_V1.md     # Task tracking
    SMARTLINK_SPEC.md         # Legacy spec (archived)

  /packages/                  # Implementation
    /core-smartlink/          # Core evaluation library
    /worker-smartlink/        # Cloudflare Worker
    /spa-admin/               # Admin UI (React)

  /mova_4_0_0_spec/           # MOVA 4.0.0 core specification
```

## MOVA 4.0.0 Artifacts

### Data Schemas (ds.*)

SmartLink defines five core data types:

- **`ds.smartlink_config_v1`** — SmartLink configuration (targets, conditions, rules)
- **`ds.smartlink_click_context_v1`** — Normalized click context (country, device, UTM, etc.)
- **`ds.smartlink_resolution_result_v1`** — Routing decision result
- **`ds.smartlink_stats_query_v1`** — Statistics query parameters
- **`ds.smartlink_stats_report_v1`** — Statistics report structure

All schemas: `mova4-smartlink/schemas/ds.*.schema.json`

### Envelopes (env.*)

SmartLink defines two core envelopes (speech-acts):

- **`env.smartlink_resolve_v1`** — Resolve a click to a target URL (verb: `route`)
- **`env.smartlink_stats_get_v1`** — Retrieve statistics (verb: `get`)

Envelopes are declarative contracts that describe what needs to happen, not how.

All envelopes: `mova4-smartlink/schemas/env.*.schema.json`

### Episodes (Genetic Layer)

- **`ds.episode_smartlink_resolution_v1`** — Records one execution of smartlink resolution

Episodes capture:
- Input context, output result, and config used
- Executor metadata (type, version, location)
- Performance metrics (latency, cache hits, retries)
- Quality signals (bounce, conversion, anomaly detection)
- Optional analysis and insights

Episodes enable pattern memory, long-term learning, and performance analysis.

Schema: `mova4-smartlink/schemas/ds.episode_smartlink_resolution_v1.schema.json`

### Examples

Complete validated examples in `mova4-smartlink/examples/`:

- `smartlink_config.spring_sale_2026.json` — Real-world configuration
- `click_context.example.json` — Click from TikTok mobile
- `resolution_result.example.json` — Successful resolution
- `env.smartlink_resolve.example.json` — Full envelope
- `episode.smartlink_resolution.example.json` — Complete episode with metrics
- `stats_query.example.json` + `stats_report.example.json` — Statistics

## Example Use Case

**Campaign**: Spring Sale 2026 across TikTok, email, and Google Ads

**SmartLink Configuration**:
```json
{
  "smartlink_id": "spring_sale_2026",
  "status": "active",
  "targets": [
    {
      "target_id": "de_tiktok_mobile",
      "url": "https://example.de/spring/mobile-funnel",
      "conditions": {
        "country": "DE",
        "device": "mobile",
        "utm": { "source": "tiktok" }
      },
      "priority": 10
    },
    {
      "target_id": "email_spring_main",
      "url": "https://example.com/spring/email-landing",
      "conditions": {
        "utm": {
          "source": "email",
          "campaign": "spring_2026"
        }
      },
      "priority": 20
    },
    {
      "target_id": "global_fallback",
      "url": "https://example.com/spring/global-en",
      "conditions": {},
      "priority": 100
    }
  ],
  "default_target_id": "global_fallback"
}
```

**Result**: One smartlink URL (`/s/spring_sale_2026`) routes to different destinations based on context.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start dev servers

```bash
# Terminal 1: Worker
cd packages/worker-smartlink
npm run dev

# Terminal 2: Admin SPA
cd packages/spa-admin
npm run dev
```

### 3. Migration to MOVA 4.0

**Status:** ✅ **COMPLETED** — Fully migrated to MOVA 4.0

**Completed tasks:**
- ✅ SL-CORE-4.0: All MOVA 4.0 schemas created
- ✅ SL-EXEC-4.0: Core library + Worker + Migration tools (100%)
- ✅ SL-UE-LANDING-4.0: Landing page SPA (100%)
- ✅ SL-CI-4.0: Build & test validation (100%)

**Build status:**
- ✅ `packages/core-smartlink`: 18/18 tests passing
- ✅ `packages/worker-smartlink`: 7/7 tests passing
- ✅ `apps/smartlink-landing`: Build successful

See [BUILD_AND_TEST_COMMANDS.md](BUILD_AND_TEST_COMMANDS.md) for quick reference.

### 4. Deploy

```bash
# Deploy Worker
cd packages/worker-smartlink
npm run deploy

# Deploy Admin SPA
cd packages/spa-admin
npm run build
npx wrangler pages deploy dist --project-name=smartlink-admin
```

📖 **Full deployment guide**: [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md)  
📖 **Pages setup**: [docs/CLOUDFLARE_PAGES_SETUP.md](./docs/CLOUDFLARE_PAGES_SETUP.md)

## Documentation

### MOVA 4.0.0 (Active)

- **[SMARTLINK_SPEC_4.0.md](mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md)** — Complete MOVA 4.0 specification
- **[AI_RULES_SMARTLINK.md](docs/AI_RULES_SMARTLINK.md)** — AI agent integration rules (updated for 4.0)
- **[TASKS_SMARTLINK_V1.md](docs/TASKS_SMARTLINK_V1.md)** — Task tracking (includes SL-CORE-4.0 migration)
- **[mova4-smartlink/README.md](mova4-smartlink/README.md)** — MOVA 4.0 package overview

### MOVA Core 4.0.0 Reference

- **[mova_4.0.0_core.md](mova_4_0_0_spec/docs/mova_4.0.0_core.md)** — MOVA 4.0 core specification
- **[mova_4.0.0_layers.md](mova_4_0_0_spec/docs/mova_4.0.0_layers.md)** — Layer model
- **[mova_4.0.0_migration_from_3.6.md](mova_4_0_0_spec/docs/mova_4.0.0_migration_from_3.6.md)** — Migration guide

### Legacy (Archived)

- **[SMARTLINK_SPEC.md](docs/SMARTLINK_SPEC.md)** — Legacy MOVA 3.6 specification (archived)
- **[legacy/README.md](legacy/README.md)** — Legacy artifacts documentation

### Other Guides

- **[SETUP.md](./SETUP.md)** - Complete setup and configuration
- **[COMMANDS.md](./COMMANDS.md)** - CLI commands and scripts
- **[TESTING.md](./TESTING.md)** - Testing guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

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

## CI/CD

Automated workflows via GitHub Actions:

- **CI** (`.github/workflows/ci.yml`) - Runs on every push/PR to `main`
  - Builds all packages
  - Runs tests and linting
  - Verifies schemas

- **Deploy Worker** (`.github/workflows/deploy-worker.yml`) - Manual or on version tags
  - Deploys Worker to Cloudflare
  - Requires: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

- **Deploy Pages** (`.github/workflows/deploy-pages.yml`) - Manual or on push to `main`
  - Deploys SPA to Cloudflare Pages
  - Requires: `CLOUDFLARE_PAGES_PROJECT`

Configure secrets in GitHub repository settings. See [COMMANDS.md](./COMMANDS.md) for detailed CI/CD setup.

## Migration History

### v1.0 → v2.0 (MOVA 4.0.0) — December 2025

**Task:** SL-CORE-4.0

**Changes:**
- Migrated from MOVA 3.6 to MOVA 4.0.0
- Split monolithic data schema into focused schemas (config, context, result, stats)
- Created declarative envelopes (env.smartlink_resolve_v1, env.smartlink_stats_get_v1)
- Added genetic layer with episode recording
- Archived legacy MOVA 3.6 artifacts

**Legacy artifacts:** `legacy/` folder

**See:** [TASKS_SMARTLINK_V1.md](docs/TASKS_SMARTLINK_V1.md) for full migration details

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT

---

**Version:** 2.0.0 (MOVA 4.0.0)  
**Last Updated:** 2025-12-02  
**Task:** SL-CORE-4.0 ✅

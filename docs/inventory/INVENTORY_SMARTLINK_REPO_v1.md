# SmartLink Repository Inventory (v1)

## What is this repo?
SmartLink is a Node.js monorepo that delivers MOVA 4.0.0 smart-link routing: JSON-driven routing rules, a core TypeScript evaluation library, a Cloudflare Worker executor, and supporting admin/landing experiences, plus MOVA specification artifacts and examples.

## Readiness score: 4/5
- ✅ Build and tests pass at the root using current scripts (`npm ci`, `npm test`, `npm run build`).
- ✅ Rich documentation and specs already exist for MOVA 4.0.0 artifacts and legacy references.
- ⚠️ README/quickstart and CI notes need consolidation (clear Node/npm version, single source of truth for gates, streamlined developer steps).

## What runs (root)
- `npm ci` — PASS (installs workspaces).【23fe99†L1-L4】
- `npm test` — PASS (tsx test suite for core-smartlink).【e72258†L1-L34】
- `npm run build` — PASS (TypeScript build for core-smartlink).【d4a063†L1-L7】

## Doc map
- Root: `README.md` (overview, quick start, deploy notes, repository structure).
- `/docs`: CI/CD reports and guides (`CI_CD_*`), task summaries, troubleshooting, AI agent rules, deployment guides.
- `/mova4-smartlink`: MOVA 4.0.0 schemas, examples, and spec docs (`docs/SMARTLINK_SPEC_4.0.md`, package README).
- `/legacy`: MOVA 3.6 archival docs (legacy README and schemas).
- `/examples`: Ecommerce smartlink rule JSON examples.
- `/.github`: Workflow README and CI/deploy pipelines (`ci.yml`, deploy workers/pages).

## 3 gaps
1) README quickstart omits explicit Node/npm version and workspace install guidance (only `npm install`, no mention of `npm ci` or engines requirement).  
2) Gates are scattered across scripts and docs; there is no concise “run these checks” section tied to CI/engines.  
3) Deployment prerequisites (Cloudflare secrets, env vars) are spread across multiple docs without a single minimal checklist.

## Next 3 steps
1) Standardize README to surface status, prerequisites (Node >=18/npm >=9), and canonical local/CI gate commands.  
2) Align CI to run the documented gates (`npm ci`, tests, build, lint if present) with the declared Node version.  
3) Add a short deployment checklist linking the detailed Cloudflare guides to reduce duplication and guessing.

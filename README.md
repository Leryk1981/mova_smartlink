# SmartLink — MOVA 4.0 Smart Links

**Status:** Active | **Purpose:** Edge smart-link routing with MOVA 4.0.0 contracts | **Stack:** Node.js workspaces, Cloudflare Worker, React SPA

## What is SmartLink?
SmartLink lets you publish one link that routes users to the right destination based on country, device, language, and UTM parameters. Routing rules are declarative JSON documents validated against MOVA 4.0.0 schemas and executed by a TypeScript core library and a Cloudflare Worker.

## Quickstart (local)
- Prerequisites: Node >=18, npm >=9.
- Install: `npm ci`
- Validate: `npm test`
- Build: `npm run build`
- Lint (optional but recommended): `npm run lint`
- Dev servers:
  - Worker: `npm run dev --workspace=packages/worker-smartlink`
  - Admin SPA: `npm run dev --workspace=packages/spa-admin`

## Config and rules
- MOVA 4.0.0 schemas and examples live in `mova4-smartlink/` (`schemas/`, `examples/`, `docs/SMARTLINK_SPEC_4.0.md`).
- The TypeScript evaluator is in `packages/core-smartlink/` with tests under `src/*.test.ts`.
- Cloudflare Worker runtime lives in `packages/worker-smartlink/`; the admin UI is in `packages/spa-admin/`.
- The npm package `@leryk1981/mova-spec@4.1.1` is currently inaccessible from this environment (npm 403); the repository uses the checked-in MOVA artifacts until registry access is available.

## Repository layout
- `packages/` — Workspaces for the core library, worker, and admin SPA.
- `mova4-smartlink/` — MOVA 4.0.0 schemas, examples, and spec docs.
- `legacy/` — Archived MOVA 3.6 artifacts and docs.
- `docs/` — Operations guides, CI/CD notes, troubleshooting, and task reports.
- `examples/` — SmartLink configuration samples.

## CI
`.github/workflows/ci.yml` runs on pushes and pull requests with Node 18, executing `npm ci`, lint, tests, and `npm run build` to mirror the local gates.

## Deployment
- Worker (Cloudflare): `cd packages/worker-smartlink && npm run deploy` (requires Cloudflare credentials).
- Admin SPA (Pages): `cd packages/spa-admin && npm run build && npx wrangler pages deploy dist --project-name=smartlink-admin`.
- Detailed steps: see `QUICK_START_DEPLOYMENT.md` and `docs/CLOUDFLARE_PAGES_SETUP.md`.

## Additional docs
- MOVA spec references: `mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md`, `mova_4_0_0_spec/` core docs.
- Troubleshooting and command references: `TROUBLESHOOTING.md`, `COMMANDS.md`, `SETUP.md`.
- Project history and reports: `docs/AI_RULES_SMARTLINK.md`, `docs/TASKS_SMARTLINK_V1.md`, and CI/CD summaries under `docs/`.

## License
MIT

# Tasks — Smartlink Atom v1

This file defines a minimal set of tasks for implementing the Smartlink atom.

## T1. Core library — `packages/core-smartlink`

**Goal:** pure TypeScript library with Smartlink rules evaluation.

Checklist:

- [ ] Create `packages/core-smartlink` with its own `package.json`, `tsconfig.json`.
- [ ] Define types:
  - [ ] `SmartlinkCore` (match `ds:smartlink_rules_v1`).
  - [ ] `SmartlinkContext` (normalized: `country`, `lang`, `device`, `utm`).
  - [ ] `SmartlinkDecision` (at least: `target`, optional `url`, `branch`, `rule_index`).
- [ ] Implement `evaluate(context, core)`:
  - [ ] Iterate rules in a deterministic order (priority, then index).
  - [ ] Support `when.country/lang/device/utm.*` as string or array.
  - [ ] Return first matching rule with `target` and `branch`.
  - [ ] If no rule matches, use `fallback_target`.
- [ ] Add tests using example instance:
  - [ ] Single rule match by country+device.
  - [ ] UTM-based rule.
  - [ ] Fallback branch.

## T2. Worker — `packages/worker-smartlink`

**Goal:** Cloudflare Worker that wires HTTP to Smartlink core.

Checklist:

- [ ] Create `packages/worker-smartlink` with `wrangler.toml` and `src/index.ts`.
- [ ] Implement routing:
  - [ ] `GET /s/:linkId` → public handler.
  - [ ] `GET /api/smartlinks/:linkId` → admin read.
  - [ ] `PUT /api/smartlinks/:linkId` → admin update.
- [ ] Implement public handler:
  - [ ] Extract `linkId` from URL.
  - [ ] Read `cf.country`, `Accept-Language`, `User-Agent`, query.
  - [ ] Normalize into `SmartlinkContext`.
  - [ ] Read SmartlinkCore from KV (`KV_SMARTLINK_RULES`).
  - [ ] Call `evaluate(context, core)`.
  - [ ] For MVP: treat `decision.target` as final URL.
  - [ ] Support `debug=1` → return JSON instead of redirect.
  - [ ] Normal case: return 302 with `Location`.
- [ ] Implement admin handler (MVP):
  - [ ] `GET` → return JSON SmartlinkCore.
  - [ ] `PUT` → validate against `ds.smartlink_rules_v1` and save to KV.
- [ ] Wire bindings:
  - [ ] `KV_SMARTLINK_RULES` in `wrangler.toml` and code.

## T3. SPA — `packages/spa-admin`

**Goal:** minimal admin UI to edit one SmartlinkCore.

Checklist:

- [ ] Create `packages/spa-admin` with chosen framework (React/Vue/Svelte).
- [ ] Set up dev server with proxy to Worker `/api`.
- [ ] Implement Smartlink editor page:
  - [ ] Load SmartlinkCore from `/api/smartlinks/:linkId`.
  - [ ] Show/edit fields:
    - [ ] `purpose`
    - [ ] `status` (simple dropdown or readonly)
    - [ ] `context_shape` (checkboxes)
    - [ ] `rules[]` (table with add/remove/edit)
    - [ ] `fallback_target`
  - [ ] Save via `PUT /api/smartlinks/:linkId`.
- [ ] (Optional) Test panel:
  - [ ] Allow entering `country/lang/device/utm.*`.
  - [ ] Call `/api/smartlinks/:linkId/test` when implemented.

## Acceptance criteria

- [ ] All schemas in `schemas/*.json` validate against MOVA core schemas.
- [ ] `evaluate()` passes tests using `smartlink_rules.spring_sale_2026.json`.
- [ ] Local dev:
  - [ ] `wrangler dev` serves `/s/:linkId` and `/api/...`.
  - [ ] SPA can read/update a SmartlinkCore via `/api`.
- [ ] Manual flow:
  - [ ] Edit rules in SPA.
  - [ ] Hit `/s/spring_sale_2026?...` in browser.
  - [ ] Observe redirect changing according to rules.

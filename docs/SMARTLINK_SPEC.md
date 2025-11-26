# Smartlink Atom v1 — MOVA 3.6.x Spec

Status: draft/MVP  
Domain: e-commerce / edge routing  
MOVA core: 3.6.x

## 1. Goal

Provide a **single MOVA atom** for Smartlink:

- one data schema (`ds:smartlink_rules_v1`) describing SmartlinkCore rules;
- one envelope (`env:smartlink_default_v1`) for edge redirect on Cloudflare Worker;
- one example instance with real rules;
- one small domain global catalog fragment;
- clear tasks for:
  - core library (`core-smartlink`),
  - worker (`worker-smartlink`),
  - admin SPA (`spa-admin`).

The target user is a developer who wants to host Smartlink on **Cloudflare Worker + Pages** and control rules via a small SPA.

## 2. Repository layout (suggested)

```text
smartlink-spa/
  README.md
  /docs
    SMARTLINK_SPEC.md
    AI_RULES_SMARTLINK.md
    TASKS_SMARTLINK_V1.md

  /schemas
    ds.smartlink_rules_v1.schema.json
    env.smartlink_default_v1.json
    global.smartlink_v1.json
    meta.smartlink_v1.json

  /examples
    /ecommerce
      smartlink_rules.spring_sale_2026.json

  /packages
    /core-smartlink
    /worker-smartlink
    /spa-admin

  # MOVA core references (read-only, copied from main MOVA repo)
  /mova-core
    envelope.3.6.0.schema.json
    global.3.6.0.schema.json
    global.core.3.6.0.json
    meta-model.3.6.0.schema.json
    meta-model.3.6.0.json
    verbs.core.3.6.0.json
    MOVA_CORE_3.6.0_CONTRACT.md
    MOVA_META_MODEL_v1.md
```

The **source of truth** for Smartlink domain is:

- `schemas/ds.smartlink_rules_v1.schema.json`
- `schemas/env.smartlink_default_v1.json`
- `schemas/global.smartlink_v1.json`
- `schemas/meta.smartlink_v1.json`

The chat history is documentation and context, **not** a schema source.

## 3. MOVA artifacts

### 3.1 Data schema — `ds:smartlink_rules_v1`

See `schemas/ds.smartlink_rules_v1.schema.json`.

Conceptually:

- one SmartlinkCore per `link_id`;
- contains:
  - `link_id`, `purpose`, `status`;
  - `context_shape[]` — which context fields are used;
  - `rules[]`:
    - `when` over normalized context (`country`, `lang`, `device`, `utm.*`);
    - `target` — logical destination id or URL;
  - `fallback_target` — if nothing matched;
  - `meta` — versioning/audit.

The UI edits this schema directly (no hidden technical fields).

### 3.2 Envelope — `env:smartlink_default_v1`

See `schemas/env.smartlink_default_v1.json`.

Responsibilities:

1. Extract HTTP context from Cloudflare request:
   - `link_id` from path;
   - `req.cf.country`, `Accept-Language`, `User-Agent`, query.
2. Normalize context into `country/lang/device/utm`.
3. Load SmartlinkCore from KV by `link:{link_id}`.
4. Call `plugin:smartlink_eval` with `{ core, context }`.
5. Redirect to resulting URL (or logical target + resolver).
6. Emit `smartlink.redirected` event to queue.

It is a **pure envelope**: no hard-coded URLs, all routing is in data (SmartlinkCore).

### 3.3 Global fragment — Smartlink domain

See `schemas/global.smartlink_v1.json`.

Adds:

- roles:
  - `role:smartlink_admin`
  - `role:marketing_owner`
- resources:
  - `res:kv_smartlink_rules`
  - `res:worker_smartlink_edge`
  - `res:queue_smartlink_events`
- dataSchemas:
  - `ds:smartlink_rules_v1`

This file **extends** `global.core.3.6.0.json` and never overrides core ids.

### 3.4 Template set meta

See `schemas/meta.smartlink_v1.json`.

Defines a small **template_set**:

- dataSchemas: `ds:smartlink_rules_v1`
- envelopes: `env:smartlink_default_v1`
- instances: example SmartlinkCore
- globals: Smartlink global fragment

This is a convenience catalog for tools (Workbench, PWA, marketplace).

### 3.5 Example instance

See `examples/ecommerce/smartlink_rules.spring_sale_2026.json`.

Represents a real SmartlinkCore for a `spring_sale_2026` campaign with several rules by:

- country,
- device,
- utm.source / utm.campaign.

Used for:

- QA tests of `evaluate()` core,
- manual end-to-end checks in dev.

## 4. Implementation tasks (Codex / Gemini / human)

### 4.1 Core library — `packages/core-smartlink`

**Goal:** pure TypeScript library with Smartlink core logic, no Cloudflare/HTTP.

Key tasks:

1. Define types:
   - `SmartlinkCore` (matching ds:smartlink_rules_v1).
   - `SmartlinkContext` (normalized context for evaluation).
   - `SmartlinkDecision` (result with `target`, optional `url`, `branch`, `rule_index`).

2. Implement `evaluate(context: SmartlinkContext, core: SmartlinkCore): SmartlinkDecision`:
   - apply rules in defined order (priority or index);
   - support `when.country/lang/device/utm.*` matching with string or array;
   - if nothing matched — use `fallback_target`.

3. Provide a small validation helper (optional):
   - wrap Ajv for `ds:smartlink_rules_v1` or integrate with external validator.

4. Add unit tests:
   - cover at least:
     - single rule match,
     - fallthrough to fallback,
     - UTM-based routing,
     - DE/mobile vs desktop.

### 4.2 Worker — `packages/worker-smartlink`

**Goal:** Cloudflare Worker that exposes:

- public: `GET /s/:linkId`
- admin: minimal `/api` endpoints for SPA.

Tasks:

1. Routing:
   - use a simple router (tiny lib or hand-made).
   - map `/s/:linkId` → public handler.
   - map `/api/smartlinks/:linkId` → admin handler (for now, get + put).

2. Public handler `/s/:linkId`:
   - read `linkId` from path.
   - extract context:
     - `cf.country`,
     - headers (`accept-language`, `user-agent`),
     - query (including `utm_*`, `debug`).
   - normalize context using helpers (lang, device, utm).
   - read SmartlinkCore from KV (`KV_SMARTLINK_RULES`).
   - call `evaluate(context, core)` from `core-smartlink`.
   - compute final URL:
     - for MVP: assume `decision.target` is already a URL;
     - later: allow mapping `target_id` → URL via a dictionary.
   - if `debug=1`:
     - return JSON with context + decision.
   - else:
     - return `302` with `Location`.

3. Admin handler `/api/smartlinks/:linkId` (MVP):
   - `GET` → read SmartlinkCore from KV and return JSON.
   - `PUT` → accept JSON SmartlinkCore:
     - ensure `link_id` in body == `:linkId`;
     - validate against ds:smartlink_rules_v1;
     - write to KV.

4. Bindings:
   - expect KV binding `KV_SMARTLINK_RULES`.
   - optional: queue binding for `smartlink.redirected` events.

### 4.3 SPA — `packages/spa-admin`

**Goal:** simple admin interface on Cloudflare Pages to edit one SmartlinkCore.

Tasks (MVP):

1. Setup:
   - any framework (React/Vue/Svelte).
   - dev proxy `/api` → Worker URL for local development.

2. Screens:
   - **Editor for one smartlink**:
     - load SmartlinkCore from `/api/smartlinks/:linkId` (for MVP: a fixed id).
     - show fields:
       - `link_id` (read-only),
       - `purpose`,
       - `status` (readonly for now, or simple dropdown),
       - `context_shape` (checkboxes),
       - table of `rules[]` (add/remove/edit),
       - `fallback_target`.
     - save via `PUT /api/smartlinks/:linkId`.
   - **Test panel** (optional in MVP):
     - form with `country/lang/device/utm.*`;
     - POST `/api/smartlinks/:linkId/test` when implemented.

3. No authentication logic in v1:
   - assume admin panel is protected via Cloudflare Access or simple password in front.

## 5. Scope vs Non-goals

### In scope for v1 (this repo):

- MOVA artifacts (ds/env/global/meta + example).
- Core TypeScript library.
- Worker with `/s/:linkId` and `/api/smartlinks/:linkId`.
- Minimal SPA with one-editor flow.

### Out of scope for v1:

- Full-blown analytics dashboards.
- Separate destinations registry (`dest:*`) with its own CRUD.
- Complex role-based permissions.
- Multi-tenant management and billing.

These can be added as v1.x / v2 extensions.

## 6. Source of truth

- For MOVA structure: `envelope.3.6.0.schema.json`, `global.3.6.0.schema.json`, `meta-model.3.6.0.schema.json`.
- For Smartlink domain: `schemas/*.json` in this package.
- For implementation: this `SMARTLINK_SPEC.md` plus `TASKS_SMARTLINK_V1.md`.

Chat logs and additional notes are **auxiliary** and must not override JSON schemas.

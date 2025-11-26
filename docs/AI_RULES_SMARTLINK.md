# AI Rules for Smartlink Atom (Codex/Gemini/Qwen)

This document defines how an AI agent should work with this repository when implementing or modifying the Smartlink atom.

## 1. Do not invent new MOVA core concepts

- Use only the existing MOVA prefixes and artifact kinds:
  - `env:` — envelopes,
  - `ds:` — data schemas,
  - `role:` — roles,
  - `res:` — resources,
  - `st:` — states.
- Do not introduce new base prefixes or artifact kinds inside core files.
- If you feel that something is missing, leave a TODO for the human author instead of extending the core.

## 2. JSON schemas have priority over chat text

When in doubt:

1. Check these schemas:
   - `schemas/ds.smartlink_rules_v1.schema.json`
   - `schemas/env.smartlink_default_v1.json`
   - `schemas/global.smartlink_v1.json`
   - `schemas/meta.smartlink_v1.json`
2. Check MOVA core schemas:
   - `mova-core/envelope.3.6.0.schema.json`
   - `mova-core/global.3.6.0.schema.json`
   - `mova-core/meta-model.3.6.0.schema.json`

Always adapt the code to match **schemas**, not the other way around.

## 3. Architecture is fixed for v1

Do not change the basic structure:

- packages:
  - `core-smartlink` — pure logic, no HTTP/Cloudflare.
  - `worker-smartlink` — Cloudflare Worker: `/s/:linkId` and `/api/...`.
  - `spa-admin` — admin SPA on Pages.
- MOVA domain:
  - data schema: `ds:smartlink_rules_v1`.
  - envelope: `env:smartlink_default_v1`.
  - global fragment: `global.smartlink_v1.json`.

If you need to add something significant (new endpoints, new domain files), add a TODO and keep the existing architecture intact.

## 4. Core 3.6.0 artifacts are read-only

Treat the following as **read-only references**:

- `mova-core/meta-model.3.6.0.schema.json`
- `mova-core/meta-model.3.6.0.json`
- `mova-core/global.3.6.0.schema.json`
- `mova-core/global.core.3.6.0.json`
- `mova-core/envelope.3.6.0.schema.json`
- `mova-core/verbs.core.3.6.0.json`
- `mova-core/MOVA_CORE_3.6.0_CONTRACT.md`
- `mova-core/MOVA_META_MODEL_v1.md`

You may **read** them to align implementation, but must not modify them in this atom.

## 5. How to handle uncertainty

When something is not clearly specified:

- Prefer **small, composable helpers** over new abstractions.
- Leave explicit TODO comments for the human:

```ts
// TODO(Smartlink-Spec): clarify whether we need separate destinations registry (dest:*).
```

- Do not:
  - invent new MOVA prefixes;
  - silently change ids, categories or bindings defined in `schemas/*.json`.

## 6. Coding style and boundaries

- Keep `core-smartlink` free from:
  - HTTP types,
  - Cloudflare-specific APIs,
  - KV bindings.
- Keep `worker-smartlink` as a thin adapter:
  - request → normalized SmartlinkContext,
  - KV → SmartlinkCore,
  - `evaluate()` → decision,
  - decision → redirect or JSON.
- Keep `spa-admin` minimal:
  - no complex state management libraries unless clearly needed,
  - no design system lock-in (plain HTML/CSS/JS or light framework components are fine).

If in doubt, choose a simpler implementation and document trade-offs in comments.

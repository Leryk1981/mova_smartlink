# SmartLink Specification — MOVA 5.0.0 Compatibility Profile

**Version:** 5.0.0-compat-v1  
**Status:** Active  
**Domain:** Edge routing / Smart links  
**MOVA Core Baseline:** 5.0.0 (`https://github.com/mova-compact/mova-spec`)

## 1. Scope

This document defines how SmartLink contracts are aligned with MOVA 5.0.0 while preserving existing runtime behavior and schema ids used in production.

Design choice:
- keep runtime/business logic unchanged;
- keep schema ids stable (`ds.smartlink_*_v1`, `env.smartlink_*_v1`);
- align interpretation and governance with MOVA 5.0.0 core principles.

## 2. Profile Artifacts

Current profile artifacts are in:
- `mova4-smartlink/schemas/`
- `mova4-smartlink/examples/`

The directory name is historical and intentionally preserved for compatibility with existing integrations.

## 3. Contract Set

Data schemas:
- `ds.smartlink_config_v1`
- `ds.smartlink_click_context_v1`
- `ds.smartlink_resolution_result_v1`
- `ds.smartlink_stats_query_v1`
- `ds.smartlink_stats_report_v1`
- `ds.episode_smartlink_resolution_v1`

Envelopes:
- `env.smartlink_resolve_v1`
- `env.smartlink_stats_get_v1`

## 4. MOVA 5.0.0 Alignment Rules

1. SmartLink contracts are treated as a domain profile over MOVA core concepts (`ds.*`, `env.*`, `global.*`).
2. Executors remain external; schemas/envelopes define boundaries, not implementation.
3. Episodes are first-class evidence artifacts for reproducibility and analysis.
4. Breaking contract changes require new schema versions (`*_v2`), not silent edits.

## 5. Runtime and Validation

Runtime components:
- `packages/core-smartlink/`
- `packages/worker-smartlink/`
- `packages/spa-admin/`

Validation and quality gates:
- `npm test`
- `npm run build`
- `npm run lint`

## 6. Compatibility Notes

- Historical MOVA 4.0 core docs remain in `mova_4_0_0_spec/` as archive.
- Detailed historical SmartLink 4.0 specification remains in `SMARTLINK_SPEC_4.0.md`.
- This document is the current reference for MOVA 5.0.0-compatible positioning.

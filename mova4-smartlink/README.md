# SmartLink Domain Profile — MOVA 5.0.0 Compatibility

This folder contains SmartLink domain artifacts aligned with MOVA 5.0.0 contracts.
Directory name `mova4-smartlink/` is preserved for backward path compatibility.

SmartLink is a data-first smart routing system for edge computing environments.  
It enables marketers to create context-aware link routing rules (by country, device, UTM params, etc.) without writing code.

## Structure

```
mova4-smartlink/
  schemas/        — SmartLink JSON Schemas (ds.*, env.*, episodes)
  examples/       — Valid instance examples
  docs/           — Specifications and guides
  README.md       — This file
```

## MOVA 5.0.0 Compatibility Architecture

SmartLink implements the MOVA contract approach:

### Data Schemas (ds.*)

- `ds.smartlink_config_v1` — Configuration for one smartlink (rules, targets, context)
- `ds.smartlink_click_context_v1` — Normalized context of a single click
- `ds.smartlink_resolution_result_v1` — Result of routing decision
- `ds.smartlink_stats_query_v1` — Query for statistics
- `ds.smartlink_stats_report_v1` — Statistics report

### Envelopes (env.*)

- `env.smartlink_resolve_v1` — Speech-act: resolve a click to a target URL
- `env.smartlink_stats_get_v1` — Speech-act: retrieve statistics

### Episodes (Genetic Layer)

- `ds.episode_smartlink_resolution_v1` — Records one execution of smartlink resolution

## Execution

MOVA **does not execute** anything.  
Execution is handled by external systems (e.g., Cloudflare Workers, agents, etc.).

The worker implementation lives in:
- `../packages/worker-smartlink/`
- `../packages/core-smartlink/` (pure evaluation logic)

## Documentation

- `docs/SMARTLINK_SPEC_5.0.md` — Current SmartLink profile specification (MOVA 5.0.0 compatible)
- `docs/SMARTLINK_SPEC_4.0.md` — Historical 4.0 specification
- `../docs/AI_RULES_SMARTLINK.md` — AI agent integration rules
- `../README.md` — Project overview

## Migration lineage

Legacy MOVA 3.6-based artifacts are in `../legacy/`.
MOVA 4.0 core artifacts are archived in `../mova_4_0_0_spec/`.
Canonical MOVA 5.0 core is published at `https://github.com/mova-compact/mova-spec`.

---

**Version:** MOVA 5.0.0 compatibility profile  
**Status:** Active development  
**Task:** Compatibility upgrade to MOVA 5.0.0 with stable runtime paths

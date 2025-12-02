# SmartLink — MOVA 4.0.0

This folder contains **SmartLink artifacts built on MOVA 4.0.0**.

SmartLink is a data-first smart routing system for edge computing environments.  
It enables marketers to create context-aware link routing rules (by country, device, UTM params, etc.) without writing code.

## Structure

```
mova4-smartlink/
  schemas/        — MOVA 4.0 JSON Schemas (ds.*, env.*, episodes)
  examples/       — Valid instance examples
  docs/           — Specifications and guides
  README.md       — This file
```

## MOVA 4.0.0 Architecture

SmartLink implements the full MOVA 4.0 stack:

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

MOVA 4.0.0 **does not execute** anything.  
Execution is handled by external systems (e.g., Cloudflare Workers, agents, etc.).

The worker implementation lives in:
- `../packages/worker-smartlink/`
- `../packages/core-smartlink/` (pure evaluation logic)

## Documentation

- `docs/SMARTLINK_SPEC_4.0.md` — Full specification
- `../docs/AI_RULES_SMARTLINK.md` — AI agent integration rules
- `../README.md` — Project overview

## Migration from 3.6

Legacy MOVA 3.6-based artifacts are in `../legacy/`.

See `../mova_4_0_0_spec/docs/mova_4.0.0_migration_from_3.6.md` for migration guide.

---

**Version:** MOVA 4.0.0  
**Status:** Active development  
**Task:** SL-CORE-4.0 (Migration to MOVA 4.0.0 + Genetic Layer)

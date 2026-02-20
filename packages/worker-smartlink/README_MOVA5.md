# Worker SmartLink — MOVA 5.0 Compatibility Guide

This guide describes the SmartLink Worker profile aligned with MOVA 5.0.0.

## Scope

- Endpoints stay stable:
  - `POST /smartlink/resolve` (`env.smartlink_resolve_v1`)
  - `POST /smartlink/stats` (`env.smartlink_stats_get_v1`)
- Runtime behavior is unchanged from the proven production flow.
- Contract governance is aligned with MOVA 5.0.0 core.

## Contract Sources

- SmartLink profile schemas: `../../mova4-smartlink/schemas/`
- SmartLink profile spec: `../../mova4-smartlink/docs/SMARTLINK_SPEC_5.0.md`
- MOVA core 5.0.0: `https://github.com/mova-compact/mova-spec`

## Notes

- File and folder names containing `mova4` are preserved for backward compatibility.
- Executor metadata now reports MOVA 5 compatibility (`executor_version: 2.1.0-mova5`).

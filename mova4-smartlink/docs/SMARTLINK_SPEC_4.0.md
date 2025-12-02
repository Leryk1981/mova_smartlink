# SmartLink Specification — MOVA 4.0.0

**Version:** 4.0.0  
**Status:** Active  
**Domain:** Edge routing / Smart links  
**MOVA Core:** 4.0.0

## 1. Overview

SmartLink is a **data-first smart routing system** built on MOVA 4.0.0 architecture.

It enables marketers and developers to create context-aware link routing rules without writing code.  
Routing decisions are based on:
- Geographic location (country)
- Device type (mobile, tablet, desktop)
- Language preference
- UTM campaign parameters
- Custom query parameters

### Key Principles

1. **Data-first**: All routing logic is expressed as structured data (JSON schemas)
2. **Declarative**: Configuration describes _what_ to route, not _how_ to execute
3. **MOVA 4.0 compliant**: Clear separation between data, envelopes, and execution
4. **Observable**: Every routing decision can be captured as an episode for analysis

### Architecture

SmartLink implements the full MOVA 4.0.0 stack:

```
┌─────────────────────────────────────────┐
│  UX / Applications (L3)                 │
│  - Admin SPA                            │
│  - Analytics dashboards                 │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  MOVA Layer (L2) — THIS SPECIFICATION   │
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

## 2. MOVA Artifacts

### 2.1 Data Schemas (ds.*)

SmartLink defines five core data types:

#### `ds.smartlink_config_v1`

**Purpose:** Configuration for a single SmartLink.

**Key fields:**
- `smartlink_id` — Unique identifier (used in URLs and storage keys)
- `name`, `description` — Human-readable metadata
- `status` — `draft`, `active`, `paused`, `archived`
- `targets[]` — Array of routing targets with conditions
  - `target_id` — Unique identifier within this smartlink
  - `url` — Destination URL
  - `conditions` — Activation conditions (country, language, device, utm)
  - `priority` — Lower number = higher priority
  - `enabled` — Boolean flag
  - `valid_from`, `valid_until` — Optional time constraints
- `default_target_id` — Fallback target when no conditions match
- `limits` — Optional operational limits (max clicks, validity period)
- `tags`, `notes` — Organizational metadata
- `meta` — Version, timestamps, audit trail

**Schema location:** `mova4-smartlink/schemas/ds.smartlink_config_v1.schema.json`

---

#### `ds.smartlink_click_context_v1`

**Purpose:** Normalized context data for a single click.

**Key fields:**
- `smartlink_id` — The smartlink being accessed
- `timestamp` — When the click occurred
- `ip` — Client IP address
- `country` — ISO 3166-1 alpha-2 code
- `language` — ISO 639-1 language code
- `device` — `mobile`, `tablet`, `desktop`, `bot`, `unknown`
- `user_agent` — Raw User-Agent string
- `referrer` — Referrer URL
- `utm` — UTM parameters (source, medium, campaign, term, content)
- `query_params` — Additional query parameters
- `edge_location` — Edge datacenter identifier

**Schema location:** `mova4-smartlink/schemas/ds.smartlink_click_context_v1.schema.json`

---

#### `ds.smartlink_resolution_result_v1`

**Purpose:** Result of resolving a click to a target URL.

**Key fields:**
- `smartlink_id` — The smartlink that was resolved
- `resolved_target_id` — The selected target ID
- `resolved_url` — The final destination URL
- `outcome` — `OK`, `NO_MATCH`, `DEFAULT_USED`, `ERROR`, `RATE_LIMIT`, `EXPIRED`, `DISABLED`
- `reason` — Short explanation of the outcome
- `matched_conditions` — Summary of which conditions matched
- `latency_ms` — Resolution time
- `executor_id`, `executor_version` — Executor metadata
- `debug_info` — Optional debug data

**Schema location:** `mova4-smartlink/schemas/ds.smartlink_resolution_result_v1.schema.json`

---

#### `ds.smartlink_stats_query_v1`

**Purpose:** Query parameters for statistics retrieval.

**Key fields:**
- `smartlink_id` — Optional filter by smartlink
- `time_range` — `from` and `to` timestamps
- `group_by` — Dimensions to group by (target_id, country, device, utm_source, etc.)
- `filters` — Additional filters (target_id, country, device, outcome)
- `limit`, `offset` — Pagination

**Schema location:** `mova4-smartlink/schemas/ds.smartlink_stats_query_v1.schema.json`

---

#### `ds.smartlink_stats_report_v1`

**Purpose:** Statistics report with aggregated metrics.

**Key fields:**
- `query` — The original query
- `summary` — Aggregated totals (total_clicks, successful_redirects, errors, avg_latency_ms, etc.)
- `rows[]` — Detailed rows grouped by query dimensions
  - `dimensions` — Grouping values
  - `metrics` — Aggregated metrics for this group
- `meta` — Report generation metadata

**Schema location:** `mova4-smartlink/schemas/ds.smartlink_stats_report_v1.schema.json`

---

### 2.2 Envelopes (env.*)

SmartLink defines two core envelopes (speech-acts):

#### `env.smartlink_resolve_v1`

**Verb:** `route` (choose among targets based on context)

**Purpose:** Resolve a click to a target URL.

**Structure:**
- `envelope_id` — `"env.smartlink_resolve_v1"`
- `verb` — `"route"`
- `correlation_id` — Unique request identifier
- `roles` — `requester`, `executor`
- `payload`
  - `input` — `ds.smartlink_click_context_v1`
  - `config` — `ds.smartlink_config_v1` (inline or by reference)
  - `output` — `ds.smartlink_resolution_result_v1` (populated by executor)
- `meta` — Timestamps, trace IDs, etc.

**Important:** This envelope describes _what_ needs to happen, not _how_.  
The executor (e.g., Cloudflare Worker) implements the actual routing logic.

**Schema location:** `mova4-smartlink/schemas/env.smartlink_resolve_v1.schema.json`

---

#### `env.smartlink_stats_get_v1`

**Verb:** `get` (retrieve data)

**Purpose:** Retrieve SmartLink statistics.

**Structure:**
- `envelope_id` — `"env.smartlink_stats_get_v1"`
- `verb` — `"get"`
- `correlation_id` — Unique request identifier
- `roles` — `requester`, `executor`
- `payload`
  - `input` — `ds.smartlink_stats_query_v1`
  - `output` — `ds.smartlink_stats_report_v1` (populated by executor)
- `meta` — Timestamps, trace IDs, etc.

**Schema location:** `mova4-smartlink/schemas/env.smartlink_stats_get_v1.schema.json`

---

### 2.3 Episodes (Genetic Layer)

#### `ds.episode_smartlink_resolution_v1`

**Purpose:** Capture one execution of SmartLink resolution for pattern memory and analysis.

**Key fields:**
- `episode_id` — Unique episode identifier
- `envelope_id` — Always `"env.smartlink_resolve_v1"`
- `envelope_instance_id` — Correlation/request ID
- `timestamp_start`, `timestamp_end` — Execution timespan
- `input` — Click context (inline or by reference)
- `config` — SmartLink config used (inline or by reference)
- `output` — Resolution result (inline or by reference)
- `executor` — Executor metadata (type, version, instance, location)
- `metrics` — Performance metrics (latency_ms, config_fetch_ms, evaluation_ms, retries, cache_hit)
- `outcome` — `success`, `partial_success`, `failure`, `error`
- `outcome_details` — Detailed outcome information
- `quality_signals` — Quality indicators (user_bounced, conversion, anomaly_detected, confidence_score)
- `notes` — Optional human/AI notes
- `analysis` — Optional post-execution analysis with insights and tags

**Usage:**
- Episodes are **records**, not executors
- They are created after resolution completes
- They can be aggregated for learning, optimization, and debugging
- Episodes enable pattern memory for AI agents

**Schema location:** `mova4-smartlink/schemas/ds.episode_smartlink_resolution_v1.schema.json`

---

## 3. Examples

All examples are validated against their respective schemas.

### Example 1: SmartLink Configuration

See `mova4-smartlink/examples/smartlink_config.spring_sale_2026.json`

A real-world configuration for a Spring 2026 campaign with:
- Multiple targets for different countries, devices, and UTM sources
- Priority-based routing
- Time-based validity constraints
- Comprehensive metadata

### Example 2: Click Context

See `mova4-smartlink/examples/click_context.example.json`

A normalized click context from a TikTok mobile ad in Germany.

### Example 3: Resolution Result

See `mova4-smartlink/examples/resolution_result.example.json`

The result of routing the above click to the appropriate target.

### Example 4: Envelope Instance

See `mova4-smartlink/examples/env.smartlink_resolve.example.json`

A complete envelope instance showing request and response.

### Example 5: Episode

See `mova4-smartlink/examples/episode.smartlink_resolution.example.json`

A complete episode record with metrics, quality signals, and analysis.

### Example 6: Statistics Query & Report

See `mova4-smartlink/examples/stats_query.example.json` and `stats_report.example.json`

Query for March 2026 statistics grouped by target and country, with aggregated results.

---

## 4. Implementation Notes

### Execution is External

MOVA 4.0.0 **does not execute** anything.  
SmartLink resolution is implemented by external executors:

- **Core library** (`packages/core-smartlink/`): Pure TypeScript evaluation logic
- **Worker** (`packages/worker-smartlink/`): Cloudflare Worker implementation
- **Admin SPA** (`packages/spa-admin/`): Web UI for configuration management

### Red Boundaries

SmartLink uses MOVA validation at these critical boundaries:

1. **Configuration storage**: Only valid `ds.smartlink_config_v1` may be stored
2. **Episode recording**: Only valid `ds.episode_smartlink_resolution_v1` may be recorded
3. **Statistics exports**: Only valid `ds.smartlink_stats_report_v1` may be exported

Internal processing may use ad-hoc formats for speed.

### Versioning

- All schemas use `_v1` suffix
- Breaking changes require new version (e.g., `_v2`)
- Executors must declare which schema versions they support

---

## 5. Migration from MOVA 3.6

SmartLink was originally built on MOVA 3.6.x.

### What Changed

1. **Data model evolved**:
   - Old: `ds.smartlink_rules_v1` (single schema with embedded rules)
   - New: Separate schemas for config, context, result, stats

2. **Envelopes are declarative**:
   - Old: `env.smartlink_default_v1` (implied execution semantics)
   - New: `env.smartlink_resolve_v1` (pure speech-act)

3. **Added genetic layer**:
   - New: `ds.episode_smartlink_resolution_v1` for pattern memory

4. **Cleaner separation**:
   - MOVA layer (this spec) is pure data and contracts
   - Execution logic lives in external packages

### Legacy Artifacts

All MOVA 3.6 artifacts are archived in `../legacy/`:
- `schemas/ds.smartlink_rules_v1.schema.json`
- `schemas/env.smartlink_default_v1.json`
- `mova-core/` (MOVA 3.6.0 core specs)
- Old examples

See `../legacy/README.md` for details.

---

## 6. References

### Core MOVA 4.0.0 Documentation

- `../mova_4_0_0_spec/docs/mova_4.0.0_core.md` — MOVA 4.0.0 core specification
- `../mova_4_0_0_spec/docs/mova_4.0.0_layers.md` — Layer model
- `../mova_4_0_0_spec/docs/mova_4.0.0_migration_from_3.6.md` — Migration guide

### SmartLink Documentation

- `../docs/AI_RULES_SMARTLINK.md` — AI agent integration rules
- `../docs/TASKS_SMARTLINK_V1.md` — Task tracking and history
- `../README.md` — Project overview

### Schemas

All schemas: `mova4-smartlink/schemas/`

### Examples

All examples: `mova4-smartlink/examples/`

---

## 7. Status and Roadmap

### Current Status

- ✅ MOVA 4.0.0 migration complete (Task SL-CORE-4.0)
- ✅ All core schemas defined
- ✅ Examples validated
- ✅ Genetic layer (episodes) implemented
- 🔄 Executor implementation in progress

### Future Enhancements

- Multi-tenant support
- Advanced A/B testing with traffic splitting
- Machine learning-based routing optimization
- Real-time analytics dashboard
- Destination registry (separate `ds.destination_*` schemas)

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-12-02  
**Task:** SL-CORE-4.0

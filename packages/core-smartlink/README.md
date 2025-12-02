# @mova/core-smartlink

Pure TypeScript library for SmartLink evaluation - MOVA 4.0.0

## Overview

`@mova/core-smartlink` provides pure functions for SmartLink routing logic:

- **No I/O**: No HTTP requests, no database calls, no KV access
- **Deterministic**: Same input → same output
- **Type-safe**: Full TypeScript types from MOVA 4.0 schemas
- **Validated**: JSON Schema validation via Ajv

## Installation

```bash
npm install @mova/core-smartlink
```

## Usage (MOVA 4.0.0)

### Basic Resolution

```typescript
import { resolveSmartlink } from '@mova/core-smartlink';
import type { SmartlinkConfig, SmartlinkClickContext } from '@mova/core-smartlink';

const config: SmartlinkConfig = {
  smartlink_id: 'spring_2026',
  status: 'active',
  targets: [
    {
      target_id: 'de_mobile',
      url: 'https://example.de/mobile',
      conditions: {
        country: 'DE',
        device: 'mobile',
      },
      priority: 10,
    },
    {
      target_id: 'default',
      url: 'https://example.com/default',
      conditions: {},
      priority: 100,
    },
  ],
  default_target_id: 'default',
};

const context: SmartlinkClickContext = {
  smartlink_id: 'spring_2026',
  timestamp: new Date().toISOString(),
  country: 'DE',
  device: 'mobile',
};

const result = resolveSmartlink(config, context);
// result.outcome === 'OK'
// result.resolved_url === 'https://example.de/mobile'
```

### Validation

```typescript
import { validateConfig, validateClickContext } from '@mova/core-smartlink';

// Validate config
const configResult = validateConfig(configData);
if (!configResult.ok) {
  console.error('Config validation failed:', configResult.error);
  return;
}

// Validate context
const contextResult = validateClickContext(contextData);
if (!contextResult.ok) {
  console.error('Context validation failed:', contextResult.error);
  return;
}

// Both valid - proceed
const result = resolveSmartlink(configResult.value, contextResult.value);
```

### Statistics

```typescript
import { buildStatsReport } from '@mova/core-smartlink';
import type { SmartlinkResolutionEpisode, SmartlinkStatsQuery } from '@mova/core-smartlink';

const episodes: SmartlinkResolutionEpisode[] = [
  /* ... episodes from storage ... */
];

const query: SmartlinkStatsQuery = {
  smartlink_id: 'spring_2026',
  time_range: {
    from: '2026-03-01T00:00:00Z',
    to: '2026-03-31T23:59:59Z',
  },
  group_by: ['target_id', 'country'],
};

const report = buildStatsReport(episodes, query);
console.log(`Total clicks: ${report.summary.total_clicks}`);
console.log(`Successful: ${report.summary.successful_redirects}`);
```

## API Reference

### Core Functions

#### `resolveSmartlink(config, context, now?): SmartlinkResolutionResult`

Resolve a click to a target URL.

**Parameters:**
- `config: SmartlinkConfig` — SmartLink configuration (ds.smartlink_config_v1)
- `context: SmartlinkClickContext` — Click context (ds.smartlink_click_context_v1)
- `now?: Date` — Optional timestamp (defaults to context.timestamp)

**Returns:** `SmartlinkResolutionResult` (ds.smartlink_resolution_result_v1)

**Logic:**
1. Check if smartlink is active (status, time limits)
2. Filter active targets (enabled, time-based)
3. Sort by priority (lower = higher priority)
4. Find first matching target
5. Return result with appropriate outcome

**Outcomes:**
- `OK` — Target matched successfully
- `DEFAULT_USED` — No match, used default target
- `NO_MATCH` — No active targets
- `ERROR` — Configuration error (e.g., default target not found)
- `EXPIRED` — SmartLink expired or not yet active
- `DISABLED` — SmartLink is disabled

#### `buildStatsReport(episodes, query): SmartlinkStatsReport`

Build statistics report from episodes.

**Parameters:**
- `episodes: SmartlinkResolutionEpisode[]` — Array of episodes
- `query: SmartlinkStatsQuery` — Query with filters, grouping, pagination

**Returns:** `SmartlinkStatsReport` (ds.smartlink_stats_report_v1)

### Validation Functions

#### `validateConfig(data): Result<SmartlinkConfig, ValidationError[]>`

Validate SmartLink configuration against schema.

#### `validateClickContext(data): Result<SmartlinkClickContext, ValidationError[]>`

Validate click context against schema.

#### `validateResolutionResult(data): Result<SmartlinkResolutionResult, ValidationError[]>`

Validate resolution result against schema.

## Types

All TypeScript types are generated from MOVA 4.0 JSON Schemas:

```typescript
import type {
  // Data types (ds.*)
  SmartlinkConfig,
  SmartlinkClickContext,
  SmartlinkResolutionResult,
  SmartlinkStatsQuery,
  SmartlinkStatsReport,
  SmartlinkResolutionEpisode,
  
  // Envelopes (env.*)
  SmartlinkResolveEnvelope,
  SmartlinkStatsGetEnvelope,
  
  // Utilities
  Result,
  ValidationError,
} from '@mova/core-smartlink';
```

## Legacy API (MOVA 3.6)

The legacy API is still available for backwards compatibility:

```typescript
import { evaluate } from '@mova/core-smartlink';
import type { SmartlinkCore, SmartlinkContext } from '@mova/core-smartlink';

const decision = evaluate(context, core);
```

**Recommended:** Migrate to MOVA 4.0 API (resolveSmartlink) for new projects.

## Testing

```bash
npm test
```

Tests cover:
- Resolution logic (priority, conditions, time-based)
- Validation (schemas, required fields)
- Statistics (grouping, filtering, aggregation)

## Schema Compliance

All functions comply with MOVA 4.0 schemas:

- `ds.smartlink_config_v1.schema.json`
- `ds.smartlink_click_context_v1.schema.json`
- `ds.smartlink_resolution_result_v1.schema.json`
- `ds.smartlink_stats_query_v1.schema.json`
- `ds.smartlink_stats_report_v1.schema.json`
- `ds.episode_smartlink_resolution_v1.schema.json`

Schema files: `../../mova4-smartlink/schemas/`

## Architecture

This library is **Layer 1** (Executors) in the MOVA 4.0 architecture:

```
┌─────────────────────────────────────────┐
│  MOVA Layer (L2)                        │
│  - Schemas (ds.*, env.*)                │
│  - No execution logic                   │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Executors (L1) ← THIS LIBRARY          │
│  - Pure evaluation functions            │
│  - Validation                           │
│  - Statistics                           │
└─────────────────────────────────────────┘
              ↕
┌─────────────────────────────────────────┐
│  Models & Tools (L0)                    │
│  - Storage (KV, DB)                     │
│  - HTTP runtime (Worker, Lambda)        │
└─────────────────────────────────────────┘
```

**This library:**
- Implements evaluation logic
- Does NOT handle HTTP, KV, or I/O

**Worker (`@mova/worker-smartlink`):**
- Handles HTTP requests
- Reads config from KV
- Calls this library
- Records episodes

## Documentation

- [SmartLink 4.0 Specification](../../mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md)
- [AI Rules](../../docs/AI_RULES_SMARTLINK.md)
- [Migration Guide](../../MIGRATION_SUMMARY.md)

## License

MIT

---

**Version:** 2.0.0 (MOVA 4.0.0)  
**Package:** @mova/core-smartlink

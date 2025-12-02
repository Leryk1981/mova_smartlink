# AI Rules for SmartLink Development

**Version:** 2.0 (MOVA 4.0.0)  
**Last Updated:** 2025-12-02  
**Target Audience:** AI agents, LLMs, autonomous development tools

## 1. Core Principles

When working with SmartLink, AI agents MUST follow these principles:

### 1.1 MOVA 4.0.0 Architecture

SmartLink is built on **MOVA 4.0.0** — a data-first contract language.

**Key rules:**
- MOVA **does not execute** anything
- MOVA defines data structures (`ds.*`), envelopes (`env.*`), and episodes
- Execution is handled by external systems (workers, agents, tools)

### 1.2 Source of Truth

The canonical source of truth is:

**Primary:**
- `mova4-smartlink/schemas/*.schema.json` — All MOVA 4.0 schemas (ds.*, env.*, episodes)
- `mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md` — Specification
- `mova4-smartlink/examples/*.json` — Validated examples

**Legacy (read-only, archived):**
- `legacy/schemas/` — MOVA 3.6 schemas (do NOT use for new development)
- `legacy/mova-core/` — MOVA 3.6.0 core specs

**Core MOVA 4.0 Reference:**
- `mova_4_0_0_spec/docs/mova_4.0.0_core.md`
- `mova_4_0_0_spec/docs/mova_4.0.0_layers.md`

### 1.3 Schema Compliance

All SmartLink data MUST validate against the appropriate JSON Schema:

- Configurations → `ds.smartlink_config_v1.schema.json`
- Click contexts → `ds.smartlink_click_context_v1.schema.json`
- Resolution results → `ds.smartlink_resolution_result_v1.schema.json`
- Episodes → `ds.episode_smartlink_resolution_v1.schema.json`

**Validation:**
- Use JSON Schema 2020-12 validators
- Reject invalid data at red boundaries (storage, recording, export)
- Internal processing may use ad-hoc formats

---

## 2. Working with SmartLink Components

### 2.1 Data Schemas (ds.*)

**Rules:**
1. Always reference the latest schema version from `mova4-smartlink/schemas/`
2. Do NOT modify core schemas without explicit user approval
3. Use `additionalProperties: false` in production schemas
4. Provide clear descriptions for all fields
5. Use enums where values are constrained
6. Use format validators (`date-time`, `uri`, etc.) appropriately

**Example valid reference:**
```json
{
  "$ref": "ds.smartlink_config_v1.schema.json"
}
```

### 2.2 Envelopes (env.*)

**Rules:**
1. Envelopes are **speech-acts**, not implementation instructions
2. They describe:
   - Which verb is used (`route`, `get`, `record`, etc.)
   - Which data types are inputs/outputs
   - Which roles are involved
3. Envelopes do NOT contain:
   - Algorithm implementations
   - Control flow logic
   - Execution instructions

**Example envelope structure:**
```json
{
  "envelope_id": "env.smartlink_resolve_v1",
  "verb": "route",
  "roles": {
    "requester": "...",
    "executor": "..."
  },
  "payload": {
    "input": { ... },
    "output": { ... }
  }
}
```

### 2.3 Episodes (Genetic Layer)

**Rules:**
1. Episodes are **records** of what happened, not executors
2. Create episodes AFTER resolution completes
3. Include comprehensive metrics and signals
4. Episodes enable pattern memory and learning
5. Episodes can be aggregated for analysis

**Use episodes for:**
- Performance analysis
- Quality tracking
- Pattern discovery
- AI/ML training data
- Debugging and troubleshooting

---

## 3. Task-Specific Rules

### 3.1 Creating New SmartLink Configurations

**Steps:**
1. Start with `ds.smartlink_config_v1.schema.json`
2. Provide all required fields:
   - `smartlink_id` (unique, URL-safe)
   - `status` (draft/active/paused/archived)
   - `targets[]` (at least one target)
   - `default_target_id` (must reference a valid target)
3. For each target:
   - Provide `target_id` (unique within this smartlink)
   - Provide `url` (valid URI)
   - Define `conditions` based on routing needs
   - Set `priority` (lower = higher priority)
4. Validate against schema before saving
5. Use descriptive `name` and `description`

**Validation checklist:**
- [ ] All required fields present
- [ ] `default_target_id` references an existing target
- [ ] No duplicate `target_id` values
- [ ] All URLs are valid
- [ ] Priority values are sensible
- [ ] Conditions use supported fields (country, language, device, utm)

### 3.2 Implementing Routing Logic

**Context:** Routing logic lives in `packages/core-smartlink/` (NOT in MOVA layer).

**Rules:**
1. Read `ds.smartlink_config_v1` configuration
2. Read `ds.smartlink_click_context_v1` context
3. Evaluate targets in priority order
4. Match ALL specified conditions for a target to select it
5. Use `default_target_id` if no target matches
6. Return `ds.smartlink_resolution_result_v1`

**Matching logic:**
- String or array fields: check if context value is in the condition
- Case-insensitive for country codes
- Partial match for UTM parameters
- Device type must match exactly

### 3.3 Recording Episodes

**When to create episodes:**
- On every production resolution (if recording is enabled)
- On errors (for debugging)
- On anomalies (for quality monitoring)
- Selectively in development (sample rate)

**Episode structure:**
1. Generate unique `episode_id`
2. Link to `envelope_instance_id` (correlation_id)
3. Include full input, config reference, and output
4. Capture executor metadata
5. Record comprehensive metrics
6. Add quality signals (if available)
7. Optionally add analysis and tags

### 3.4 Generating Statistics

**Steps:**
1. Accept `ds.smartlink_stats_query_v1` query
2. Filter episodes/records by:
   - `smartlink_id` (if specified)
   - Time range
   - Additional filters
3. Group by requested dimensions
4. Aggregate metrics (counts, averages, etc.)
5. Return `ds.smartlink_stats_report_v1`

**Aggregation rules:**
- Count successful outcomes separately from errors
- Calculate average latencies
- Count unique dimensions (countries, targets, etc.)
- Respect pagination (limit, offset)

---

## 4. Code Generation Rules

### 4.1 TypeScript Types

**Rules:**
1. Generate TypeScript types from JSON Schemas
2. Use strict types (no `any`)
3. Export all data types
4. Use descriptive names matching schema titles

**Example:**
```typescript
// Generated from ds.smartlink_config_v1.schema.json
export interface SmartlinkConfig {
  smartlink_id: string;
  name?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  targets: SmartlinkTarget[];
  default_target_id: string;
  // ... other fields
}
```

### 4.2 Validation Functions

**Rules:**
1. Use Ajv or similar JSON Schema validator
2. Pre-compile schemas for performance
3. Return detailed error messages
4. Validate at red boundaries (storage, recording, export)

**Example:**
```typescript
import Ajv from 'ajv';
import schema from './ds.smartlink_config_v1.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(schema);

export function validateConfig(data: unknown): data is SmartlinkConfig {
  if (!validate(data)) {
    throw new Error(`Invalid config: ${ajv.errorsText(validate.errors)}`);
  }
  return true;
}
```

### 4.3 Worker Implementation

**Rules:**
1. Worker reads MOVA schemas but implements execution
2. Worker handles HTTP, KV, and edge-specific logic
3. Worker creates envelopes and episodes
4. Worker does NOT modify MOVA schemas

**Separation of concerns:**
- MOVA layer: data schemas, envelopes, episodes
- Core library: pure evaluation logic (no HTTP, no storage)
- Worker: HTTP handlers, KV access, envelope/episode creation

---

## 5. Documentation Rules

### 5.1 Schema Documentation

**Rules:**
1. Every schema MUST have:
   - `$schema` (JSON Schema 2020-12)
   - `$id` (canonical URL)
   - `title` (human-readable name)
   - `description` (purpose and context)
2. Every property SHOULD have a `description`
3. Use `examples` for complex types
4. Mark required fields explicitly

### 5.2 Code Comments

**Rules:**
1. Link to relevant schemas in comments
2. Explain non-obvious logic
3. Reference envelope/episode IDs when creating them
4. Document assumptions about data flow

**Example:**
```typescript
/**
 * Resolve a SmartLink click to a target URL.
 * 
 * Implements the execution logic for env.smartlink_resolve_v1.
 * 
 * @param context - Click context (ds.smartlink_click_context_v1)
 * @param config - SmartLink configuration (ds.smartlink_config_v1)
 * @returns Resolution result (ds.smartlink_resolution_result_v1)
 */
export function resolve(
  context: SmartlinkClickContext,
  config: SmartlinkConfig
): SmartlinkResolutionResult {
  // ...
}
```

---

## 6. Testing Rules

### 6.1 Schema Validation Tests

**Rules:**
1. Test all examples against their schemas
2. Test invalid data (missing required fields, wrong types, etc.)
3. Test edge cases (empty arrays, boundary values, etc.)

### 6.2 Routing Logic Tests

**Rules:**
1. Test exact matches (single condition)
2. Test multi-condition matches
3. Test priority ordering
4. Test fallback to default
5. Test time-based validity
6. Test enabled/disabled targets

### 6.3 Episode Recording Tests

**Rules:**
1. Verify all required fields are present
2. Verify metrics are reasonable
3. Verify references are valid
4. Test episode aggregation

---

## 7. Migration Rules

### 7.1 From MOVA 3.6 to 4.0

**DO:**
- Use new schemas from `mova4-smartlink/schemas/`
- Reference `SMARTLINK_SPEC_4.0.md`
- Update imports and type definitions
- Create episodes for important operations

**DON'T:**
- Use legacy schemas from `legacy/schemas/`
- Reference `env.smartlink_default_v1`
- Mix MOVA 3.6 and 4.0 artifacts
- Implement execution logic in MOVA layer

**Migration checklist:**
- [ ] Replace `ds.smartlink_rules_v1` with `ds.smartlink_config_v1`
- [ ] Add click context normalization
- [ ] Add resolution result structure
- [ ] Implement episode recording
- [ ] Update documentation references
- [ ] Archive legacy artifacts in `legacy/`

---

## 8. Version Management

### 8.1 Schema Versioning

**Rules:**
1. All schemas use `_v1`, `_v2` suffixes
2. Breaking changes require new version
3. Non-breaking changes can be added to existing version
4. Deprecated versions must be marked in documentation

**Breaking changes:**
- Removing required fields
- Changing field types
- Changing enum values
- Renaming fields

**Non-breaking changes:**
- Adding optional fields
- Adding new enum values (if supported by consumers)
- Relaxing constraints

### 8.2 Executor Versioning

**Rules:**
1. Executors declare supported schema versions
2. Executors SHOULD support multiple schema versions
3. Version mismatch MUST be reported in episodes

---

## 9. Error Handling

### 9.1 Validation Errors

**Rules:**
1. Reject invalid data at red boundaries
2. Return structured error messages
3. Include schema path and validation error
4. Log validation errors for analysis

### 9.2 Execution Errors

**Rules:**
1. Capture errors in resolution results (`outcome: ERROR`)
2. Create episodes for errors
3. Include error codes and messages
4. Enable retries where appropriate

### 9.3 Recovery Strategies

**Rules:**
1. Use default target on routing errors
2. Cache configurations for resilience
3. Implement circuit breakers for external dependencies
4. Record error episodes for analysis

---

## 10. Quick Reference

### Schema Locations

```
mova4-smartlink/schemas/
  ds.smartlink_config_v1.schema.json
  ds.smartlink_click_context_v1.schema.json
  ds.smartlink_resolution_result_v1.schema.json
  ds.smartlink_stats_query_v1.schema.json
  ds.smartlink_stats_report_v1.schema.json
  env.smartlink_resolve_v1.schema.json
  env.smartlink_stats_get_v1.schema.json
  ds.episode_smartlink_resolution_v1.schema.json
```

### Example Locations

```
mova4-smartlink/examples/
  smartlink_config.spring_sale_2026.json
  click_context.example.json
  resolution_result.example.json
  env.smartlink_resolve.example.json
  episode.smartlink_resolution.example.json
  stats_query.example.json
  stats_report.example.json
```

### Key Verbs

- `route` — Choose among targets (used in env.smartlink_resolve_v1)
- `get` — Retrieve data (used in env.smartlink_stats_get_v1)
- `record` — Append to memory (used for episode recording)

### Key Outcomes

Resolution outcomes:
- `OK` — Successfully matched a target
- `NO_MATCH` — No target matched, error occurred
- `DEFAULT_USED` — Used default target (no specific match)
- `ERROR` — Execution error
- `RATE_LIMIT` — Rate limit exceeded
- `EXPIRED` — SmartLink expired
- `DISABLED` — SmartLink disabled

Episode outcomes:
- `success` — All good
- `partial_success` — Completed with warnings
- `failure` — Failed but handled
- `error` — Unhandled error

---

## 11. Contact and Updates

For questions or updates to these rules:

1. Check `mova4-smartlink/docs/SMARTLINK_SPEC_4.0.md`
2. Review MOVA 4.0.0 core documentation
3. Examine validated examples
4. Consult task history in `docs/TASKS_SMARTLINK_V1.md`

**Last Updated:** 2025-12-02  
**Task:** SL-CORE-4.0  
**Version:** 2.0 (MOVA 4.0.0 compliant)

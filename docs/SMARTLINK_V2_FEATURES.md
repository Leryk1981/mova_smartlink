# Smartlink Rules v2 - Enhanced Features

**Status**: ✅ Implemented  
**Version**: 2.0  
**Date**: 2025-11-27

## Overview

Smartlink Rules v2 extends the original routing logic with powerful new capabilities for managing rule lifecycle, prioritization, and A/B testing - all without breaking existing configurations.

## New Features

### 1. Rule Enablement (`enabled`)

Control whether a rule is active without deleting it from the configuration.

```json
{
  "id": "summer_sale",
  "enabled": false,
  "when": { "country": "US" },
  "target": "https://example.com/summer-sale"
}
```

- **Type**: `boolean`
- **Default**: `true`
- **Use case**: Temporarily pause rules during testing or seasonal changes

### 2. Time-Based Activation (`start_at`, `end_at`)

Automatically activate and deactivate rules based on date/time ranges.

```json
{
  "id": "black_friday",
  "start_at": "2025-11-29T00:00:00Z",
  "end_at": "2025-11-30T23:59:59Z",
  "when": { "country": "US" },
  "target": "https://example.com/black-friday"
}
```

- **Type**: ISO 8601 date-time string
- **Format**: `YYYY-MM-DDTHH:mm:ss.sssZ`
- **Behavior**:
  - Rule is inactive before `start_at`
  - Rule is inactive after `end_at`
  - Omit either field for open-ended activation
- **Use cases**: 
  - Scheduled campaigns
  - Flash sales
  - Geographic timezone campaigns

### 3. Explicit Priority (`priority`)

Fine-tune rule evaluation order when multiple rules could match.

```json
{
  "id": "vip_customers",
  "priority": 10,
  "when": { "utm": { "source": "vip_email" } },
  "target": "https://example.com/vip"
}
```

- **Type**: `integer` (≥0)
- **Default**: Rules without priority are treated as `1000`
- **Behavior**: Lower number = higher priority (evaluated first)
- **Use cases**:
  - Ensure VIP/premium rules take precedence
  - Override geo-based rules with campaign-specific ones

### 4. A/B Testing with Weights (`weight`)

Distribute traffic across multiple matching rules using weighted random selection.

```json
{
  "rules": [
    {
      "id": "variant_a",
      "when": { "country": "US" },
      "target": "https://example.com/landing-a",
      "weight": 3
    },
    {
      "id": "variant_b",
      "when": { "country": "US" },
      "target": "https://example.com/landing-b",
      "weight": 7
    }
  ]
}
```

- **Type**: `number` (≥0)
- **Default**: Rules without weight are treated as `weight: 1`
- **Behavior**:
  - When multiple rules match, distribution follows weight ratios
  - `weight: 0` means rule is excluded from A/B selection
  - Higher weight = higher probability of selection
- **Example**: Weights `[3, 7]` → ~30% variant A, ~70% variant B
- **Use cases**:
  - Landing page testing
  - Gradual rollout (e.g., `[1, 99]` for 1% test traffic)
  - Temporarily pause variant with `weight: 0`

### 5. Request Timestamp (`now` in context)

The Worker now includes `now` timestamp in every request context for accurate time-based rule evaluation.

```typescript
const context: SmartlinkContext = {
  country: 'US',
  device: 'mobile',
  now: '2025-11-27T14:30:00Z'  // Automatically added by Worker
};
```

## Evaluation Logic (v2)

The enhanced evaluation follows this sequence:

```
1. Parse current time from context.now (or use current timestamp)
2. Filter rules:
   - Skip if enabled === false
   - Skip if now < start_at
   - Skip if now > end_at
3. Sort remaining rules by priority (lower first)
4. Evaluate when conditions for all rules
5. Collect all matching rules
6. Select final rule:
   - If 0 matches → use fallback_target
   - If 1 match → use it
   - If multiple matches:
     - Check if any have weight defined
     - If yes → weighted random selection (treat undefined as 1, skip weight=0)
     - If no → use first match (highest priority)
7. Return decision
```

## Examples

### Example 1: Scheduled Campaign with Fallback

```json
{
  "link_id": "holiday_sale",
  "rules": [
    {
      "id": "early_bird",
      "priority": 10,
      "start_at": "2025-12-01T00:00:00Z",
      "end_at": "2025-12-15T23:59:59Z",
      "when": { "utm": { "source": "newsletter" } },
      "target": "https://example.com/early-bird"
    },
    {
      "id": "general_sale",
      "priority": 20,
      "start_at": "2025-12-01T00:00:00Z",
      "end_at": "2025-12-25T23:59:59Z",
      "when": {},
      "target": "https://example.com/holiday-sale"
    }
  ],
  "fallback_target": "https://example.com/shop"
}
```

**Behavior**:
- Before Dec 1: All traffic → fallback
- Dec 1-15: Newsletter → early_bird, others → general_sale
- Dec 16-25: All → general_sale
- After Dec 25: All → fallback

### Example 2: A/B Test with Control Group

```json
{
  "link_id": "landing_page_test",
  "rules": [
    {
      "id": "variant_a_new_design",
      "when": { "country": "US" },
      "target": "https://example.com/landing-new",
      "weight": 5
    },
    {
      "id": "variant_b_control",
      "when": { "country": "US" },
      "target": "https://example.com/landing-current",
      "weight": 5
    }
  ],
  "fallback_target": "https://example.com/home"
}
```

**Behavior**: 50/50 split for US traffic

### Example 3: Gradual Rollout

```json
{
  "link_id": "new_checkout_rollout",
  "rules": [
    {
      "id": "new_checkout_1percent",
      "label": "new_checkout",
      "when": {},
      "target": "https://example.com/checkout-v2",
      "weight": 1
    },
    {
      "id": "old_checkout_99percent",
      "label": "old_checkout",
      "when": {},
      "target": "https://example.com/checkout-v1",
      "weight": 99
    }
  ],
  "fallback_target": "https://example.com/checkout-v1"
}
```

**Behavior**: 1% see new checkout, 99% see old (safely test changes)

### Example 4: Priority Override

```json
{
  "link_id": "campaign_routing",
  "rules": [
    {
      "id": "vip_override",
      "priority": 1,
      "when": { "utm": { "campaign": "vip_2025" } },
      "target": "https://example.com/vip-exclusive"
    },
    {
      "id": "us_general",
      "priority": 100,
      "when": { "country": "US" },
      "target": "https://example.com/us-general"
    },
    {
      "id": "global",
      "priority": 200,
      "when": {},
      "target": "https://example.com/global"
    }
  ],
  "fallback_target": "https://example.com"
}
```

**Behavior**:
- VIP campaign always wins (priority 1)
- US traffic without VIP campaign → us_general
- All others → global

## Migration Guide

### Backward Compatibility

✅ **All existing configurations remain valid**

- v1 configurations without new fields work identically
- New fields are optional
- Default behaviors preserve v1 logic

### Adding v2 Features to Existing Rules

1. **To pause a rule temporarily**:
   ```json
   "enabled": false
   ```

2. **To schedule a rule**:
   ```json
   "start_at": "2025-12-01T00:00:00Z",
   "end_at": "2025-12-31T23:59:59Z"
   ```

3. **To change evaluation order**:
   ```json
   "priority": 50
   ```

4. **To add A/B testing**:
   ```json
   "weight": 7
   ```

### Testing v2 Rules

Use the Worker's debug mode:

```bash
curl "http://localhost:8787/s/test?country=US&debug=1"
```

Response includes context with `now`:

```json
{
  "decision": {
    "target": "https://example.com/variant-b",
    "branch": "us_variant_b"
  },
  "context": {
    "country": "US",
    "now": "2025-11-27T14:30:00.123Z"
  },
  "meta": { ... }
}
```

## Schema Changes

Updated `schemas/ds.smartlink_rules_v1.schema.json`:

```json
{
  "properties": {
    "enabled": {
      "type": "boolean",
      "default": true
    },
    "start_at": {
      "type": "string",
      "format": "date-time"
    },
    "end_at": {
      "type": "string",
      "format": "date-time"
    },
    "priority": {
      "type": "integer",
      "minimum": 0
    },
    "weight": {
      "type": "number",
      "minimum": 0
    }
  }
}
```

## Testing

All v2 features are covered by unit tests:

- ✅ `enabled=false` filtering
- ✅ `start_at` / `end_at` time windows
- ✅ `priority` sorting
- ✅ `weight` A/B distribution
- ✅ Combined scenarios (priority + time + weight)

Run tests:

```bash
npm test --workspace=packages/core-smartlink
```

## Implementation Details

### Core Library

- **File**: `packages/core-smartlink/src/evaluate.ts`
- **Key Functions**:
  - `isRuleActive(rule, now)` - Time-based filtering
  - `selectByWeight(rules)` - Weighted random selection
  - `evaluate(context, core)` - Enhanced evaluation logic

### Worker

- **File**: `packages/worker-smartlink/src/utils/context.ts`
- **Change**: Added `now: new Date().toISOString()` to context normalization

## Performance

- Time-based checks: O(1) per rule
- Weight selection: O(n) where n = number of matching rules
- No significant performance impact vs v1

## Best Practices

1. **Use explicit priority** when rule order matters across different conditions
2. **Set `weight: 0`** instead of `enabled: false` to pause A/B variants temporarily
3. **Always set both `start_at` and `end_at`** for campaigns to avoid stale rules
4. **Test time-based rules** by passing `now` in context during development
5. **Monitor weight distribution** - use analytics to verify traffic split

## Limitations

- Time-based rules use request time, not user's local timezone
- Weight selection uses `Math.random()` - not cryptographically secure
- No automatic rollback if variant performs poorly (manual weight adjustment needed)

## Future Enhancements (Not in v2)

- Timezone-aware scheduling
- Dynamic weight adjustment based on performance metrics
- Multi-armed bandit algorithms for automatic optimization
- Rule-level analytics integration

---

**See also**:
- [SMARTLINK_SPEC.md](./SMARTLINK_SPEC.md) - Original specification
- [Example Configuration](../examples/ecommerce/smartlink_rules.black_friday_2025.json) - v2 features demo


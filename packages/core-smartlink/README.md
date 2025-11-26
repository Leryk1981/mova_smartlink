# @mova/core-smartlink

Pure TypeScript library for Smartlink rules evaluation.

## Overview

This package provides the core logic for evaluating smartlink routing rules. It has:

- **No HTTP dependencies** - pure business logic
- **No Cloudflare APIs** - platform-agnostic
- **Type-safe** - full TypeScript support
- **Tested** - unit tests with real examples

## Installation

```bash
npm install @mova/core-smartlink
```

## Usage

```typescript
import { evaluate, SmartlinkCore, SmartlinkContext } from '@mova/core-smartlink';

// Your smartlink configuration
const core: SmartlinkCore = {
  link_id: 'spring_sale',
  status: 'active',
  rules: [
    {
      when: { country: 'DE', device: 'mobile' },
      target: 'https://example.de/mobile'
    },
    {
      when: { country: 'DE' },
      target: 'https://example.de/desktop'
    }
  ],
  fallback_target: 'https://example.com/global'
};

// Normalized request context
const context: SmartlinkContext = {
  country: 'DE',
  device: 'mobile',
  lang: 'de',
  utm: {
    source: 'tiktok',
    campaign: 'spring_2026'
  }
};

// Evaluate
const decision = evaluate(context, core);
console.log(decision);
// {
//   target: 'https://example.de/mobile',
//   branch: 'rule_0',
//   rule_index: 0
// }
```

## API

### `evaluate(context, core): SmartlinkDecision`

Evaluates smartlink rules and returns routing decision.

**Parameters:**
- `context: SmartlinkContext` - Normalized request context
- `core: SmartlinkCore` - Smartlink configuration with rules

**Returns:** `SmartlinkDecision` with:
- `target: string` - Target URL or logical ID
- `branch: string` - Matched rule label or 'fallback'
- `rule_index: number` - Index of matched rule (-1 for fallback)

**Rules evaluation order:**
1. Rules with explicit `priority` field (lower number = higher priority)
2. Rules without priority in array order
3. First matching rule wins
4. If no match → `fallback_target`

## Types

See [types.ts](./src/types.ts) for full type definitions.

Key types:
- `SmartlinkCore` - Complete configuration (matches `ds:smartlink_rules_v1`)
- `SmartlinkContext` - Normalized context (country, lang, device, utm)
- `SmartlinkDecision` - Evaluation result
- `SmartlinkRule` - Single routing rule

## License

MIT


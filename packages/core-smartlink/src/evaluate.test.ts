import { test } from 'node:test';
import assert from 'node:assert';
import { evaluate } from './evaluate.js';
import type { SmartlinkCore, SmartlinkContext } from './types.js';

// Example SmartlinkCore based on examples/ecommerce/smartlink_rules.spring_sale_2026.json
const exampleCore: SmartlinkCore = {
  link_id: 'spring_sale_2026',
  purpose: 'Spring sale 2026: one smartlink for all channels (TikTok, email, ads)',
  status: 'active',
  context_shape: ['country', 'device', 'utm.source', 'utm.campaign'],
  rules: [
    {
      id: 'rule_1',
      label: 'de_tiktok_mobile',
      when: {
        country: 'DE',
        device: 'mobile',
        utm: {
          source: 'tiktok',
        },
      },
      target: 'https://example.de/spring/mobile-funnel',
    },
    {
      id: 'rule_2',
      label: 'email_spring_main',
      when: {
        utm: {
          source: 'email',
          campaign: 'spring_2026',
        },
      },
      target: 'https://example.com/spring/email-landing',
    },
    {
      id: 'rule_3',
      label: 'de_default',
      when: {
        country: 'DE',
      },
      target: 'https://example.de/spring/main',
    },
  ],
  fallback_target: 'https://example.com/spring/global-en',
};

test('evaluate: DE + mobile + TikTok matches rule_1', () => {
  const context: SmartlinkContext = {
    country: 'DE',
    device: 'mobile',
    utm: {
      source: 'tiktok',
    },
  };

  const decision = evaluate(context, exampleCore);

  assert.strictEqual(decision.target, 'https://example.de/spring/mobile-funnel');
  assert.strictEqual(decision.branch, 'de_tiktok_mobile');
  assert.strictEqual(decision.rule_index, 0);
});

test('evaluate: email + spring_2026 campaign matches rule_2', () => {
  const context: SmartlinkContext = {
    country: 'US',
    device: 'desktop',
    utm: {
      source: 'email',
      campaign: 'spring_2026',
    },
  };

  const decision = evaluate(context, exampleCore);

  assert.strictEqual(decision.target, 'https://example.com/spring/email-landing');
  assert.strictEqual(decision.branch, 'email_spring_main');
  assert.strictEqual(decision.rule_index, 1);
});

test('evaluate: DE + desktop matches rule_3 (more specific rule already checked)', () => {
  const context: SmartlinkContext = {
    country: 'DE',
    device: 'desktop',
  };

  const decision = evaluate(context, exampleCore);

  assert.strictEqual(decision.target, 'https://example.de/spring/main');
  assert.strictEqual(decision.branch, 'de_default');
  assert.strictEqual(decision.rule_index, 2);
});

test('evaluate: no match falls back to fallback_target', () => {
  const context: SmartlinkContext = {
    country: 'FR',
    device: 'desktop',
    utm: {
      source: 'google',
    },
  };

  const decision = evaluate(context, exampleCore);

  assert.strictEqual(decision.target, 'https://example.com/spring/global-en');
  assert.strictEqual(decision.branch, 'fallback');
  assert.strictEqual(decision.rule_index, -1);
});

test('evaluate: case-insensitive matching', () => {
  const context: SmartlinkContext = {
    country: 'de', // lowercase
    device: 'MOBILE', // uppercase
    utm: {
      source: 'TikTok', // mixed case
    },
  };

  const decision = evaluate(context, exampleCore);

  assert.strictEqual(decision.target, 'https://example.de/spring/mobile-funnel');
  assert.strictEqual(decision.branch, 'de_tiktok_mobile');
});

test('evaluate: array conditions - country matches', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        when: {
          country: ['DE', 'AT', 'CH'], // DACH region
        },
        target: 'https://example.de/dach',
      },
    ],
    fallback_target: 'https://example.com/global',
  };

  const contextDE: SmartlinkContext = { country: 'DE' };
  const contextAT: SmartlinkContext = { country: 'AT' };
  const contextFR: SmartlinkContext = { country: 'FR' };

  assert.strictEqual(evaluate(contextDE, core).target, 'https://example.de/dach');
  assert.strictEqual(evaluate(contextAT, core).target, 'https://example.de/dach');
  assert.strictEqual(evaluate(contextFR, core).target, 'https://example.com/global');
});

test('evaluate: priority-based sorting', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        id: 'low_priority',
        priority: 100,
        when: { country: 'DE' },
        target: 'https://example.de/low',
      },
      {
        id: 'high_priority',
        priority: 10,
        when: { country: 'DE' },
        target: 'https://example.de/high',
      },
      {
        id: 'no_priority',
        when: { country: 'DE' },
        target: 'https://example.de/default',
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  const context: SmartlinkContext = { country: 'DE' };
  const decision = evaluate(context, core);

  // high_priority (10) should win over low_priority (100)
  assert.strictEqual(decision.target, 'https://example.de/high');
  assert.strictEqual(decision.branch, 'high_priority');
});

test('evaluate: empty UTM in context does not break UTM rules', () => {
  const context: SmartlinkContext = {
    country: 'US',
    // no utm field at all
  };

  const decision = evaluate(context, exampleCore);

  // Should fall back since no rules match
  assert.strictEqual(decision.branch, 'fallback');
});

test('evaluate: partial UTM match fails', () => {
  const context: SmartlinkContext = {
    utm: {
      source: 'email',
      // missing campaign: 'spring_2026'
    },
  };

  const decision = evaluate(context, exampleCore);

  // rule_2 requires BOTH source=email AND campaign=spring_2026
  assert.strictEqual(decision.branch, 'fallback');
});

test('evaluate: all conditions must match (AND logic)', () => {
  const context: SmartlinkContext = {
    country: 'DE',
    device: 'mobile',
    // missing utm.source: 'tiktok'
  };

  const decision = evaluate(context, exampleCore);

  // rule_1 requires DE + mobile + tiktok, so should NOT match
  // rule_3 (DE only) should match instead
  assert.strictEqual(decision.target, 'https://example.de/spring/main');
  assert.strictEqual(decision.branch, 'de_default');
});

// ========== v2 Tests ==========

test('v2: enabled=false rule is skipped', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        enabled: false,  // This rule is disabled
        when: { country: 'DE' },
        target: 'https://example.de/disabled',
      },
      {
        when: { country: 'DE' },
        target: 'https://example.de/active',
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  const context: SmartlinkContext = { country: 'DE' };
  const decision = evaluate(context, core);

  // Should skip disabled rule and use second rule
  assert.strictEqual(decision.target, 'https://example.de/active');
});

test('v2: start_at - rule not active before start time', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        when: { country: 'US' },
        target: 'https://example.com/campaign',
        start_at: '2026-01-01T00:00:00Z',  // Future date
      },
      {
        when: { country: 'US' },
        target: 'https://example.com/default',
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  // Test before start time
  const contextBefore: SmartlinkContext = {
    country: 'US',
    now: '2025-12-31T23:59:59Z',
  };
  const decisionBefore = evaluate(contextBefore, core);
  assert.strictEqual(decisionBefore.target, 'https://example.com/default');

  // Test after start time
  const contextAfter: SmartlinkContext = {
    country: 'US',
    now: '2026-01-01T00:00:01Z',
  };
  const decisionAfter = evaluate(contextAfter, core);
  assert.strictEqual(decisionAfter.target, 'https://example.com/campaign');
});

test('v2: end_at - rule not active after end time', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        when: { country: 'UK' },
        target: 'https://example.uk/black-friday',
        end_at: '2025-11-30T23:59:59Z',  // Already ended
      },
      {
        when: { country: 'UK' },
        target: 'https://example.uk/regular',
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  // Test after end time
  const contextAfter: SmartlinkContext = {
    country: 'UK',
    now: '2025-12-01T00:00:00Z',
  };
  const decisionAfter = evaluate(contextAfter, core);
  assert.strictEqual(decisionAfter.target, 'https://example.uk/regular');

  // Test before end time
  const contextBefore: SmartlinkContext = {
    country: 'UK',
    now: '2025-11-30T12:00:00Z',
  };
  const decisionBefore = evaluate(contextBefore, core);
  assert.strictEqual(decisionBefore.target, 'https://example.uk/black-friday');
});

test('v2: priority sorting with v2 rules', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        priority: 100,
        when: { country: 'FR' },
        target: 'https://example.fr/low-priority',
      },
      {
        priority: 10,
        when: { country: 'FR' },
        target: 'https://example.fr/high-priority',
      },
      {
        // No priority - should be treated as 1000 (lowest)
        when: { country: 'FR' },
        target: 'https://example.fr/no-priority',
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  const context: SmartlinkContext = { country: 'FR' };
  const decision = evaluate(context, core);

  // Should pick priority=10 (highest priority)
  assert.strictEqual(decision.target, 'https://example.fr/high-priority');
});

test('v2: weight-based A/B testing - all rules get selected eventually', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        label: 'variant_a',
        when: { country: 'US' },
        target: 'https://example.com/a',
        weight: 1,
      },
      {
        label: 'variant_b',
        when: { country: 'US' },
        target: 'https://example.com/b',
        weight: 3,
      },
      {
        label: 'variant_c',
        when: { country: 'US' },
        target: 'https://example.com/c',
        weight: 6,
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  const context: SmartlinkContext = { country: 'US' };
  
  // Run 100 times to test distribution
  const results = new Map<string, number>();
  
  for (let i = 0; i < 100; i++) {
    const decision = evaluate(context, core);
    const count = results.get(decision.branch) || 0;
    results.set(decision.branch, count + 1);
  }

  // All variants should be selected at least once
  assert.ok(results.has('variant_a'), 'variant_a should be selected');
  assert.ok(results.has('variant_b'), 'variant_b should be selected');
  assert.ok(results.has('variant_c'), 'variant_c should be selected');
  
  // variant_c (weight=6) should be selected most often
  const countC = results.get('variant_c') || 0;
  assert.ok(countC > 30, `variant_c should be selected > 30 times, got ${countC}`);
});

test('v2: weight=0 rules are never selected in A/B', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        label: 'disabled_variant',
        when: { country: 'CA' },
        target: 'https://example.ca/disabled',
        weight: 0,  // Should never be selected
      },
      {
        label: 'active_variant',
        when: { country: 'CA' },
        target: 'https://example.ca/active',
        weight: 1,
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  const context: SmartlinkContext = { country: 'CA' };
  
  // Run multiple times - should NEVER select disabled_variant
  for (let i = 0; i < 50; i++) {
    const decision = evaluate(context, core);
    assert.strictEqual(decision.branch, 'active_variant');
    assert.strictEqual(decision.target, 'https://example.ca/active');
  }
});

test('v2: rules without weight default to weight=1', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        label: 'with_weight',
        when: { country: 'AU' },
        target: 'https://example.au/weighted',
        weight: 5,
      },
      {
        label: 'without_weight',
        when: { country: 'AU' },
        target: 'https://example.au/default',
        // No weight - should be treated as weight=1
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  const context: SmartlinkContext = { country: 'AU' };
  
  const results = new Map<string, number>();
  for (let i = 0; i < 60; i++) {
    const decision = evaluate(context, core);
    results.set(decision.branch, (results.get(decision.branch) || 0) + 1);
  }

  // Both should be selected
  assert.ok(results.has('with_weight'));
  assert.ok(results.has('without_weight'));
  
  // with_weight (5) should be selected more often than without_weight (1)
  const withWeight = results.get('with_weight') || 0;
  const withoutWeight = results.get('without_weight') || 0;
  assert.ok(withWeight > withoutWeight, `Expected ${withWeight} > ${withoutWeight}`);
});

test('v2: combined - priority + time + weight', () => {
  const core: SmartlinkCore = {
    link_id: 'test',
    status: 'active',
    rules: [
      {
        label: 'high_priority_future',
        priority: 10,
        when: { country: 'JP' },
        target: 'https://example.jp/future',
        start_at: '2026-01-01T00:00:00Z',
      },
      {
        label: 'low_priority_active',
        priority: 100,
        when: { country: 'JP' },
        target: 'https://example.jp/active',
        weight: 7,
      },
      {
        label: 'low_priority_active_2',
        priority: 100,
        when: { country: 'JP' },
        target: 'https://example.jp/active-2',
        weight: 3,
      },
    ],
    fallback_target: 'https://example.com/fallback',
  };

  const context: SmartlinkContext = {
    country: 'JP',
    now: '2025-11-26T12:00:00Z',
  };

  // High priority rule is not active yet (start_at in future)
  // So only priority=100 rules should match
  // Should distribute between them by weight (7:3 ratio)
  
  const results = new Map<string, number>();
  for (let i = 0; i < 100; i++) {
    const decision = evaluate(context, core);
    results.set(decision.branch, (results.get(decision.branch) || 0) + 1);
  }

  // Should NEVER select future rule
  assert.ok(!results.has('high_priority_future'));
  
  // Should select both active rules
  assert.ok(results.has('low_priority_active'));
  assert.ok(results.has('low_priority_active_2'));
  
  // low_priority_active (weight=7) should be selected more often
  const active1 = results.get('low_priority_active') || 0;
  const active2 = results.get('low_priority_active_2') || 0;
  assert.ok(active1 > active2);
});


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


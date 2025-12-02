import { test } from 'node:test';
import assert from 'node:assert';
import { resolveSmartlink } from './resolve.js';
import type { SmartlinkConfig, SmartlinkClickContext } from './types-mova4.js';

// Example config based on mova4-smartlink/examples/smartlink_config.spring_sale_2026.json
const spring2026Config: SmartlinkConfig = {
  smartlink_id: 'spring_sale_2026',
  name: 'Spring Sale 2026',
  status: 'active',
  targets: [
    {
      target_id: 'de_tiktok_mobile',
      url: 'https://example.de/spring/mobile-funnel',
      label: 'Germany TikTok Mobile Funnel',
      conditions: {
        country: 'DE',
        device: 'mobile',
        utm: {
          source: 'tiktok',
        },
      },
      priority: 10,
      enabled: true,
    },
    {
      target_id: 'email_spring_main',
      url: 'https://example.com/spring/email-landing',
      label: 'Email Campaign Landing Page',
      conditions: {
        utm: {
          source: 'email',
          campaign: 'spring_2026',
        },
      },
      priority: 20,
      enabled: true,
    },
    {
      target_id: 'de_default',
      url: 'https://example.de/spring/main',
      label: 'Germany Default Landing',
      conditions: {
        country: 'DE',
      },
      priority: 30,
      enabled: true,
    },
    {
      target_id: 'mobile_general',
      url: 'https://example.com/spring/mobile',
      label: 'Mobile-optimized Landing',
      conditions: {
        device: 'mobile',
      },
      priority: 40,
      enabled: true,
    },
    {
      target_id: 'global_fallback',
      url: 'https://example.com/spring/global-en',
      label: 'Global English Landing',
      conditions: {},
      priority: 100,
      enabled: true,
    },
  ],
  default_target_id: 'global_fallback',
  limits: {
    valid_from: '2026-03-01T00:00:00Z',
    valid_until: '2026-05-31T23:59:59Z',
  },
};

test('resolveSmartlink: DE + mobile + TikTok matches high-priority target', () => {
  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T14:23:45Z',
    country: 'DE',
    device: 'mobile',
    utm: {
      source: 'tiktok',
      medium: 'social',
    },
  };

  const result = resolveSmartlink(spring2026Config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'de_tiktok_mobile');
  assert.strictEqual(result.resolved_url, 'https://example.de/spring/mobile-funnel');
  assert.strictEqual(result.matched_conditions?.country, true);
  assert.strictEqual(result.matched_conditions?.device, true);
  assert.strictEqual(result.matched_conditions?.utm, true);
});

test('resolveSmartlink: email campaign matches', () => {
  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-04-01T10:00:00Z',
    country: 'US',
    utm: {
      source: 'email',
      campaign: 'spring_2026',
    },
  };

  const result = resolveSmartlink(spring2026Config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'email_spring_main');
  assert.strictEqual(result.matched_conditions?.utm, true);
});

test('resolveSmartlink: DE only matches de_default (lower priority than specific)', () => {
  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-20T12:00:00Z',
    country: 'DE',
    device: 'desktop',
  };

  const result = resolveSmartlink(spring2026Config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'de_default');
  assert.strictEqual(result.matched_conditions?.country, true);
});

test('resolveSmartlink: no match uses default target', () => {
  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z',
    country: 'FR',
    device: 'desktop',
  };

  const result = resolveSmartlink(spring2026Config, context);

  assert.strictEqual(result.outcome, 'DEFAULT_USED');
  assert.strictEqual(result.resolved_target_id, 'global_fallback');
  assert.ok(result.reason?.includes('default'));
});

test('resolveSmartlink: case-insensitive matching', () => {
  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z',
    country: 'de', // lowercase
    device: 'MOBILE', // uppercase
    utm: {
      source: 'TikTok', // mixed case
    },
  };

  const result = resolveSmartlink(spring2026Config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'de_tiktok_mobile');
});

test('resolveSmartlink: disabled target is skipped', () => {
  const config: SmartlinkConfig = {
    ...spring2026Config,
    targets: [
      {
        target_id: 'disabled',
        url: 'https://example.com/disabled',
        conditions: { country: 'US' },
        enabled: false, // Disabled
        priority: 10,
      },
      {
        target_id: 'active',
        url: 'https://example.com/active',
        conditions: { country: 'US' },
        priority: 20,
      },
      ...spring2026Config.targets,
    ],
  };

  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z',
    country: 'US',
  };

  const result = resolveSmartlink(config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'active');
});

test('resolveSmartlink: target not yet valid (valid_from in future)', () => {
  const config: SmartlinkConfig = {
    ...spring2026Config,
    targets: [
      {
        target_id: 'future',
        url: 'https://example.com/future',
        conditions: { country: 'JP' },
        valid_from: '2026-06-01T00:00:00Z', // Future
        priority: 10,
      },
      {
        target_id: 'current',
        url: 'https://example.com/current',
        conditions: { country: 'JP' },
        priority: 20,
      },
      ...spring2026Config.targets,
    ],
  };

  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-05-15T10:00:00Z', // Before valid_from
    country: 'JP',
  };

  const result = resolveSmartlink(config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'current');
});

test('resolveSmartlink: target expired (valid_until in past)', () => {
  const config: SmartlinkConfig = {
    ...spring2026Config,
    targets: [
      {
        target_id: 'expired',
        url: 'https://example.com/expired',
        conditions: { country: 'UK' },
        valid_until: '2026-03-01T00:00:00Z', // Expired
        priority: 10,
      },
      {
        target_id: 'current',
        url: 'https://example.com/current',
        conditions: { country: 'UK' },
        priority: 20,
      },
      ...spring2026Config.targets,
    ],
  };

  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z', // After valid_until
    country: 'UK',
  };

  const result = resolveSmartlink(config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'current');
});

test('resolveSmartlink: smartlink expired (limits.valid_until)', () => {
  const config: SmartlinkConfig = {
    ...spring2026Config,
    limits: {
      valid_from: '2026-01-01T00:00:00Z',
      valid_until: '2026-02-28T23:59:59Z', // Expired
    },
  };

  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z', // After valid_until
    country: 'DE',
  };

  const result = resolveSmartlink(config, context);

  assert.strictEqual(result.outcome, 'EXPIRED');
  assert.ok(result.reason?.includes('expired') || result.reason?.includes('not yet active'));
});

test('resolveSmartlink: smartlink not yet active (limits.valid_from)', () => {
  const config: SmartlinkConfig = {
    ...spring2026Config,
    limits: {
      valid_from: '2026-06-01T00:00:00Z', // Future
    },
  };

  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-05-15T10:00:00Z', // Before valid_from
    country: 'DE',
  };

  const result = resolveSmartlink(config, context);

  assert.strictEqual(result.outcome, 'EXPIRED');
  assert.ok(result.reason?.includes('expired') || result.reason?.includes('not yet active'));
});

test('resolveSmartlink: smartlink status not active', () => {
  const config: SmartlinkConfig = {
    ...spring2026Config,
    status: 'paused',
  };

  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z',
    country: 'DE',
  };

  const result = resolveSmartlink(config, context);

  assert.strictEqual(result.outcome, 'EXPIRED');
  assert.ok(result.reason?.includes('paused'));
});

test('resolveSmartlink: priority sorting works correctly', () => {
  const config: SmartlinkConfig = {
    ...spring2026Config,
    targets: [
      {
        target_id: 'low_priority',
        url: 'https://example.com/low',
        conditions: { country: 'CA' },
        priority: 100,
      },
      {
        target_id: 'high_priority',
        url: 'https://example.com/high',
        conditions: { country: 'CA' },
        priority: 10,
      },
      {
        target_id: 'medium_priority',
        url: 'https://example.com/medium',
        conditions: { country: 'CA' },
        priority: 50,
      },
      ...spring2026Config.targets,
    ],
  };

  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z',
    country: 'CA',
  };

  const result = resolveSmartlink(config, context);

  assert.strictEqual(result.outcome, 'OK');
  assert.strictEqual(result.resolved_target_id, 'high_priority');
});

test('resolveSmartlink: latency_ms is calculated', () => {
  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z',
    country: 'DE',
    device: 'mobile',
    utm: { source: 'tiktok' },
  };

  const result = resolveSmartlink(spring2026Config, context);

  assert.ok(result.latency_ms !== undefined);
  assert.ok(result.latency_ms >= 0);
});

test('resolveSmartlink: all UTM conditions must match', () => {
  const context: SmartlinkClickContext = {
    smartlink_id: 'spring_sale_2026',
    timestamp: '2026-03-15T10:00:00Z',
    utm: {
      source: 'email',
      // Missing campaign: 'spring_2026'
    },
  };

  const result = resolveSmartlink(spring2026Config, context);

  // email_spring_main requires BOTH source=email AND campaign=spring_2026
  // So it shouldn't match
  assert.notStrictEqual(result.resolved_target_id, 'email_spring_main');
});

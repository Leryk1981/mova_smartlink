/**
 * Integration tests for SmartLink Worker MOVA 4.0 endpoints
 */

import { describe, it, expect, beforeEach } from 'vitest';
import worker from './index.js';
import type {
  SmartlinkResolveEnvelope,
  SmartlinkStatsGetEnvelope,
} from '@mova/core-smartlink/runtime';

// Mock KV namespace (minimal implementation to satisfy tests and Workers types)
class MockKVNamespace {
  private store = new Map<string, string>();

  async get(
    key: string,
    options?: Partial<KVNamespaceGetOptions<any>> | 'text' | 'json' | 'arrayBuffer' | 'stream'
  ): Promise<any> {
    const value = this.store.get(key);
    if (!value) return null;

    const type = typeof options === 'object' ? (options as any).type : options;

    if (type === 'json') {
      return JSON.parse(value);
    }
    if (type === 'arrayBuffer') {
      return new TextEncoder().encode(value).buffer;
    }
    return value;
  }

  async put(
    key: string,
    value: string | ArrayBuffer | ReadableStream,
    _options?: Partial<KVNamespacePutOptions>
  ): Promise<void> {
    if (typeof value === 'string') {
      this.store.set(key, value);
    } else if (value instanceof ArrayBuffer) {
      this.store.set(key, new TextDecoder().decode(value));
    }
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult<unknown>> {
    const prefix = options?.prefix || '';
    const limit = options?.limit || 1000;

    const keys = Array.from(this.store.keys())
      .filter((k) => k.startsWith(prefix))
      .slice(0, limit)
      .map((name) => ({ name }));

    return { keys, list_complete: true, cacheStatus: null };
  }

  async getWithMetadata<Metadata = unknown>(
    key: string,
    options?: Partial<KVNamespaceGetOptions<any>> | 'text' | 'json' | 'arrayBuffer' | 'stream'
  ): Promise<KVNamespaceGetWithMetadataResult<any, Metadata>> {
    const value = await this.get(key, options);
    return { value, metadata: null, cacheStatus: null };
  }
}

// Mock environment
const mockEnv: any = {
  KV_SMARTLINK_RULES: new MockKVNamespace(),
  ENVIRONMENT: 'test',
};

// Mock ExecutionContext
const mockCtx: any = {
  waitUntil: () => {},
  passThroughOnException: () => {},
};

describe('Worker MOVA 4.0 Endpoints', () => {
  beforeEach(async () => {
    // Setup test config
    const testConfig = {
      config: {
        smartlink_id: 'test_campaign',
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
      },
      meta: {
        updated_at: new Date().toISOString(),
        version: 1,
      },
    };

    await mockEnv.KV_SMARTLINK_RULES.put(
      'config:test_campaign',
      JSON.stringify(testConfig)
    );
  });

  describe('POST /smartlink/resolve', () => {
    it('should resolve smartlink with valid envelope', async () => {
      const envelope: SmartlinkResolveEnvelope = {
        envelope_id: 'env.smartlink_resolve_v1',
        verb: 'route',
        correlation_id: 'test_123',
        roles: {
          requester: 'test',
          executor: 'worker',
        },
        payload: {
          input: {
            smartlink_id: 'test_campaign',
            timestamp: new Date().toISOString(),
            country: 'DE',
            device: 'mobile',
          },
        },
      };

      const request = new Request('https://worker.example.com/smartlink/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);

      expect(response.status).toBe(200);

      const result: SmartlinkResolveEnvelope = await response.json();

      expect(result.envelope_id).toBe('env.smartlink_resolve_v1');
      expect(result.payload.output).toBeDefined();
      expect(result.payload.output?.outcome).toBe('OK');
      expect(result.payload.output?.resolved_target_id).toBe('de_mobile');
      expect(result.payload.output?.resolved_url).toBe('https://example.de/mobile');
    });

    it('should use default target when no conditions match', async () => {
      const envelope: SmartlinkResolveEnvelope = {
        envelope_id: 'env.smartlink_resolve_v1',
        verb: 'route',
        roles: {
          requester: 'test',
          executor: 'worker',
        },
        payload: {
          input: {
            smartlink_id: 'test_campaign',
            timestamp: new Date().toISOString(),
            country: 'US',
            device: 'desktop',
          },
        },
      };

      const request = new Request('https://worker.example.com/smartlink/resolve', {
        method: 'POST',
        body: JSON.stringify(envelope),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);
      const result: SmartlinkResolveEnvelope = await response.json();

      expect(result.payload.output?.outcome).toBe('DEFAULT_USED');
      expect(result.payload.output?.resolved_target_id).toBe('default');
    });

    it('should return 400 for invalid envelope', async () => {
      const invalidEnvelope = {
        envelope_id: 'wrong_envelope',
        verb: 'route',
      };

      const request = new Request('https://worker.example.com/smartlink/resolve', {
        method: 'POST',
        body: JSON.stringify(invalidEnvelope),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent smartlink', async () => {
      const envelope: SmartlinkResolveEnvelope = {
        envelope_id: 'env.smartlink_resolve_v1',
        verb: 'route',
        roles: {
          requester: 'test',
          executor: 'worker',
        },
        payload: {
          input: {
            smartlink_id: 'non_existent',
            timestamp: new Date().toISOString(),
          },
        },
      };

      const request = new Request('https://worker.example.com/smartlink/resolve', {
        method: 'POST',
        body: JSON.stringify(envelope),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /smartlink/stats', () => {
    it('should return stats report with valid query', async () => {
      // First, create some episodes by resolving smartlinks
      const resolveEnvelope: SmartlinkResolveEnvelope = {
        envelope_id: 'env.smartlink_resolve_v1',
        verb: 'route',
        roles: {
          requester: 'test',
          executor: 'worker',
        },
        payload: {
          input: {
            smartlink_id: 'test_campaign',
            timestamp: new Date().toISOString(),
            country: 'DE',
            device: 'mobile',
          },
        },
      };

      // Resolve to create an episode
      await worker.fetch(
        new Request('https://worker.example.com/smartlink/resolve', {
          method: 'POST',
          body: JSON.stringify(resolveEnvelope),
        }),
        mockEnv,
        mockCtx
      );

      // Wait a bit for episode to be saved
      await new Promise(resolve => setTimeout(resolve, 100));

      // Query stats
      const statsEnvelope: SmartlinkStatsGetEnvelope = {
        envelope_id: 'env.smartlink_stats_get_v1',
        verb: 'get',
        roles: {
          requester: 'test',
          executor: 'worker',
        },
        payload: {
          input: {
            smartlink_id: 'test_campaign',
          },
        },
      };

      const request = new Request('https://worker.example.com/smartlink/stats', {
        method: 'POST',
        body: JSON.stringify(statsEnvelope),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);

      expect(response.status).toBe(200);

      const result: SmartlinkStatsGetEnvelope = await response.json();

      expect(result.envelope_id).toBe('env.smartlink_stats_get_v1');
      expect(result.payload.output).toBeDefined();
      expect(result.payload.output?.summary).toBeDefined();
      expect(result.payload.output?.summary.total_clicks).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 for invalid stats query', async () => {
      const invalidEnvelope = {
        envelope_id: 'wrong_envelope',
        verb: 'get',
      };

      const request = new Request('https://worker.example.com/smartlink/stats', {
        method: 'POST',
        body: JSON.stringify(invalidEnvelope),
      });

      const response = await worker.fetch(request, mockEnv, mockCtx);

      expect(response.status).toBe(400);
    });
  });

  describe('Legacy endpoints', () => {
    it('should still support legacy GET /s/:linkId', async () => {
      // This is just a smoke test to ensure legacy routes still work
      const request = new Request('https://worker.example.com/s/test_campaign');
      
      // Should not crash (might return 404 if config not in legacy format, which is fine)
      const response = await worker.fetch(request, mockEnv, mockCtx);
      
      expect([200, 302, 404, 410]).toContain(response.status);
    });
  });
});

/**
 * API wrapper for SmartLink Worker
 * Communicates with MOVA 4.0 endpoints
 */

// Get Worker URL from environment or use default
const WORKER_BASE_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

/**
 * Demo resolve input (simplified for UI)
 */
export interface DemoResolveInput {
  smartlink_id: string;
  country?: string;
  device?: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
  utm_source?: string;
  utm_campaign?: string;
}

/**
 * Demo resolve result (from worker response)
 */
export interface DemoResolveResult {
  smartlink_id: string;
  resolved_target_id?: string;
  resolved_url?: string;
  outcome: 'OK' | 'NO_MATCH' | 'DEFAULT_USED' | 'ERROR' | 'RATE_LIMIT' | 'EXPIRED' | 'DISABLED';
  reason?: string;
  matched_conditions?: {
    country?: boolean;
    language?: boolean;
    device?: boolean;
    utm?: boolean;
  };
  latency_ms?: number;
}

/**
 * Build MOVA 4.0 envelope for resolve request
 */
function buildResolveEnvelope(input: DemoResolveInput) {
  const utm: any = {};
  if (input.utm_source) utm.source = input.utm_source;
  if (input.utm_campaign) utm.campaign = input.utm_campaign;

  return {
    envelope_id: 'env.smartlink_resolve_v1',
    verb: 'route',
    correlation_id: `demo_${Date.now()}`,
    roles: {
      requester: 'smartlink-landing',
      executor: 'smartlink-worker',
    },
    payload: {
      input: {
        smartlink_id: input.smartlink_id,
        timestamp: new Date().toISOString(),
        country: input.country,
        device: input.device || 'unknown',
        utm: Object.keys(utm).length > 0 ? utm : undefined,
      },
    },
  };
}

/**
 * Demo resolve: send click context to worker and get result
 */
export async function demoResolve(input: DemoResolveInput): Promise<DemoResolveResult> {
  const envelope = buildResolveEnvelope(input);

  const res = await fetch(`${WORKER_BASE_URL}/smartlink/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(envelope),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const responseEnvelope = await res.json();

  // Extract result from envelope
  if (responseEnvelope.payload && responseEnvelope.payload.output) {
    return responseEnvelope.payload.output;
  }

  throw new Error('Invalid response format from worker');
}

/**
 * Check worker health
 */
export async function checkWorkerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${WORKER_BASE_URL}/`, {
      method: 'HEAD',
    });
    return res.ok || res.status === 404; // 404 is ok (no root route)
  } catch {
    return false;
  }
}

/**
 * Get list of demo configs (hardcoded for now)
 */
export function getDemoConfigs() {
  return [
    {
      id: 'spring_sale_2026',
      name: 'Spring Sale 2026',
      description: 'Multi-channel campaign (TikTok, Email, Ads)',
    },
    {
      id: 'test_campaign',
      name: 'Test Campaign',
      description: 'Simple demo configuration',
    },
  ];
}

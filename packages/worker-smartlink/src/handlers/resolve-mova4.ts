/**
 * MOVA 4.0 resolve handler
 * Implements env.smartlink_resolve_v1 envelope
 */

import {
  resolveSmartlink,
  validateConfig,
  validateClickContext,
  validateResolutionResult,
  type SmartlinkConfig,
  type SmartlinkClickContext,
  type SmartlinkResolutionResult,
  type SmartlinkResolveEnvelope,
  type SmartlinkResolutionEpisode,
} from '@mova/core-smartlink';
import type { Env } from '../types.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { getSmartlinkConfig, saveEpisode } from '../utils/kv-mova4.js';

/**
 * Handle MOVA 4.0 smartlink resolution
 * POST /smartlink/resolve
 * 
 * Accepts: env.smartlink_resolve_v1
 * Returns: env.smartlink_resolve_v1 (with output filled)
 */
export async function handleResolve(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();
  const executorId = `worker-${env.ENVIRONMENT || 'dev'}`;
  const executorVersion = '2.0.0-mova4';

  try {
    // Parse envelope
    let envelope: SmartlinkResolveEnvelope;
    try {
      envelope = (await request.json()) as SmartlinkResolveEnvelope;
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    // Validate envelope structure
    if (envelope.envelope_id !== 'env.smartlink_resolve_v1') {
      return errorResponse('Invalid envelope_id, expected env.smartlink_resolve_v1', 400);
    }

    if (envelope.verb !== 'route') {
      return errorResponse('Invalid verb, expected "route"', 400);
    }

    // Validate input (click context)
    const contextValidation = validateClickContext(envelope.payload.input);
    if (!contextValidation.ok) {
      return errorResponse(
        `Invalid click context: ${JSON.stringify(contextValidation.error)}`,
        400
      );
    }

    const context = contextValidation.value;

    // Get config (inline or by reference)
    let config: SmartlinkConfig;

    if (envelope.payload.config) {
      if ('config_ref' in envelope.payload.config) {
        // Load from reference
        const ref = envelope.payload.config.config_ref;
        const loadedConfig = await getSmartlinkConfig(env.KV_SMARTLINK_RULES, ref);

        if (!loadedConfig) {
          return errorResponse(`Config not found: ${ref}`, 404);
        }

        config = loadedConfig;
      } else {
        // Inline config
        const configValidation = validateConfig(envelope.payload.config);
        if (!configValidation.ok) {
          return errorResponse(
            `Invalid config: ${JSON.stringify(configValidation.error)}`,
            400
          );
        }
        config = configValidation.value;
      }
    } else {
      // Try to load config by smartlink_id from context
      const loadedConfig = await getSmartlinkConfig(
        env.KV_SMARTLINK_RULES,
        context.smartlink_id
      );

      if (!loadedConfig) {
        return errorResponse(`Config not found for: ${context.smartlink_id}`, 404);
      }

      config = loadedConfig;
    }

    // Resolve
    const result = resolveSmartlink(config, context);

    // Add executor info to result
    result.executor_id = executorId;
    result.executor_version = executorVersion;
    result.latency_ms = Date.now() - startTime;

    // Validate result
    const resultValidation = validateResolutionResult(result);
    if (!resultValidation.ok) {
      console.error('Invalid resolution result:', resultValidation.error);
      // Continue anyway - internal validation issue
    }

    // Create episode
    const episode = createEpisode(context, config, result, envelope, {
      executorId,
      executorVersion,
      startTime,
      endTime: Date.now(),
    });

    // Save episode (async, don't wait)
    saveEpisode(env.KV_SMARTLINK_RULES, episode).catch((err) => {
      console.error('Failed to save episode:', err);
    });

    // Build response envelope
    const responseEnvelope: SmartlinkResolveEnvelope = {
      ...envelope,
      payload: {
        ...envelope.payload,
        output: result,
      },
      meta: {
        ...envelope.meta,
        timestamp: new Date().toISOString(),
      },
    };

    return jsonResponse(responseEnvelope);
  } catch (error) {
    console.error('Error in handleResolve:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * Create episode from resolution
 */
function createEpisode(
  context: SmartlinkClickContext,
  config: SmartlinkConfig,
  result: SmartlinkResolutionResult,
  envelope: SmartlinkResolveEnvelope,
  metadata: {
    executorId: string;
    executorVersion: string;
    startTime: number;
    endTime: number;
  }
): SmartlinkResolutionEpisode {
  const latencyMs = metadata.endTime - metadata.startTime;

  // Determine episode outcome
  let outcome: 'success' | 'partial_success' | 'failure' | 'error';
  if (result.outcome === 'OK' || result.outcome === 'DEFAULT_USED') {
    outcome = 'success';
  } else if (result.outcome === 'NO_MATCH' || result.outcome === 'EXPIRED') {
    outcome = 'partial_success';
  } else {
    outcome = 'error';
  }

  return {
    episode_id: `ep_${context.smartlink_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    envelope_id: 'env.smartlink_resolve_v1',
    envelope_instance_id: envelope.correlation_id,
    timestamp_start: new Date(metadata.startTime).toISOString(),
    timestamp_end: new Date(metadata.endTime).toISOString(),
    input: context,
    config: {
      ref: `kv://smartlink_configs/${config.smartlink_id}`,
      version: config.meta?.version,
    },
    output: result,
    executor: {
      type: 'cloudflare-worker',
      version: metadata.executorVersion,
      instance_id: metadata.executorId,
    },
    metrics: {
      latency_ms: latencyMs,
      cache_hit: false, // TODO: implement caching
    },
    outcome,
    outcome_details: {
      resolution_outcome: result.outcome,
      http_status: result.outcome === 'OK' || result.outcome === 'DEFAULT_USED' ? 302 : 500,
    },
  };
}

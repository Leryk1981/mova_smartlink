/**
 * MOVA 4.0 stats handler
 * Implements env.smartlink_stats_get_v1 envelope
 */

import {
  buildStatsReport,
  validateStatsQuery,
  validateStatsReport,
  type SmartlinkStatsGetEnvelope,
} from '@mova/core-smartlink';
import type { Env } from '../types.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { listEpisodes } from '../utils/kv-mova4.js';

/**
 * Handle MOVA 4.0 stats query
 * POST /smartlink/stats
 * 
 * Accepts: env.smartlink_stats_get_v1
 * Returns: env.smartlink_stats_get_v1 (with output filled)
 */
export async function handleStats(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();

  try {
    // Parse envelope
    let envelope: SmartlinkStatsGetEnvelope;
    try {
      envelope = (await request.json()) as SmartlinkStatsGetEnvelope;
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }

    // Validate envelope structure
    if (envelope.envelope_id !== 'env.smartlink_stats_get_v1') {
      return errorResponse('Invalid envelope_id, expected env.smartlink_stats_get_v1', 400);
    }

    if (envelope.verb !== 'get') {
      return errorResponse('Invalid verb, expected "get"', 400);
    }

    // Validate input (stats query)
    const queryValidation = validateStatsQuery(envelope.payload.input);
    if (!queryValidation.ok) {
      return errorResponse(
        `Invalid stats query: ${JSON.stringify(queryValidation.error)}`,
        400
      );
    }

    const query = queryValidation.value;

    // Load episodes from KV
    // Note: In production, consider using D1 for better query performance
    const episodes = await listEpisodes(
      env.KV_SMARTLINK_RULES,
      query.smartlink_id,
      query.limit || 1000
    );

    // Build stats report using core function
    const report = buildStatsReport(episodes, query);

    // Validate report (optional, for debugging)
    const reportValidation = validateStatsReport(report);
    if (!reportValidation.ok) {
      console.error('Invalid stats report:', reportValidation.error);
      // Continue anyway - internal validation issue
    }

    // Build response envelope
    const responseEnvelope: SmartlinkStatsGetEnvelope = {
      ...envelope,
      payload: {
        input: query,
        output: report,
      },
      meta: {
        ...envelope.meta,
        timestamp: new Date().toISOString(),
        query_latency_ms: Date.now() - startTime,
      },
    };

    return jsonResponse(responseEnvelope);
  } catch (error) {
    console.error('Error in handleStats:', error);
    return errorResponse('Internal server error', 500);
  }
}

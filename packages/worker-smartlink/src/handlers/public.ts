/**
 * Public handler for /s/:linkId
 * Performs smartlink evaluation and redirect
 */

import { evaluate } from '@mova/core-smartlink/runtime';
import type { Env, DebugResponse } from '../types.js';
import { normalizeContext } from '../utils/context.js';
import { getSmartlinkCore } from '../utils/kv.js';
import { jsonResponse, errorResponse, redirectResponse } from '../utils/response.js';

/**
 * Handle public smartlink redirect
 * GET /s/:linkId
 */
export async function handlePublicRedirect(
  request: Request,
  linkId: string,
  env: Env
): Promise<Response> {
  try {
    // Load SmartlinkCore from KV
    const core = await getSmartlinkCore(env.KV_SMARTLINK_RULES, linkId);
    
    if (!core) {
      return errorResponse(`Smartlink not found: ${linkId}`, 404);
    }
    
    // Check if smartlink is active (optional - MVP may skip this)
    if (core.status === 'archived') {
      return errorResponse(`Smartlink is archived: ${linkId}`, 410);
    }
    
    // Normalize request context
    const context = normalizeContext(request);
    
    // Evaluate rules
    const decision = evaluate(context, core);
    
    // Get final URL (for MVP, target IS the URL)
    const finalUrl = decision.target;
    
    // Check if debug mode
    const url = new URL(request.url);
    const debugMode = url.searchParams.get('debug') === '1';
    
    if (debugMode) {
      // Return debug JSON instead of redirect
      const debugResponse: DebugResponse = {
        link_id: linkId,
        context: {
          country: context.country,
          lang: context.lang,
          device: context.device,
          utm: context.utm as Record<string, string> | undefined,
          now: context.now,  // v2: Include timestamp in debug output
        },
        decision: {
          target: decision.target,
          branch: decision.branch,
          rule_index: decision.rule_index,
        },
        final_url: finalUrl,
        timestamp: new Date().toISOString(),
      };
      
      return jsonResponse(debugResponse);
    }
    
    // Normal redirect
    return redirectResponse(finalUrl);
    
  } catch (error) {
    console.error('Error in handlePublicRedirect:', error);
    return errorResponse('Internal server error', 500);
  }
}


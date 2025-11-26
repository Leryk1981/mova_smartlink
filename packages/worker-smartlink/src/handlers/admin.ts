/**
 * Admin handlers for /api/smartlinks/:linkId
 * CRUD operations on SmartlinkCore
 */

import type { SmartlinkCore } from '@mova/core-smartlink';
import type { Env } from '../types.js';
import { getSmartlinkCore, saveSmartlinkCore, deleteSmartlinkCore } from '../utils/kv.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

/**
 * Get SmartlinkCore configuration
 * GET /api/smartlinks/:linkId
 */
export async function handleGetSmartlink(
  linkId: string,
  env: Env
): Promise<Response> {
  try {
    const core = await getSmartlinkCore(env.KV_SMARTLINK_RULES, linkId);
    
    if (!core) {
      return errorResponse(`Smartlink not found: ${linkId}`, 404);
    }
    
    return jsonResponse(core);
    
  } catch (error) {
    console.error('Error in handleGetSmartlink:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * Update SmartlinkCore configuration
 * PUT /api/smartlinks/:linkId
 */
export async function handlePutSmartlink(
  request: Request,
  linkId: string,
  env: Env
): Promise<Response> {
  try {
    // Parse request body
    let core: SmartlinkCore;
    try {
      core = await request.json() as SmartlinkCore;
    } catch {
      return errorResponse('Invalid JSON body', 400);
    }
    
    // Validate link_id matches URL parameter
    if (core.link_id !== linkId) {
      return errorResponse(
        `link_id in body (${core.link_id}) must match URL parameter (${linkId})`,
        400
      );
    }
    
    // Basic validation
    if (!core.status || !core.rules || !core.fallback_target) {
      return errorResponse('Missing required fields: status, rules, fallback_target', 400);
    }
    
    // TODO: Validate against ds:smartlink_rules_v1 schema with Ajv
    
    // Update metadata
    if (!core.meta) {
      core.meta = {};
    }
    
    const now = new Date().toISOString();
    
    if (!core.meta.version) {
      core.meta.version = 1;
      core.meta.created_at = now;
      core.meta.created_by = 'api';
    } else {
      core.meta.version += 1;
    }
    
    core.meta.updated_at = now;
    core.meta.updated_by = 'api';
    
    // Save to KV
    await saveSmartlinkCore(env.KV_SMARTLINK_RULES, core);
    
    return jsonResponse(core);
    
  } catch (error) {
    console.error('Error in handlePutSmartlink:', error);
    return errorResponse('Internal server error', 500);
  }
}

/**
 * Delete SmartlinkCore configuration
 * DELETE /api/smartlinks/:linkId
 */
export async function handleDeleteSmartlink(
  linkId: string,
  env: Env
): Promise<Response> {
  try {
    await deleteSmartlinkCore(env.KV_SMARTLINK_RULES, linkId);
    
    return jsonResponse({ 
      success: true, 
      message: `Smartlink deleted: ${linkId}` 
    });
    
  } catch (error) {
    console.error('Error in handleDeleteSmartlink:', error);
    return errorResponse('Internal server error', 500);
  }
}


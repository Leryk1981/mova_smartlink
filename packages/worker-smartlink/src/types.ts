/**
 * Worker-specific types and bindings
 */

import type { SmartlinkCore } from '@mova/core-smartlink';

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  /** KV namespace for SmartlinkCore rules */
  KV_SMARTLINK_RULES: KVNamespace;
  
  /** Optional: Queue for smartlink.redirected events */
  QUEUE_SMARTLINK_EVENTS?: Queue;
  
  /** Environment name (development, production, etc) */
  ENVIRONMENT?: string;
}

/**
 * Stored value in KV
 */
export interface KVSmartlinkValue {
  core: SmartlinkCore;
  updated_at: string;
}

/**
 * Debug response when ?debug=1
 */
export interface DebugResponse {
  link_id: string;
  context: {
    country?: string;
    lang?: string;
    device?: string;
    utm?: Record<string, string>;
  };
  decision: {
    target: string;
    branch: string;
    rule_index: number;
  };
  final_url: string;
  timestamp: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}


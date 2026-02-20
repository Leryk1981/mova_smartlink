/**
 * @mova/core-smartlink v2.0.0
 * 
 * Pure TypeScript library for SmartLink evaluation - MOVA 5.0.0 compatibility
 * No HTTP, no Cloudflare dependencies - just core logic.
 */

// Legacy (MOVA 3.6) - kept for backwards compatibility
export { evaluate } from './evaluate.js';
export * as legacyTypes from './types.js';
export type {
  SmartlinkStatus as LegacySmartlinkStatus,
  SmartlinkMeta as LegacySmartlinkMeta,
  SmartlinkCore,
  SmartlinkContext,
  SmartlinkDecision,
  SmartlinkRule,
  FieldCondition,
  RuleConditions,
  ContextField,
} from './types.js';

// MOVA 5.0.0 compatibility (recommended)
export * from './types-mova4.js';
export * from './validators.js';
export * from './resolve.js';
export * from './stats.js';


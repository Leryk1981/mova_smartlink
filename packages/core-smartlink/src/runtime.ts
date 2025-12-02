/**
 * Runtime-friendly exports for environments without Ajv (e.g., Cloudflare Workers).
 *
 * Provides pure resolution and statistics helpers plus type definitions
 * without pulling in the Ajv-based validators.
 */

// Legacy (MOVA 3.6)
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

// MOVA 4.0.0 (runtime-safe)
export * from './types-mova4.js';
export { resolveSmartlink } from './resolve.js';
export { buildStatsReport } from './stats.js';

/**
 * Types for Smartlink Core Library
 * Based on ds:smartlink_rules_v1 schema
 */

/**
 * Status of a smartlink in the admin panel
 */
export type SmartlinkStatus = 'draft' | 'active' | 'archived';

/**
 * Context fields that can be used in rules
 */
export type ContextField =
  | 'country'
  | 'lang'
  | 'device'
  | 'utm.source'
  | 'utm.campaign'
  | 'utm.medium'
  | 'utm.term'
  | 'utm.content';

/**
 * UTM parameters from query string
 */
export interface UTMParams {
  source?: string;
  campaign?: string;
  medium?: string;
  term?: string;
  content?: string;
}

/**
 * Condition for a single field (can be string or array of strings)
 */
export type FieldCondition = string | string[];

/**
 * Conditions that trigger a rule
 */
export interface RuleConditions {
  country?: FieldCondition;
  lang?: FieldCondition;
  device?: FieldCondition;
  utm?: {
    source?: FieldCondition;
    campaign?: FieldCondition;
    medium?: FieldCondition;
    term?: FieldCondition;
    content?: FieldCondition;
  };
}

/**
 * Single routing rule
 */
export interface SmartlinkRule {
  id?: string;
  label?: string;
  priority?: number;
  when: RuleConditions;
  target: string;
  
  // v2 fields
  enabled?: boolean;      // default: true
  start_at?: string;      // ISO 8601 date-time
  end_at?: string;        // ISO 8601 date-time
  weight?: number;        // for A/B testing (non-negative)
}

/**
 * Metadata for versioning and audit
 */
export interface SmartlinkMeta {
  version?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Complete SmartlinkCore configuration
 * Matches ds:smartlink_rules_v1
 */
export interface SmartlinkCore {
  link_id: string;
  purpose?: string;
  status: SmartlinkStatus;
  context_shape?: ContextField[];
  rules: SmartlinkRule[];
  fallback_target: string;
  meta?: SmartlinkMeta;
}

/**
 * Normalized context for evaluation
 * Extracted from HTTP request (cf.country, headers, query)
 */
export interface SmartlinkContext {
  country?: string;
  lang?: string;
  device?: string;
  utm?: UTMParams;
  now?: string;  // ISO 8601 timestamp for time-based rules
}

/**
 * Result of rules evaluation
 */
export interface SmartlinkDecision {
  /** Matched target (URL or logical id) */
  target: string;
  /** Branch/label of the matched rule (or 'fallback') */
  branch: string;
  /** Index of matched rule (or -1 for fallback) */
  rule_index: number;
  /** Optional: resolved final URL (if different from target) */
  url?: string;
}


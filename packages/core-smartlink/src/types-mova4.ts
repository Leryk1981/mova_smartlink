/**
 * TypeScript types for SmartLink MOVA 4.0.0
 * Generated from schemas in mova4-smartlink/schemas/
 * 
 * These types correspond to:
 * - ds.smartlink_config_v1
 * - ds.smartlink_click_context_v1
 * - ds.smartlink_resolution_result_v1
 * - ds.smartlink_stats_query_v1
 * - ds.smartlink_stats_report_v1
 * - ds.episode_smartlink_resolution_v1
 */

// ============================================================================
// ds.smartlink_config_v1
// ============================================================================

export type SmartlinkStatus = 'draft' | 'active' | 'paused' | 'archived';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface SmartlinkTargetConditions {
  country?: string | string[];
  language?: string | string[];
  device?: DeviceType | DeviceType[];
  utm?: {
    source?: string | string[];
    medium?: string | string[];
    campaign?: string | string[];
    term?: string | string[];
    content?: string | string[];
  };
}

export interface SmartlinkTarget {
  target_id: string;
  url: string;
  label?: string;
  conditions?: SmartlinkTargetConditions;
  priority?: number;
  enabled?: boolean;
  valid_from?: string; // ISO 8601
  valid_until?: string; // ISO 8601
}

export interface SmartlinkLimits {
  max_clicks?: number;
  valid_from?: string; // ISO 8601
  valid_until?: string; // ISO 8601
}

export interface SmartlinkMeta {
  version?: number;
  created_at?: string; // ISO 8601
  updated_at?: string; // ISO 8601
  created_by?: string;
  updated_by?: string;
  [key: string]: unknown;
}

export interface SmartlinkConfig {
  smartlink_id: string;
  name?: string;
  description?: string;
  status: SmartlinkStatus;
  targets: SmartlinkTarget[];
  default_target_id: string;
  limits?: SmartlinkLimits;
  tags?: string[];
  notes?: string;
  meta?: SmartlinkMeta;
}

// ============================================================================
// ds.smartlink_click_context_v1
// ============================================================================

export interface SmartlinkUTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface SmartlinkClickContext {
  smartlink_id: string;
  timestamp: string; // ISO 8601
  ip?: string;
  country?: string;
  language?: string;
  device?: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
  user_agent?: string;
  referrer?: string;
  utm?: SmartlinkUTMParams;
  query_params?: Record<string, string>;
  edge_location?: string;
}

// ============================================================================
// ds.smartlink_resolution_result_v1
// ============================================================================

export type ResolutionOutcome =
  | 'OK'
  | 'NO_MATCH'
  | 'DEFAULT_USED'
  | 'ERROR'
  | 'RATE_LIMIT'
  | 'EXPIRED'
  | 'DISABLED';

export interface MatchedConditions {
  country?: boolean;
  language?: boolean;
  device?: boolean;
  utm?: boolean;
}

export interface SmartlinkResolutionResult {
  smartlink_id: string;
  resolved_target_id?: string;
  resolved_url?: string;
  outcome: ResolutionOutcome;
  reason?: string;
  matched_conditions?: MatchedConditions;
  latency_ms?: number;
  executor_id?: string;
  executor_version?: string;
  debug_info?: Record<string, unknown>;
}

// ============================================================================
// ds.smartlink_stats_query_v1
// ============================================================================

export type StatsGroupBy =
  | 'target_id'
  | 'country'
  | 'device'
  | 'utm_source'
  | 'utm_campaign'
  | 'outcome'
  | 'hour'
  | 'day';

export interface SmartlinkStatsQuery {
  smartlink_id?: string;
  time_range?: {
    from: string; // ISO 8601
    to: string; // ISO 8601
  };
  group_by?: StatsGroupBy[];
  filters?: {
    target_id?: string | string[];
    country?: string | string[];
    device?: string | string[];
    outcome?: string | string[];
  };
  limit?: number;
  offset?: number;
}

// ============================================================================
// ds.smartlink_stats_report_v1
// ============================================================================

export interface StatsSummary {
  total_clicks: number;
  successful_redirects: number;
  errors: number;
  unique_countries?: number;
  unique_targets?: number;
  avg_latency_ms?: number;
  [key: string]: unknown;
}

export interface StatsRow {
  dimensions: Record<string, string>;
  metrics: {
    clicks: number;
    successful_redirects: number;
    errors: number;
    avg_latency_ms?: number;
    [key: string]: unknown;
  };
}

export interface StatsReportMeta {
  generated_at?: string; // ISO 8601
  query_latency_ms?: number;
  total_rows?: number;
  [key: string]: unknown;
}

export interface SmartlinkStatsReport {
  query?: SmartlinkStatsQuery;
  summary: StatsSummary;
  rows: StatsRow[];
  meta?: StatsReportMeta;
}

// ============================================================================
// ds.episode_smartlink_resolution_v1
// ============================================================================

export type EpisodeOutcome = 'success' | 'partial_success' | 'failure' | 'error';

export interface EpisodeExecutor {
  type: string;
  version?: string;
  instance_id?: string;
  location?: string;
  [key: string]: unknown;
}

export interface EpisodeMetrics {
  latency_ms: number;
  config_fetch_ms?: number;
  evaluation_ms?: number;
  retries?: number;
  cache_hit?: boolean;
  [key: string]: unknown;
}

export interface EpisodeOutcomeDetails {
  resolution_outcome?: string;
  http_status?: number;
  error_code?: string;
  error_message?: string;
  [key: string]: unknown;
}

export interface EpisodeQualitySignals {
  user_bounced?: boolean;
  conversion?: boolean;
  anomaly_detected?: boolean;
  confidence_score?: number;
  [key: string]: unknown;
}

export interface EpisodeAnalysis {
  analyzed_at?: string; // ISO 8601
  analyzed_by?: string;
  insights?: string[];
  tags?: string[];
  [key: string]: unknown;
}

export interface SmartlinkResolutionEpisode {
  episode_id: string;
  envelope_id: 'env.smartlink_resolve_v1';
  envelope_instance_id?: string;
  timestamp_start: string; // ISO 8601
  timestamp_end: string; // ISO 8601
  input: SmartlinkClickContext | { ref: string };
  config?: SmartlinkConfig | { ref: string; version?: number };
  output: SmartlinkResolutionResult | { ref: string };
  executor: EpisodeExecutor;
  metrics?: EpisodeMetrics;
  outcome: EpisodeOutcome;
  outcome_details?: EpisodeOutcomeDetails;
  quality_signals?: EpisodeQualitySignals;
  notes?: string;
  analysis?: EpisodeAnalysis;
}

// ============================================================================
// env.smartlink_resolve_v1 (envelope)
// ============================================================================

export interface SmartlinkResolveEnvelope {
  envelope_id: 'env.smartlink_resolve_v1';
  verb: 'route';
  correlation_id?: string;
  roles: {
    requester: string;
    executor: string;
  };
  payload: {
    input: SmartlinkClickContext;
    config?: SmartlinkConfig | { config_ref: string };
    output?: SmartlinkResolutionResult;
  };
  meta?: {
    timestamp?: string; // ISO 8601
    trace_id?: string;
    request_id?: string;
    [key: string]: unknown;
  };
}

// ============================================================================
// env.smartlink_stats_get_v1 (envelope)
// ============================================================================

export interface SmartlinkStatsGetEnvelope {
  envelope_id: 'env.smartlink_stats_get_v1';
  verb: 'get';
  correlation_id?: string;
  roles: {
    requester: string;
    executor: string;
  };
  payload: {
    input: SmartlinkStatsQuery;
    output?: SmartlinkStatsReport;
  };
  meta?: {
    timestamp?: string; // ISO 8601
    trace_id?: string;
    request_id?: string;
    [key: string]: unknown;
  };
}

// ============================================================================
// Utility types
// ============================================================================

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, unknown>;
}

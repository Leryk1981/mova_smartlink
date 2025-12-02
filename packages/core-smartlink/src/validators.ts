/**
 * JSON Schema validators for SmartLink MOVA 4.0.0
 * 
 * Uses Ajv for validation against schemas from mova4-smartlink/schemas/
 */

import Ajv2020, { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type {
  SmartlinkConfig,
  SmartlinkClickContext,
  SmartlinkResolutionResult,
  SmartlinkStatsQuery,
  SmartlinkStatsReport,
  ValidationError,
  Result,
} from './types-mova4.js';

// Import schemas (these should be copied or symlinked from mova4-smartlink/schemas/)
// For now, we'll define them inline based on the schema files

const configSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://mova.dev/schemas/ds.smartlink_config_v1.schema.json',
  title: 'SmartLink Configuration v1',
  type: 'object',
  properties: {
    smartlink_id: { type: 'string', pattern: '^[a-zA-Z0-9_\\-:.]+$' },
    name: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['draft', 'active', 'paused', 'archived'] },
    targets: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          target_id: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          label: { type: 'string' },
          conditions: {
            type: 'object',
            properties: {
              country: {
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' }, minItems: 1 },
                ],
              },
              language: {
                oneOf: [
                  { type: 'string' },
                  { type: 'array', items: { type: 'string' }, minItems: 1 },
                ],
              },
              device: {
                oneOf: [
                  { type: 'string', enum: ['mobile', 'tablet', 'desktop'] },
                  {
                    type: 'array',
                    items: { type: 'string', enum: ['mobile', 'tablet', 'desktop'] },
                    minItems: 1,
                  },
                ],
              },
              utm: {
                type: 'object',
                properties: {
                  source: {
                    oneOf: [
                      { type: 'string' },
                      { type: 'array', items: { type: 'string' }, minItems: 1 },
                    ],
                  },
                  medium: {
                    oneOf: [
                      { type: 'string' },
                      { type: 'array', items: { type: 'string' }, minItems: 1 },
                    ],
                  },
                  campaign: {
                    oneOf: [
                      { type: 'string' },
                      { type: 'array', items: { type: 'string' }, minItems: 1 },
                    ],
                  },
                  term: {
                    oneOf: [
                      { type: 'string' },
                      { type: 'array', items: { type: 'string' }, minItems: 1 },
                    ],
                  },
                  content: {
                    oneOf: [
                      { type: 'string' },
                      { type: 'array', items: { type: 'string' }, minItems: 1 },
                    ],
                  },
                },
                additionalProperties: false,
              },
            },
            additionalProperties: false,
          },
          priority: { type: 'integer', minimum: 0 },
          enabled: { type: 'boolean', default: true },
          valid_from: { type: 'string', format: 'date-time' },
          valid_until: { type: 'string', format: 'date-time' },
        },
        required: ['target_id', 'url'],
        additionalProperties: false,
      },
    },
    default_target_id: { type: 'string' },
    limits: {
      type: 'object',
      properties: {
        max_clicks: { type: 'integer', minimum: 1 },
        valid_from: { type: 'string', format: 'date-time' },
        valid_until: { type: 'string', format: 'date-time' },
      },
      additionalProperties: false,
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      uniqueItems: true,
    },
    notes: { type: 'string' },
    meta: {
      type: 'object',
      additionalProperties: true,
    },
  },
  required: ['smartlink_id', 'status', 'targets', 'default_target_id'],
  additionalProperties: false,
};

const clickContextSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://mova.dev/schemas/ds.smartlink_click_context_v1.schema.json',
  title: 'SmartLink Click Context v1',
  type: 'object',
  properties: {
    smartlink_id: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
    ip: { type: 'string' },
    country: { type: 'string' },
    language: { type: 'string' },
    device: {
      type: 'string',
      enum: ['mobile', 'tablet', 'desktop', 'bot', 'unknown'],
    },
    user_agent: { type: 'string' },
    referrer: { type: 'string' },
    utm: {
      type: 'object',
      properties: {
        source: { type: 'string' },
        medium: { type: 'string' },
        campaign: { type: 'string' },
        term: { type: 'string' },
        content: { type: 'string' },
      },
      additionalProperties: false,
    },
    query_params: {
      type: 'object',
      additionalProperties: { type: 'string' },
    },
    edge_location: { type: 'string' },
  },
  required: ['smartlink_id', 'timestamp'],
  additionalProperties: false,
};

const resolutionResultSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://mova.dev/schemas/ds.smartlink_resolution_result_v1.schema.json',
  title: 'SmartLink Resolution Result v1',
  type: 'object',
  properties: {
    smartlink_id: { type: 'string' },
    resolved_target_id: { type: 'string' },
    resolved_url: { type: 'string', format: 'uri' },
    outcome: {
      type: 'string',
      enum: ['OK', 'NO_MATCH', 'DEFAULT_USED', 'ERROR', 'RATE_LIMIT', 'EXPIRED', 'DISABLED'],
    },
    reason: { type: 'string' },
    matched_conditions: {
      type: 'object',
      properties: {
        country: { type: 'boolean' },
        language: { type: 'boolean' },
        device: { type: 'boolean' },
        utm: { type: 'boolean' },
      },
      additionalProperties: false,
    },
    latency_ms: { type: 'number', minimum: 0 },
    executor_id: { type: 'string' },
    executor_version: { type: 'string' },
    debug_info: { type: 'object', additionalProperties: true },
  },
  required: ['smartlink_id', 'outcome'],
  additionalProperties: false,
};

// Initialize Ajv instance
const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
});
addFormats(ajv);

// Compile validators
const validateConfigFn: ValidateFunction<SmartlinkConfig> = ajv.compile(configSchema);
const validateClickContextFn: ValidateFunction<SmartlinkClickContext> =
  ajv.compile(clickContextSchema);
const validateResolutionResultFn: ValidateFunction<SmartlinkResolutionResult> =
  ajv.compile(resolutionResultSchema);

/**
 * Convert Ajv errors to ValidationError array
 */
function formatErrors(errors: ErrorObject[] | null | undefined): ValidationError[] {
  if (!errors) return [];

  return errors.map((err: ErrorObject) => ({
    path: err.instancePath || '(root)',
    message: err.message || 'Validation error',
    keyword: err.keyword,
    params: err.params,
  }));
}

/**
 * Validate SmartLink configuration
 */
export function validateConfig(data: unknown): Result<SmartlinkConfig, ValidationError[]> {
  if (validateConfigFn(data)) {
    return { ok: true, value: data as SmartlinkConfig };
  }
  return { ok: false, error: formatErrors(validateConfigFn.errors) };
}

/**
 * Validate click context
 */
export function validateClickContext(
  data: unknown
): Result<SmartlinkClickContext, ValidationError[]> {
  if (validateClickContextFn(data)) {
    return { ok: true, value: data as SmartlinkClickContext };
  }
  return { ok: false, error: formatErrors(validateClickContextFn.errors) };
}

/**
 * Validate resolution result
 */
export function validateResolutionResult(
  data: unknown
): Result<SmartlinkResolutionResult, ValidationError[]> {
  if (validateResolutionResultFn(data)) {
    return { ok: true, value: data as SmartlinkResolutionResult };
  }
  return { ok: false, error: formatErrors(validateResolutionResultFn.errors) };
}

/**
 * Validate stats query (basic implementation)
 */
export function validateStatsQuery(data: unknown): Result<SmartlinkStatsQuery, ValidationError[]> {
  // Basic type check for now
  if (typeof data !== 'object' || data === null) {
    return {
      ok: false,
      error: [{ path: '(root)', message: 'Stats query must be an object' }],
    };
  }
  return { ok: true, value: data as SmartlinkStatsQuery };
}

/**
 * Validate stats report (basic implementation)
 */
export function validateStatsReport(data: unknown): Result<SmartlinkStatsReport, ValidationError[]> {
  // Basic type check for now
  if (typeof data !== 'object' || data === null) {
    return {
      ok: false,
      error: [{ path: '(root)', message: 'Stats report must be an object' }],
    };
  }

  const report = data as SmartlinkStatsReport;
  if (!report.summary || !report.rows) {
    return {
      ok: false,
      error: [
        { path: '(root)', message: 'Stats report must have summary and rows' },
      ],
    };
  }

  return { ok: true, value: report };
}

// Aggregate export to prevent unused-value complaints in strict builds
export const statsValidators = { validateStatsQuery, validateStatsReport };

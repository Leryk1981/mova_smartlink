/**
 * SmartLink resolution logic for MOVA 4.0.0
 * 
 * Implements ds.smartlink_config_v1 → ds.smartlink_resolution_result_v1
 * 
 * Pure function: no I/O, no external dependencies
 */

import type {
  SmartlinkConfig,
  SmartlinkClickContext,
  SmartlinkResolutionResult,
  SmartlinkTarget,
  MatchedConditions,
} from './types-mova4.js';

/**
 * Check if a value matches a condition (string or array of strings)
 * Case-insensitive matching
 */
function matchesCondition(value: string | undefined, condition: string | string[]): boolean {
  if (!value) return false;

  const normalizedValue = value.toLowerCase();

  if (typeof condition === 'string') {
    return normalizedValue === condition.toLowerCase();
  }

  // Array of possible values
  return condition.some((c) => normalizedValue === c.toLowerCase());
}

/**
 * Check if target conditions match the click context
 * Returns null if no match, or MatchedConditions object if matches
 */
function targetMatches(
  target: SmartlinkTarget,
  context: SmartlinkClickContext
): MatchedConditions | null {
  const conditions = target.conditions;
  if (!conditions) {
    // No conditions means it matches everything (lowest priority target)
    return {};
  }

  const matched: MatchedConditions = {};
  let hasAnyCondition = false;

  // Check country
  if (conditions.country !== undefined) {
    hasAnyCondition = true;
    if (!matchesCondition(context.country, conditions.country)) {
      return null; // Does not match
    }
    matched.country = true;
  }

  // Check language
  if (conditions.language !== undefined) {
    hasAnyCondition = true;
    if (!matchesCondition(context.language, conditions.language)) {
      return null;
    }
    matched.language = true;
  }

  // Check device
  if (conditions.device !== undefined) {
    hasAnyCondition = true;
    if (!matchesCondition(context.device, conditions.device)) {
      return null;
    }
    matched.device = true;
  }

  // Check UTM parameters
  if (conditions.utm !== undefined) {
    hasAnyCondition = true;
    const contextUtm = context.utm || {};
    let utmMatched = false;

    if (conditions.utm.source !== undefined) {
      if (!matchesCondition(contextUtm.source, conditions.utm.source)) {
        return null;
      }
      utmMatched = true;
    }

    if (conditions.utm.medium !== undefined) {
      if (!matchesCondition(contextUtm.medium, conditions.utm.medium)) {
        return null;
      }
      utmMatched = true;
    }

    if (conditions.utm.campaign !== undefined) {
      if (!matchesCondition(contextUtm.campaign, conditions.utm.campaign)) {
        return null;
      }
      utmMatched = true;
    }

    if (conditions.utm.term !== undefined) {
      if (!matchesCondition(contextUtm.term, conditions.utm.term)) {
        return null;
      }
      utmMatched = true;
    }

    if (conditions.utm.content !== undefined) {
      if (!matchesCondition(contextUtm.content, conditions.utm.content)) {
        return null;
      }
      utmMatched = true;
    }

    if (utmMatched) {
      matched.utm = true;
    }
  }

  // If no conditions were specified, don't match (empty conditions object)
  if (!hasAnyCondition) {
    return {};
  }

  // All conditions matched
  return matched;
}

/**
 * Check if target is active at given time
 */
function isTargetActive(target: SmartlinkTarget, now: Date): boolean {
  // Check if target is explicitly disabled
  if (target.enabled === false) {
    return false;
  }

  // Check valid_from
  if (target.valid_from) {
    const validFrom = new Date(target.valid_from);
    if (now < validFrom) {
      return false;
    }
  }

  // Check valid_until
  if (target.valid_until) {
    const validUntil = new Date(target.valid_until);
    if (now > validUntil) {
      return false;
    }
  }

  return true;
}

/**
 * Check if smartlink itself is active
 */
function isSmartlinkActive(config: SmartlinkConfig, now: Date): boolean {
  // Check status
  if (config.status !== 'active') {
    return false;
  }

  // Check limits
  if (config.limits) {
    if (config.limits.valid_from) {
      const validFrom = new Date(config.limits.valid_from);
      if (now < validFrom) {
        return false;
      }
    }

    if (config.limits.valid_until) {
      const validUntil = new Date(config.limits.valid_until);
      if (now > validUntil) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Resolve smartlink click to a target URL
 * 
 * Implements MOVA 4.0 resolution logic:
 * 1. Check if smartlink is active (status, time limits)
 * 2. Filter active targets (enabled, time-based)
 * 3. Sort by priority (lower = higher priority)
 * 4. Find first matching target
 * 5. Return result with appropriate outcome
 * 
 * @param config - SmartLink configuration (ds.smartlink_config_v1)
 * @param context - Click context (ds.smartlink_click_context_v1)
 * @param now - Current time (defaults to context.timestamp or now)
 * @returns Resolution result (ds.smartlink_resolution_result_v1)
 */
export function resolveSmartlink(
  config: SmartlinkConfig,
  context: SmartlinkClickContext,
  now?: Date
): SmartlinkResolutionResult {
  const timestamp = now || new Date(context.timestamp);
  const startTime = Date.now();

  // Check if smartlink itself is active
  if (!isSmartlinkActive(config, timestamp)) {
    const reason =
      config.status !== 'active'
        ? `SmartLink status is ${config.status}`
        : 'SmartLink has expired or not yet active';

    return {
      smartlink_id: config.smartlink_id,
      outcome: 'EXPIRED',
      reason,
      latency_ms: Date.now() - startTime,
    };
  }

  // Default priority for targets without explicit priority
  const DEFAULT_PRIORITY = 1000;

  // Filter active targets and sort by priority
  const activeTargets = config.targets
    .map((target, index) => ({ target, index }))
    .filter(({ target }) => isTargetActive(target, timestamp))
    .sort((a, b) => {
      const priorityA = a.target.priority !== undefined ? a.target.priority : DEFAULT_PRIORITY;
      const priorityB = b.target.priority !== undefined ? b.target.priority : DEFAULT_PRIORITY;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Same priority - maintain original order
      return a.index - b.index;
    });

  // No active targets
  if (activeTargets.length === 0) {
    return {
      smartlink_id: config.smartlink_id,
      outcome: 'NO_MATCH',
      reason: 'No active targets available',
      latency_ms: Date.now() - startTime,
    };
  }

  // Find first matching target
  for (const { target } of activeTargets) {
    const matchedConditions = targetMatches(target, context);

    if (matchedConditions !== null) {
      // Found a match!
      const isDefaultTarget = target.target_id === config.default_target_id;
      return {
        smartlink_id: config.smartlink_id,
        resolved_target_id: target.target_id,
        resolved_url: target.url,
        outcome: isDefaultTarget ? 'DEFAULT_USED' : 'OK',
        reason: isDefaultTarget
          ? 'No conditions matched, using default target'
          : `Matched target: ${target.label || target.target_id}`,
        matched_conditions: matchedConditions,
        latency_ms: Date.now() - startTime,
      };
    }
  }

  // No match - use default target
  const defaultTarget = config.targets.find((t) => t.target_id === config.default_target_id);

  if (!defaultTarget) {
    return {
      smartlink_id: config.smartlink_id,
      outcome: 'ERROR',
      reason: `Default target ${config.default_target_id} not found in configuration`,
      latency_ms: Date.now() - startTime,
    };
  }

  return {
    smartlink_id: config.smartlink_id,
    resolved_target_id: defaultTarget.target_id,
    resolved_url: defaultTarget.url,
    outcome: 'DEFAULT_USED',
    reason: 'No conditions matched, using default target',
    latency_ms: Date.now() - startTime,
  };
}

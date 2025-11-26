import type {
  SmartlinkCore,
  SmartlinkContext,
  SmartlinkDecision,
  SmartlinkRule,
  FieldCondition,
} from './types.js';

/**
 * Check if a value matches a condition (string or array of strings)
 */
function matchesCondition(value: string | undefined, condition: FieldCondition): boolean {
  if (!value) return false;
  
  if (typeof condition === 'string') {
    return value.toLowerCase() === condition.toLowerCase();
  }
  
  // Array of possible values
  return condition.some(c => value.toLowerCase() === c.toLowerCase());
}

/**
 * Check if all conditions in a rule match the context
 */
function ruleMatches(rule: SmartlinkRule, context: SmartlinkContext): boolean {
  const { when } = rule;
  
  // Check country
  if (when.country !== undefined) {
    if (!matchesCondition(context.country, when.country)) {
      return false;
    }
  }
  
  // Check lang
  if (when.lang !== undefined) {
    if (!matchesCondition(context.lang, when.lang)) {
      return false;
    }
  }
  
  // Check device
  if (when.device !== undefined) {
    if (!matchesCondition(context.device, when.device)) {
      return false;
    }
  }
  
  // Check UTM parameters
  if (when.utm !== undefined) {
    const contextUtm = context.utm || {};
    
    if (when.utm.source !== undefined) {
      if (!matchesCondition(contextUtm.source, when.utm.source)) {
        return false;
      }
    }
    
    if (when.utm.campaign !== undefined) {
      if (!matchesCondition(contextUtm.campaign, when.utm.campaign)) {
        return false;
      }
    }
    
    if (when.utm.medium !== undefined) {
      if (!matchesCondition(contextUtm.medium, when.utm.medium)) {
        return false;
      }
    }
    
    if (when.utm.term !== undefined) {
      if (!matchesCondition(contextUtm.term, when.utm.term)) {
        return false;
      }
    }
    
    if (when.utm.content !== undefined) {
      if (!matchesCondition(contextUtm.content, when.utm.content)) {
        return false;
      }
    }
  }
  
  // All conditions matched
  return true;
}

/**
 * Evaluate smartlink rules and return routing decision
 * 
 * Rules are checked in order:
 * 1. If rule has explicit priority - sort by priority (lower = higher priority)
 * 2. Otherwise use array index order
 * 3. First matching rule wins
 * 4. If no rule matches, use fallback_target
 * 
 * @param context - Normalized request context (country, lang, device, utm)
 * @param core - SmartlinkCore configuration with rules
 * @returns Decision with target, branch, and rule index
 */
export function evaluate(
  context: SmartlinkContext,
  core: SmartlinkCore
): SmartlinkDecision {
  // Sort rules by priority (if defined), then by original index
  const sortedRules = core.rules
    .map((rule, index) => ({ rule, index }))
    .sort((a, b) => {
      // If both have priority, compare priorities
      if (a.rule.priority !== undefined && b.rule.priority !== undefined) {
        return a.rule.priority - b.rule.priority;
      }
      // If only one has priority, it goes first
      if (a.rule.priority !== undefined) return -1;
      if (b.rule.priority !== undefined) return 1;
      // Otherwise maintain original order
      return a.index - b.index;
    });
  
  // Find first matching rule
  for (const { rule, index } of sortedRules) {
    if (ruleMatches(rule, context)) {
      return {
        target: rule.target,
        branch: rule.label || rule.id || `rule_${index}`,
        rule_index: index,
      };
    }
  }
  
  // No rule matched - use fallback
  return {
    target: core.fallback_target,
    branch: 'fallback',
    rule_index: -1,
  };
}


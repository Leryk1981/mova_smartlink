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
 * Check if rule is active at given time
 */
function isRuleActive(rule: SmartlinkRule, now: Date): boolean {
  // Check if rule is explicitly disabled
  if (rule.enabled === false) {
    return false;
  }
  
  // Check start_at
  if (rule.start_at) {
    const startTime = new Date(rule.start_at);
    if (now < startTime) {
      return false;
    }
  }
  
  // Check end_at
  if (rule.end_at) {
    const endTime = new Date(rule.end_at);
    if (now > endTime) {
      return false;
    }
  }
  
  return true;
}

/**
 * Weighted random selection from matching rules
 */
function selectByWeight(matchedRules: Array<{ rule: SmartlinkRule; index: number }>): { rule: SmartlinkRule; index: number } {
  // Check if any rule has weight defined
  const hasWeights = matchedRules.some(r => r.rule.weight !== undefined);
  
  if (!hasWeights) {
    // No weights defined - return first rule (already sorted by priority)
    return matchedRules[0];
  }
  
  // Normalize weights (treat undefined as 1, filter out 0)
  const weighted = matchedRules
    .map(r => ({
      ...r,
      normalizedWeight: r.rule.weight !== undefined ? r.rule.weight : 1,
    }))
    .filter(r => r.normalizedWeight > 0);
  
  if (weighted.length === 0) {
    // All weights are 0 - fallback to first rule
    return matchedRules[0];
  }
  
  if (weighted.length === 1) {
    return weighted[0];
  }
  
  // Calculate total weight
  const totalWeight = weighted.reduce((sum, r) => sum + r.normalizedWeight, 0);
  
  // Random selection
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const item of weighted) {
    cumulative += item.normalizedWeight;
    if (random < cumulative) {
      return item;
    }
  }
  
  // Fallback (shouldn't reach here, but safety)
  return weighted[weighted.length - 1];
}

/**
 * Evaluate smartlink rules and return routing decision
 * 
 * v2 features:
 * - enabled: Skip disabled rules
 * - start_at/end_at: Time-based rule activation
 * - priority: Lower number = higher priority
 * - weight: A/B testing with weighted random selection
 * 
 * Evaluation logic:
 * 1. Filter rules by enabled, start_at, end_at
 * 2. Sort by priority (lower = higher)
 * 3. Find all matching rules (by when conditions)
 * 4. If multiple matches - select by weight (A/B)
 * 5. If no matches - use fallback_target
 * 
 * @param context - Normalized request context (country, lang, device, utm, now)
 * @param core - SmartlinkCore configuration with rules
 * @returns Decision with target, branch, and rule index
 */
export function evaluate(
  context: SmartlinkContext,
  core: SmartlinkCore
): SmartlinkDecision {
  // Determine current time
  const now = context.now ? new Date(context.now) : new Date();
  
  // Default priority for rules without explicit priority
  const DEFAULT_PRIORITY = 1000;
  
  // Step 1: Filter active rules (enabled, time-based)
  // Step 2: Sort by priority
  const activeRules = core.rules
    .map((rule, index) => ({ rule, index }))
    .filter(({ rule }) => isRuleActive(rule, now))
    .sort((a, b) => {
      const priorityA = a.rule.priority !== undefined ? a.rule.priority : DEFAULT_PRIORITY;
      const priorityB = b.rule.priority !== undefined ? b.rule.priority : DEFAULT_PRIORITY;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Same priority - maintain original order
      return a.index - b.index;
    });
  
  // Step 3: Find all matching rules
  const matchedRules = activeRules.filter(({ rule }) => ruleMatches(rule, context));
  
  // Step 4: No matches - use fallback
  if (matchedRules.length === 0) {
    return {
      target: core.fallback_target,
      branch: 'fallback',
      rule_index: -1,
    };
  }
  
  // Step 5: Select rule (weighted random if multiple matches)
  const selected = selectByWeight(matchedRules);
  
  return {
    target: selected.rule.target,
    branch: selected.rule.label || selected.rule.id || `rule_${selected.index}`,
    rule_index: selected.index,
  };
}


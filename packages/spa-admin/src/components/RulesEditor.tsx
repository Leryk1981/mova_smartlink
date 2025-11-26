import { useState } from 'react';
import type { SmartlinkRule, RuleConditions } from '@mova/core-smartlink';
import '../styles/RulesEditor.css';

interface Props {
  rules: SmartlinkRule[];
  onChange: (rules: SmartlinkRule[]) => void;
}

export function RulesEditor({ rules, onChange }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const addRule = () => {
    const newRule: SmartlinkRule = {
      id: `rule_${Date.now()}`,
      label: '',
      when: {},
      target: '',
    };
    onChange([...rules, newRule]);
    setExpandedIndex(rules.length);
  };

  const updateRule = (index: number, updated: SmartlinkRule) => {
    const newRules = [...rules];
    newRules[index] = updated;
    onChange(newRules);
  };

  const deleteRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    onChange(newRules);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const moveRule = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === rules.length - 1)
    ) {
      return;
    }

    const newRules = [...rules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
    onChange(newRules);
    setExpandedIndex(targetIndex);
  };

  return (
    <div className="rules-editor">
      {rules.length === 0 ? (
        <div className="empty-state">
          <p>No rules yet. Add your first rule to get started.</p>
        </div>
      ) : (
        <div className="rules-list">
          {rules.map((rule, index) => (
            <RuleItem
              key={rule.id || index}
              rule={rule}
              index={index}
              expanded={expandedIndex === index}
              onExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
              onChange={(updated) => updateRule(index, updated)}
              onDelete={() => deleteRule(index)}
              onMoveUp={() => moveRule(index, 'up')}
              onMoveDown={() => moveRule(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < rules.length - 1}
            />
          ))}
        </div>
      )}

      <button className="btn btn-secondary" onClick={addRule}>
        + Add Rule
      </button>
    </div>
  );
}

interface RuleItemProps {
  rule: SmartlinkRule;
  index: number;
  expanded: boolean;
  onExpand: () => void;
  onChange: (rule: SmartlinkRule) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function RuleItem({
  rule,
  index,
  expanded,
  onExpand,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: RuleItemProps) {
  const updateField = <K extends keyof SmartlinkRule>(
    field: K,
    value: SmartlinkRule[K]
  ) => {
    onChange({ ...rule, [field]: value });
  };

  const updateCondition = <K extends keyof RuleConditions>(
    field: K,
    value: RuleConditions[K]
  ) => {
    onChange({
      ...rule,
      when: { ...rule.when, [field]: value },
    });
  };

  const removeConditionField = (field: keyof RuleConditions) => {
    const newWhen = { ...rule.when };
    delete newWhen[field];
    onChange({ ...rule, when: newWhen });
  };

  const summary = rule.label || rule.target || `Rule ${index + 1}`;

  return (
    <div className={`rule-item ${expanded ? 'expanded' : ''}`}>
      <div className="rule-header" onClick={onExpand}>
        <span className="rule-index">{index + 1}</span>
        <span className="rule-summary">{summary}</span>
        <div className="rule-actions">
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            title="Move up"
          >
            ↑
          </button>
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            title="Move down"
          >
            ↓
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="rule-body">
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              value={rule.label || ''}
              onChange={(e) => updateField('label', e.target.value)}
              placeholder="e.g., de_mobile_users"
            />
          </div>

          <div className="form-group">
            <label>Priority (optional)</label>
            <input
              type="number"
              value={rule.priority ?? ''}
              onChange={(e) => updateField('priority', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Lower = higher priority"
            />
            <small>Leave empty to use position order</small>
          </div>

          <div className="form-group">
            <label>Target URL</label>
            <input
              type="url"
              value={rule.target}
              onChange={(e) => updateField('target', e.target.value)}
              placeholder="https://example.com/target"
              required
            />
          </div>

          <fieldset className="conditions-fieldset">
            <legend>Conditions (when)</legend>
            
            <ConditionField
              label="Country"
              value={rule.when.country}
              onChange={(v) => updateCondition('country', v)}
              onRemove={() => removeConditionField('country')}
              placeholder="e.g., DE or DE,AT,CH"
            />

            <ConditionField
              label="Language"
              value={rule.when.lang}
              onChange={(v) => updateCondition('lang', v)}
              onRemove={() => removeConditionField('lang')}
              placeholder="e.g., en or en,de"
            />

            <ConditionField
              label="Device"
              value={rule.when.device}
              onChange={(v) => updateCondition('device', v)}
              onRemove={() => removeConditionField('device')}
              placeholder="mobile, tablet, or desktop"
            />

            {rule.when.utm && (
              <div className="utm-conditions">
                <h4>UTM Parameters</h4>
                
                <ConditionField
                  label="Source"
                  value={rule.when.utm.source}
                  onChange={(v) => updateCondition('utm', { ...rule.when.utm, source: v })}
                  onRemove={() => {
                    const { source, ...rest } = rule.when.utm!;
                    updateCondition('utm', Object.keys(rest).length > 0 ? rest : undefined);
                  }}
                  placeholder="e.g., tiktok"
                />

                <ConditionField
                  label="Campaign"
                  value={rule.when.utm.campaign}
                  onChange={(v) => updateCondition('utm', { ...rule.when.utm, campaign: v })}
                  onRemove={() => {
                    const { campaign, ...rest } = rule.when.utm!;
                    updateCondition('utm', Object.keys(rest).length > 0 ? rest : undefined);
                  }}
                  placeholder="e.g., spring_2026"
                />
              </div>
            )}

            {!rule.when.utm && (
              <button
                className="btn btn-small"
                onClick={() => updateCondition('utm', {})}
              >
                + Add UTM Conditions
              </button>
            )}
          </fieldset>
        </div>
      )}
    </div>
  );
}

interface ConditionFieldProps {
  label: string;
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  onRemove: () => void;
  placeholder: string;
}

function ConditionField({ label, value, onChange, onRemove, placeholder }: ConditionFieldProps) {
  if (value === undefined) {
    return (
      <div className="condition-field">
        <button
          className="btn btn-small"
          onClick={() => onChange('')}
        >
          + Add {label}
        </button>
      </div>
    );
  }

  const stringValue = Array.isArray(value) ? value.join(',') : value;

  const handleChange = (str: string) => {
    if (str.includes(',')) {
      // Convert to array
      const arr = str.split(',').map(s => s.trim()).filter(Boolean);
      onChange(arr.length > 1 ? arr : arr[0] || '');
    } else {
      onChange(str);
    }
  };

  return (
    <div className="condition-field active">
      <label>{label}</label>
      <div className="input-with-remove">
        <input
          type="text"
          value={stringValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          className="btn-icon btn-danger"
          onClick={onRemove}
          title="Remove"
        >
          ✕
        </button>
      </div>
      <small>Separate multiple values with commas</small>
    </div>
  );
}


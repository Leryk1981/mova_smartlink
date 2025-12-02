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
      enabled: true, // Default enabled
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
          <p>Ще немає правил. Додайте перше правило для початку роботи.</p>
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
        + Додати правило
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

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateDates = () => {
    const newErrors: Record<string, string> = {};
    
    if (rule.start_at && rule.end_at) {
      const start = new Date(rule.start_at);
      const end = new Date(rule.end_at);
      
      if (isNaN(start.getTime())) {
        newErrors.start_at = 'Некоректна дата початку';
      }
      if (isNaN(end.getTime())) {
        newErrors.end_at = 'Некоректна дата кінця';
      }
      if (!newErrors.start_at && !newErrors.end_at && start >= end) {
        newErrors.end_at = 'Дата кінця має бути пізніше за дату початку';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (field: 'start_at' | 'end_at', value: string) => {
    updateField(field, value || undefined);
    setTimeout(validateDates, 100);
  };

  const isDisabled = rule.enabled === false;
  const summary = rule.label || rule.target || `Правило ${index + 1}`;

  return (
    <div className={`rule-item ${expanded ? 'expanded' : ''} ${isDisabled ? 'disabled' : ''}`}>
      <div className="rule-header" onClick={onExpand}>
        <span className="rule-index">{index + 1}</span>
        {!rule.enabled && <span className="rule-badge disabled-badge">Вимкнено</span>}
        {rule.priority !== undefined && (
          <span className="rule-badge priority-badge">Пріоритет: {rule.priority}</span>
        )}
        <span className="rule-summary">{summary}</span>
        <div className="rule-actions">
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            title="Перемістити вгору"
          >
            ↑
          </button>
          <button
            className="btn-icon"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            title="Перемістити вниз"
          >
            ↓
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Видалити"
          >
            ✕
          </button>
        </div>
      </div>

      {expanded && (
        <div className="rule-body">
          {/* BLOCK 1: ОСНОВНЕ */}
          <div className="rule-block">
            <h4 className="block-title">
              <span className="block-icon">📋</span>
              Основне про правило
            </h4>
            
            <div className="form-group">
              <label htmlFor={`label_${rule.id}`}>Назва правила</label>
              <input
                id={`label_${rule.id}`}
                type="text"
                value={rule.label || ''}
                onChange={(e) => updateField('label', e.target.value)}
                placeholder="напр., Німеччина мобільні користувачі"
              />
              <small className="help-text">
                Використовується для зручності в інтерфейсі. Не впливає на роботу правила.
              </small>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rule.enabled !== false}
                  onChange={(e) => updateField('enabled', e.target.checked ? true : false)}
                />
                <span>Правило активне</span>
              </label>
              <small className="help-text">
                Якщо вимкнути, правило зберігається, але не використовується при маршрутизації.
              </small>
            </div>
          </div>

          {/* BLOCK 2: УМОВИ */}
          <div className="rule-block conditions-block">
            <h4 className="block-title">
              <span className="block-icon">🎯</span>
              Умови спрацювання (when)
            </h4>
            <p className="block-description">
              Правило спрацьовує, якщо <strong>ВСІ</strong> вказані умови відповідають контексту запиту.
            </p>
            
            <ConditionField
              label="Країна"
              value={rule.when.country}
              onChange={(v) => updateCondition('country', v)}
              onRemove={() => removeConditionField('country')}
              placeholder="напр., DE або DE,AT,CH"
              helpText="ISO код країни (2 літери). Для кількох країн розділіть комами."
            />

            <ConditionField
              label="Мова"
              value={rule.when.lang}
              onChange={(v) => updateCondition('lang', v)}
              onRemove={() => removeConditionField('lang')}
              placeholder="напр., en або en,de"
              helpText="ISO код мови (2 літери)."
            />

            <ConditionField
              label="Пристрій"
              value={rule.when.device}
              onChange={(v) => updateCondition('device', v)}
              onRemove={() => removeConditionField('device')}
              placeholder="mobile, tablet або desktop"
              helpText="Тип пристрою користувача."
            />

            {rule.when.utm && (
              <div className="utm-conditions">
                <h5>UTM-параметри</h5>
                
                <ConditionField
                  label="Source (utm_source)"
                  value={rule.when.utm.source}
                  onChange={(v) => updateCondition('utm', { ...rule.when.utm, source: v })}
                  onRemove={() => {
                    const { source, ...rest } = rule.when.utm!;
                    updateCondition('utm', Object.keys(rest).length > 0 ? rest : undefined);
                  }}
                  placeholder="напр., tiktok, facebook"
                />

                <ConditionField
                  label="Campaign (utm_campaign)"
                  value={rule.when.utm.campaign}
                  onChange={(v) => updateCondition('utm', { ...rule.when.utm, campaign: v })}
                  onRemove={() => {
                    const { campaign, ...rest } = rule.when.utm!;
                    updateCondition('utm', Object.keys(rest).length > 0 ? rest : undefined);
                  }}
                  placeholder="напр., spring_2026"
                />

                <ConditionField
                  label="Medium (utm_medium)"
                  value={rule.when.utm.medium}
                  onChange={(v) => updateCondition('utm', { ...rule.when.utm, medium: v })}
                  onRemove={() => {
                    const { medium, ...rest } = rule.when.utm!;
                    updateCondition('utm', Object.keys(rest).length > 0 ? rest : undefined);
                  }}
                  placeholder="напр., cpc, email"
                />
              </div>
            )}

            {!rule.when.utm && (
              <button
                className="btn btn-small"
                onClick={() => updateCondition('utm', {})}
              >
                + Додати UTM умови
              </button>
            )}
          </div>

          {/* BLOCK 3: ЦІЛЬ */}
          <div className="rule-block target-block">
            <h4 className="block-title">
              <span className="block-icon">🔗</span>
              Цільова сторінка (target)
            </h4>
            <p className="block-description">
              Сюди буде відправлятися користувач, якщо це правило спрацює.
            </p>
            
            <div className="form-group">
              <label htmlFor={`target_${rule.id}`}>URL цілі *</label>
              <input
                id={`target_${rule.id}`}
                type="url"
                value={rule.target}
                onChange={(e) => updateField('target', e.target.value)}
                placeholder="https://example.com/landing-page"
                required
              />
              <small className="help-text">
                Повний URL включаючи https://. Це обов'язкове поле.
              </small>
            </div>
          </div>

          {/* BLOCK 4: ЧАС ДІЇ */}
          <div className="rule-block time-block">
            <h4 className="block-title">
              <span className="block-icon">⏰</span>
              Час дії правила
            </h4>
            <p className="block-description">
              Обмежте час, коли правило активне. Залиште порожнім для постійної дії.
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`start_at_${rule.id}`}>
                  Початок дії
                  <span className="optional-badge">необов'язково</span>
                </label>
                <input
                  id={`start_at_${rule.id}`}
                  type="datetime-local"
                  value={rule.start_at ? formatDatetimeLocal(rule.start_at) : ''}
                  onChange={(e) => handleDateChange('start_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className={errors.start_at ? 'error' : ''}
                />
                {errors.start_at && <small className="error-text">{errors.start_at}</small>}
                <small className="help-text">
                  Правило почне діяти з цього моменту (включно).
                </small>
              </div>

              <div className="form-group">
                <label htmlFor={`end_at_${rule.id}`}>
                  Кінець дії
                  <span className="optional-badge">необов'язково</span>
                </label>
                <input
                  id={`end_at_${rule.id}`}
                  type="datetime-local"
                  value={rule.end_at ? formatDatetimeLocal(rule.end_at) : ''}
                  onChange={(e) => handleDateChange('end_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                  className={errors.end_at ? 'error' : ''}
                />
                {errors.end_at && <small className="error-text">{errors.end_at}</small>}
                <small className="help-text">
                  Правило припинить діяти після цього моменту.
                </small>
              </div>
            </div>

            <div className="time-hint">
              <strong>💡 Приклади використання:</strong>
              <ul>
                <li>Тільки start_at: акція починається з певної дати</li>
                <li>Тільки end_at: обмежена пропозиція до певної дати</li>
                <li>Обидва: flash sale або чорна п'ятниця</li>
              </ul>
            </div>
          </div>

          {/* BLOCK 5: ПРІОРИТЕТ І РОЗПОДІЛ ТРАФІКУ */}
          <div className="rule-block traffic-block">
            <h4 className="block-title">
              <span className="block-icon">⚡</span>
              Пріоритет і розподіл трафіку
            </h4>
            <p className="block-description">
              Керуйте порядком вибору правил та A/B тестуванням.
            </p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`priority_${rule.id}`}>
                  Пріоритет
                  <span className="optional-badge">необов'язково</span>
                </label>
                <input
                  id={`priority_${rule.id}`}
                  type="number"
                  min="0"
                  step="1"
                  value={rule.priority ?? ''}
                  onChange={(e) => updateField('priority', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="за замовчуванням: 1000"
                />
                <small className="help-text">
                  <strong>Менше число = вище пріоритет.</strong> Якщо кілька правил підходять, 
                  першим розглядається правило з найменшим пріоритетом.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor={`weight_${rule.id}`}>
                  Вага трафіку (A/B)
                  <span className="optional-badge">необов'язково</span>
                </label>
                <input
                  id={`weight_${rule.id}`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={rule.weight ?? ''}
                  onChange={(e) => updateField('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="за замовчуванням: 1"
                />
                <small className="help-text">
                  Якщо кілька правил підходять і мають вагу, трафік розподіляється пропорційно. 
                  Для A/B тесту 50/50 використовуйте вагу 1 для обох правил.
                </small>
              </div>
            </div>

            <div className="traffic-hint">
              <strong>🎯 Як це працює:</strong>
              <ol>
                <li>Фільтруються <strong>активні</strong> правила (enabled=true, час дії)</li>
                <li>Сортуються за <strong>пріоритетом</strong> (менше = вище)</li>
                <li>Вибираються всі правила, що <strong>підходять</strong> за умовами</li>
                <li>Якщо є <strong>ваги</strong> — випадковий вибір пропорційно вазі</li>
                <li>Якщо немає ваг — вибирається перше підходяще правило</li>
              </ol>
            </div>
          </div>
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
  helpText?: string;
}

function ConditionField({ label, value, onChange, onRemove, placeholder, helpText }: ConditionFieldProps) {
  if (value === undefined) {
    return (
      <div className="condition-field">
        <button
          className="btn btn-small"
          onClick={() => onChange('')}
        >
          + Додати {label}
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
          title="Видалити"
        >
          ✕
        </button>
      </div>
      {helpText && <small className="help-text">{helpText}</small>}
    </div>
  );
}

/**
 * Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
 */
function formatDatetimeLocal(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    
    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

import { useState, useEffect } from 'react';
import type { SmartlinkCore, ContextField } from '@mova/core-smartlink';
import { useSmartlink } from '../hooks/useSmartlink';
import { RulesEditor } from './RulesEditor';
import '../styles/SmartlinkEditor.css';

interface Props {
  linkId: string;
}

const CONTEXT_FIELDS: ContextField[] = [
  'country',
  'lang',
  'device',
  'utm.source',
  'utm.campaign',
  'utm.medium',
  'utm.term',
  'utm.content',
];

export function SmartlinkEditor({ linkId }: Props) {
  const { core, loading, error, save, saving } = useSmartlink(linkId);
  const [editedCore, setEditedCore] = useState<SmartlinkCore | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync editedCore when core loads
  useEffect(() => {
    if (core) {
      setEditedCore(core);
    }
  }, [core]);

  if (loading) {
    return <div className="loading">Loading smartlink...</div>;
  }

  if (!editedCore) {
    return <div className="error">No smartlink data available</div>;
  }

  const handleSave = async () => {
    try {
      await save(editedCore);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Error is handled in hook
    }
  };

  const updateField = <K extends keyof SmartlinkCore>(
    field: K,
    value: SmartlinkCore[K]
  ) => {
    setEditedCore({ ...editedCore, [field]: value });
  };

  const toggleContextField = (field: ContextField) => {
    const current = editedCore.context_shape || [];
    const updated = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field];
    updateField('context_shape', updated);
  };

  return (
    <div className="smartlink-editor">
      {error && <div className="alert alert-error">{error}</div>}
      {saveSuccess && <div className="alert alert-success">✓ Saved successfully!</div>}

      <section className="editor-section">
        <h2>Basic Info</h2>
        
        <div className="form-group">
          <label htmlFor="link_id">Link ID</label>
          <input
            id="link_id"
            type="text"
            value={editedCore.link_id}
            disabled
            className="disabled"
          />
          <small>Cannot be changed after creation</small>
        </div>

        <div className="form-group">
          <label htmlFor="purpose">Purpose</label>
          <input
            id="purpose"
            type="text"
            value={editedCore.purpose || ''}
            onChange={(e) => updateField('purpose', e.target.value)}
            placeholder="e.g., Spring sale 2026 campaign"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={editedCore.status}
            onChange={(e) => updateField('status', e.target.value as any)}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fallback_target">Fallback Target</label>
          <input
            id="fallback_target"
            type="url"
            value={editedCore.fallback_target}
            onChange={(e) => updateField('fallback_target', e.target.value)}
            placeholder="https://example.com/fallback"
            required
          />
          <small>Used when no rules match</small>
        </div>
      </section>

      <section className="editor-section">
        <h2>Context Shape</h2>
        <p className="section-description">
          Select which context fields are used in your rules (helps with validation)
        </p>
        
        <div className="context-fields">
          {CONTEXT_FIELDS.map((field) => (
            <label key={field} className="checkbox-label">
              <input
                type="checkbox"
                checked={(editedCore.context_shape || []).includes(field)}
                onChange={() => toggleContextField(field)}
              />
              <code>{field}</code>
            </label>
          ))}
        </div>
      </section>

      <section className="editor-section">
        <h2>Routing Rules</h2>
        <p className="section-description">
          Rules are evaluated in order. First match wins. Use priority field to override order.
        </p>
        
        <RulesEditor
          rules={editedCore.rules}
          onChange={(rules) => updateField('rules', rules)}
        />
      </section>

      <div className="editor-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || !editedCore.fallback_target}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {editedCore.meta && (
        <div className="meta-info">
          <small>
            Version: {editedCore.meta.version} | 
            Updated: {editedCore.meta.updated_at ? new Date(editedCore.meta.updated_at).toLocaleString() : 'N/A'}
          </small>
        </div>
      )}
    </div>
  );
}


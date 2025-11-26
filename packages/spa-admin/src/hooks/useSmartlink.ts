import { useState, useEffect } from 'react';
import type { SmartlinkCore } from '@mova/core-smartlink';

interface UseSmartlinkResult {
  core: SmartlinkCore | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  save: (core: SmartlinkCore) => Promise<void>;
  saving: boolean;
}

/**
 * Hook to fetch and update SmartlinkCore from API
 */
export function useSmartlink(linkId: string): UseSmartlinkResult {
  const [core, setCore] = useState<SmartlinkCore | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCore = async () => {
    if (!linkId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/smartlinks/${linkId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Smartlink not found. Create a new one by saving.');
          setCore(createEmptyCore(linkId));
        } else {
          throw new Error(`Failed to load: ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        setCore(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load smartlink');
      setCore(createEmptyCore(linkId));
    } finally {
      setLoading(false);
    }
  };

  const save = async (updatedCore: SmartlinkCore) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/smartlinks/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCore),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      const savedCore = await response.json();
      setCore(savedCore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save smartlink');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCore();
  }, [linkId]);

  return {
    core,
    loading,
    error,
    refetch: fetchCore,
    save,
    saving,
  };
}

/**
 * Create empty SmartlinkCore for new link
 */
function createEmptyCore(linkId: string): SmartlinkCore {
  return {
    link_id: linkId,
    status: 'draft',
    purpose: '',
    context_shape: [],
    rules: [],
    fallback_target: '',
    meta: {
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'admin',
      updated_by: 'admin',
    },
  };
}


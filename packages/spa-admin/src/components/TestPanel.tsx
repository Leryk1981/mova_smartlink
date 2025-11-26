import { useState } from 'react';
import '../styles/TestPanel.css';

interface Props {
  linkId: string;
}

interface TestContext {
  country: string;
  lang: string;
  device: string;
  utm_source: string;
  utm_campaign: string;
  utm_medium: string;
}

interface DebugResponse {
  link_id: string;
  context: any;
  decision: {
    target: string;
    branch: string;
    rule_index: number;
  };
  final_url: string;
  timestamp: string;
}

export function TestPanel({ linkId }: Props) {
  const [context, setContext] = useState<TestContext>({
    country: 'DE',
    lang: 'de',
    device: 'mobile',
    utm_source: 'tiktok',
    utm_campaign: '',
    utm_medium: '',
  });

  const [result, setResult] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const updateContext = (field: keyof TestContext, value: string) => {
    setContext({ ...context, [field]: value });
  };

  const runTest = async () => {
    setTesting(true);
    setError(null);
    setResult(null);

    try {
      // Build URL with query params
      const params = new URLSearchParams();
      params.set('debug', '1');
      
      if (context.utm_source) params.set('utm_source', context.utm_source);
      if (context.utm_campaign) params.set('utm_campaign', context.utm_campaign);
      if (context.utm_medium) params.set('utm_medium', context.utm_medium);

      const url = `/s/${linkId}?${params}`;

      // Simulate headers via custom header (not all can be set in fetch)
      const headers: HeadersInit = {};
      if (context.country) {
        // Note: In real worker, this comes from request.cf.country
        // For testing, we can document what would happen
        headers['CF-IPCountry'] = context.country;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Test failed');
      }

      const data: DebugResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const buildPublicUrl = () => {
    const params = new URLSearchParams();
    if (context.utm_source) params.set('utm_source', context.utm_source);
    if (context.utm_campaign) params.set('utm_campaign', context.utm_campaign);
    if (context.utm_medium) params.set('utm_medium', context.utm_medium);
    
    return `/s/${linkId}${params.toString() ? '?' + params : ''}`;
  };

  return (
    <div className="test-panel">
      <section className="test-section">
        <h2>Test Context</h2>
        <p className="section-description">
          Simulate different user contexts to see which rule would match
        </p>

        <div className="test-form">
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              value={context.country}
              onChange={(e) => updateContext('country', e.target.value)}
              placeholder="e.g., DE, US, FR"
            />
          </div>

          <div className="form-group">
            <label>Language</label>
            <input
              type="text"
              value={context.lang}
              onChange={(e) => updateContext('lang', e.target.value)}
              placeholder="e.g., en, de, fr"
            />
          </div>

          <div className="form-group">
            <label>Device</label>
            <select
              value={context.device}
              onChange={(e) => updateContext('device', e.target.value)}
            >
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>

          <div className="form-group">
            <label>UTM Source</label>
            <input
              type="text"
              value={context.utm_source}
              onChange={(e) => updateContext('utm_source', e.target.value)}
              placeholder="e.g., tiktok, email, google"
            />
          </div>

          <div className="form-group">
            <label>UTM Campaign</label>
            <input
              type="text"
              value={context.utm_campaign}
              onChange={(e) => updateContext('utm_campaign', e.target.value)}
              placeholder="e.g., spring_2026"
            />
          </div>

          <div className="form-group">
            <label>UTM Medium</label>
            <input
              type="text"
              value={context.utm_medium}
              onChange={(e) => updateContext('utm_medium', e.target.value)}
              placeholder="e.g., cpc, email"
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={runTest}
            disabled={testing}
          >
            {testing ? 'Testing...' : '🧪 Run Test'}
          </button>
        </div>
      </section>

      {error && (
        <section className="test-section">
          <div className="alert alert-error">{error}</div>
        </section>
      )}

      {result && (
        <section className="test-section">
          <h2>Test Result</h2>
          
          <div className="result-card">
            <div className="result-row">
              <strong>Matched Branch:</strong>
              <code className="branch-name">{result.decision.branch}</code>
            </div>
            
            <div className="result-row">
              <strong>Rule Index:</strong>
              <code>{result.decision.rule_index === -1 ? 'fallback' : result.decision.rule_index}</code>
            </div>
            
            <div className="result-row">
              <strong>Target URL:</strong>
              <a href={result.final_url} target="_blank" rel="noopener noreferrer">
                {result.final_url}
              </a>
            </div>
          </div>

          <details className="debug-details">
            <summary>Full Debug Response</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </section>
      )}

      <section className="test-section">
        <h2>Public URL</h2>
        <p className="section-description">
          Share this URL to test real redirects (without debug mode)
        </p>
        
        <div className="url-display">
          <code>{buildPublicUrl()}</code>
          <button
            className="btn btn-small"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin + buildPublicUrl());
            }}
          >
            Copy
          </button>
        </div>
      </section>
    </div>
  );
}


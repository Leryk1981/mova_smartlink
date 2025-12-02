/**
 * Demo Resolve - Interactive demo
 */

import { useState } from 'react';
import { demoResolve, getDemoConfigs, type DemoResolveInput, type DemoResolveResult } from '../api/smartlinkApi';

export function DemoResolve() {
  const [smartlinkId, setSmartlinkId] = useState('spring_sale_2026');
  const [country, setCountry] = useState('DE');
  const [device, setDevice] = useState<'mobile' | 'desktop' | 'tablet'>('mobile');
  const [utmSource, setUtmSource] = useState('tiktok');
  const [utmCampaign, setUtmCampaign] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResolveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const demoConfigs = getDemoConfigs();

  const handleResolve = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: DemoResolveInput = {
        smartlink_id: smartlinkId,
        country: country || undefined,
        device,
        utm_source: utmSource || undefined,
        utm_campaign: utmCampaign || undefined,
      };

      const res = await demoResolve(input);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="demo-resolve" id="demo">
      <div className="container">
        <h2 className="section-title">Спробуй просто зараз</h2>
        <p className="section-subtitle">Змоделюй клік і подивись, куди SmartLink відправить користувача</p>

        <div className="demo-container">
          {/* Input Panel */}
          <div className="demo-panel">
            <h3 className="panel-title">🔧 Параметри кліку</h3>

            <div className="form-group">
              <label>SmartLink ID</label>
              <select value={smartlinkId} onChange={(e) => setSmartlinkId(e.target.value)}>
                {demoConfigs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>
              <span className="form-hint">
                {demoConfigs.find((c) => c.id === smartlinkId)?.description}
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Країна</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="PL">🇵🇱 Poland</option>
                  <option value="US">🇺🇸 USA</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="UA">🇺🇦 Ukraine</option>
                  <option value="">🌍 Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Пристрій</label>
                <select value={device} onChange={(e) => setDevice(e.target.value as any)}>
                  <option value="mobile">📱 Mobile</option>
                  <option value="desktop">💻 Desktop</option>
                  <option value="tablet">📲 Tablet</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>UTM Source</label>
                <select value={utmSource} onChange={(e) => setUtmSource(e.target.value)}>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="email">Email</option>
                  <option value="google">Google</option>
                  <option value="">Direct</option>
                </select>
              </div>

              <div className="form-group">
                <label>UTM Campaign (опційно)</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="spring_2026"
                />
              </div>
            </div>

            <button className="demo-button" onClick={handleResolve} disabled={loading}>
              {loading ? '⏳ Рахуємо...' : '🚀 Змоделювати перехід'}
            </button>
          </div>

          {/* Result Panel */}
          <div className="demo-panel">
            <h3 className="panel-title">📊 Результат</h3>

            {!result && !error && !loading && (
              <div className="demo-placeholder">
                <p>Обери параметри та натисни кнопку →</p>
              </div>
            )}

            {loading && (
              <div className="demo-loading">
                <div className="spinner"></div>
                <p>Надсилаємо запит на worker...</p>
              </div>
            )}

            {error && (
              <div className="demo-error">
                <h4>❌ Ошибка</h4>
                <p>{error}</p>
                <details>
                  <summary>Що робити?</summary>
                  <p>
                    Перевір, що Worker запущений локально на <code>localhost:8787</code> або вкажи
                    коректний URL у змінній оточення <code>VITE_WORKER_URL</code>.
                  </p>
                </details>
              </div>
            )}

            {result && (
              <div className={`demo-result outcome-${result.outcome.toLowerCase()}`}>
                <div className="result-header">
                  <span className="result-status">{getOutcomeEmoji(result.outcome)}</span>
                  <span className="result-outcome">{result.outcome}</span>
                </div>

                {result.resolved_url && (
                  <div className="result-row">
                    <span className="result-label">Цільовий URL:</span>
                    <a
                      href={result.resolved_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-url"
                    >
                      {result.resolved_url}
                    </a>
                  </div>
                )}

                {result.resolved_target_id && (
                  <div className="result-row">
                    <span className="result-label">Target ID:</span>
                    <code className="result-code">{result.resolved_target_id}</code>
                  </div>
                )}

                {result.reason && (
                  <div className="result-row">
                    <span className="result-label">Причина:</span>
                    <span className="result-text">{result.reason}</span>
                  </div>
                )}

                {result.matched_conditions && (
                  <div className="result-row">
                    <span className="result-label">Спрацювали умови:</span>
                    <div className="result-conditions">
                      {result.matched_conditions.country && <span className="badge-small">Country</span>}
                      {result.matched_conditions.device && <span className="badge-small">Device</span>}
                      {result.matched_conditions.utm && <span className="badge-small">UTM</span>}
                      {result.matched_conditions.language && <span className="badge-small">Language</span>}
                    </div>
                  </div>
                )}

                {result.latency_ms !== undefined && (
                  <div className="result-row">
                    <span className="result-label">Latency:</span>
                    <span className="result-metric">{result.latency_ms.toFixed(2)} ms</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getOutcomeEmoji(outcome: string): string {
  switch (outcome) {
    case 'OK':
      return '✅';
    case 'DEFAULT_USED':
      return '🔄';
    case 'NO_MATCH':
      return '❓';
    case 'ERROR':
      return '❌';
    case 'EXPIRED':
      return '⏱️';
    case 'DISABLED':
      return '🚫';
    default:
      return '⚠️';
  }
}

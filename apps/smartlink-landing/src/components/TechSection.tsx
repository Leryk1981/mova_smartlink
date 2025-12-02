/**
 * Tech Section - For technical audience
 */

export function TechSection() {
  return (
    <section className="tech-section">
      <div className="container">
        <h2 className="section-title">Для тих, хто хоче зрозуміти глибше</h2>

        <div className="tech-content">
          <p className="tech-intro">SmartLink побудований на <strong>MOVA 4.0</strong> — відкритому data-first контракті:</p>

          <ul className="tech-list">
            <li>
              <strong>ds.*</strong> — структури даних (config, click, result, stats)
            </li>
            <li>
              <strong>env.*</strong> — конверти дій (resolve, stats_get)
            </li>
            <li>
              <strong>ds.episode_*</strong> — епізоди (генетичний шар для навчання)
            </li>
          </ul>

          <div className="tech-highlights">
            <div className="tech-highlight">
              <h4>🛠️ Self-hosted</h4>
              <p>Увесь код виконання — в Cloudflare Worker. Можна розгорнути власний.</p>
            </div>

            <div className="tech-highlight">
              <h4>📦 Ваші дані</h4>
              <p>Конфігурація та епізоди — ваш актив, не чорна скринька SaaS.</p>
            </div>

            <div className="tech-highlight">
              <h4>🔍 Прозорість</h4>
              <p>Усі схеми відкриті, валідація на JSON Schema 2020-12.</p>
            </div>
          </div>

          <div className="tech-links">
            <a
              href="https://github.com/your-repo/mova_smartlink"
              className="tech-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              📂 GitHub репозиторій
            </a>
            <a
              href="/docs/SMARTLINK_SPEC_4.0.md"
              className="tech-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              📖 Специфікація MOVA 4.0
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

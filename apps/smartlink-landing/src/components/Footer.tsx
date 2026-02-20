/**
 * Footer - CTA and links
 */

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-cta">
            <h3>Хочеш використати SmartLink у своєму проєкті?</h3>
            <p>
              Зараз SmartLink на етапі <strong>early adopters</strong>.
              <br />
              Якщо хочеш запустити його в себе — напиши, і ми допоможемо.
            </p>
            <div className="footer-buttons">
              <a
                href="https://github.com/your-repo/mova_smartlink"
                className="footer-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                📂 GitHub
              </a>
              <a href="mailto:hello@example.com" className="footer-button">
                ✉️ Звʼязатися
              </a>
            </div>
          </div>

          <div className="footer-info">
            <div className="footer-links">
              <a href="/docs/SMARTLINK_SPEC_5.0.md" target="_blank" rel="noopener noreferrer">
                Документація
              </a>
              <a href="https://github.com/your-repo/mova_smartlink" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="/docs/TASKS_SMARTLINK_V1.md" target="_blank" rel="noopener noreferrer">
                Завдання та Roadmap
              </a>
            </div>

            <div className="footer-credits">
              <p>
                Зроблено на <strong>MOVA 5.0</strong> · Розгорнуто на <strong>Cloudflare</strong>
              </p>
              <p className="footer-version">SmartLink v2.0.0 (MOVA 5.0.0 compatibility)</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

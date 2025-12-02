import '../styles/Hero.css';

interface HeroProps {
  hasSmartlink: boolean;
  onCreateNew?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export function Hero({ hasSmartlink, onCreateNew, onSave, isSaving }: HeroProps) {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-icon">🔗</span>
          Smartlink: одне посилання — різні цільові сторінки
        </h1>
        
        <p className="hero-description">
          Керуйте маршрутизацією трафіку без зміни посилань у рекламі.
          Smartlink автоматично відправляє користувачів на потрібну сторінку залежно від контексту.
        </p>

        <ul className="hero-features">
          <li>
            <span className="feature-icon">🌍</span>
            <span>Розподіляйте трафік за країною, мовою, пристроєм та UTM-мітками</span>
          </li>
          <li>
            <span className="feature-icon">⏰</span>
            <span>Запускайте акції з обмеженим часом дії (flash sales, чорна п'ятниця)</span>
          </li>
          <li>
            <span className="feature-icon">🎯</span>
            <span>Тестуйте кілька лендингів (A/B тестування) всередині одного smartlink</span>
          </li>
        </ul>

        <div className="hero-actions">
          {!hasSmartlink && onCreateNew && (
            <button 
              className="btn btn-primary btn-large"
              onClick={onCreateNew}
            >
              🚀 Створити новий Smartlink
            </button>
          )}
          
          {hasSmartlink && onSave && (
            <button 
              className="btn btn-primary btn-large"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? '💾 Збереження...' : '💾 Зберегти зміни'}
            </button>
          )}
        </div>

        <div className="hero-hint">
          <p>
            💡 <strong>Порада:</strong> Почніть з простого правила (наприклад, за країною), 
            потім додайте складніші умови та A/B тестування.
          </p>
        </div>
      </div>
    </div>
  );
}


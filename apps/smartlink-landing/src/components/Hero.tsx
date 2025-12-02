/**
 * Hero Section - First impression
 */

export function Hero() {
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title">
          Один смартлінк замість десяти
          <br />
          <span className="hero-highlight">Розумний трафік без коду</span>
        </h1>

        <p className="hero-subtitle">
          SmartLink — розумна маршрутизація для e-commerce, контентмейкерів та маркетологів.
          <br />
          Одна лінка підлаштовується під країну, пристрій, джерело трафіку та час.
        </p>

        <button className="hero-cta" onClick={scrollToDemo}>
          Спробувати демо →
        </button>

        <div className="hero-badges">
          <span className="badge">🚀 MOVA 4.0</span>
          <span className="badge">⚡ Edge-first</span>
          <span className="badge">🔒 Відкрита схема</span>
        </div>
      </div>
    </section>
  );
}

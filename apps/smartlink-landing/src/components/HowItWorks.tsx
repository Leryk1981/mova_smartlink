/**
 * How It Works Section - 3-step explanation
 */

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Опиши конфіг',
      description: 'Створи smartlink, додай цілі та правила маршрутизації (країна, пристрій, UTM).',
    },
    {
      number: '2',
      title: 'Розмісти лінк',
      description: 'Один URL у соцмережах, листах та рекламі.',
    },
    {
      number: '3',
      title: 'Дивись, що відбувається',
      description: 'Отримуй статистику по цілях, джерелах та умовах спрацьовування.',
    },
  ];

  return (
    <section className="how-it-works">
      <div className="container">
        <h2 className="section-title">Як це працює</h2>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="tech-note">
          <p>
            <strong>Для технарів:</strong> Конфігурація — звичайний JSON за відкритою схемою.
            Ви завжди бачите, як саме налаштований ваш smartlink.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Problem Section - Show pain points
 */

export function ProblemSection() {
  const problems = [
    {
      icon: '🔗',
      title: 'Хаос з лінками',
      description: 'Різні лінки для кожної країни, платформи, кампанії — складно керувати.',
    },
    {
      icon: '🎲',
      title: 'A/B без костилів',
      description: 'Тестувати варіанти лендингів доводиться через складні сервіси або вручну.',
    },
    {
      icon: '📱',
      title: 'Один bio link',
      description: 'Instagram, TikTok, YouTube — всюди одна лінка, але веде розумно.',
    },
    {
      icon: '📊',
      title: 'Статистика всліпу',
      description: 'Незрозуміло, звідки прийшли користувачі і куди їх справді відправили.',
    },
  ];

  return (
    <section className="problem-section">
      <div className="container">
        <h2 className="section-title">Що не так із звичайними лінками?</h2>

        <div className="problems-grid">
          {problems.map((problem, index) => (
            <div key={index} className="problem-card">
              <div className="problem-icon">{problem.icon}</div>
              <h3 className="problem-title">{problem.title}</h3>
              <p className="problem-description">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

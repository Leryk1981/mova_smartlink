/**
 * SmartLink Landing Page
 * Main App Component
 */

import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { HowItWorks } from './components/HowItWorks';
import { DemoResolve } from './components/DemoResolve';
import { TechSection } from './components/TechSection';
import { Footer } from './components/Footer';
import './styles/main.css';

function App() {
  return (
    <div className="app">
      <header className="brand-bar">
        <div className="brand-logo" aria-hidden="true" />
        <span className="brand-text">MOVA</span>
      </header>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <DemoResolve />
      <TechSection />
      <Footer />
    </div>
  );
}

export default App;

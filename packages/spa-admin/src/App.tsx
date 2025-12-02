import { useState } from 'react';
import { Hero } from './components/Hero';
import { SmartlinkEditor } from './components/SmartlinkEditor';
import { TestPanel } from './components/TestPanel';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'test'>('editor');
  const [linkId, setLinkId] = useState('spring_sale_2026');
  const [triggerSave, setTriggerSave] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚡ Smartlink Admin</h1>
        <p className="subtitle">MOVA Smartlink v1 - Edge Routing Management</p>
      </header>

      <div className="link-id-selector">
        <label htmlFor="linkId">Link ID:</label>
        <input
          id="linkId"
          type="text"
          value={linkId}
          onChange={(e) => setLinkId(e.target.value)}
          placeholder="e.g., spring_sale_2026"
        />
      </div>

      <nav className="tabs">
        <button
          className={activeTab === 'editor' ? 'active' : ''}
          onClick={() => setActiveTab('editor')}
        >
          📝 Editor
        </button>
        <button
          className={activeTab === 'test' ? 'active' : ''}
          onClick={() => setActiveTab('test')}
        >
          🧪 Test
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'editor' && (
          <>
            <Hero 
              hasSmartlink={true}
              onSave={() => setTriggerSave(prev => prev + 1)}
            />
            <SmartlinkEditor linkId={linkId} triggerSave={triggerSave} />
          </>
        )}
        {activeTab === 'test' && <TestPanel linkId={linkId} />}
      </main>

      <footer className="app-footer">
        <p>MOVA Smartlink Atom v1 | <a href="https://github.com/mova" target="_blank" rel="noopener noreferrer">Documentation</a></p>
      </footer>
    </div>
  );
}

export default App;


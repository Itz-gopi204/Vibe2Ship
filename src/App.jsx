import React, { useState } from 'react';
import { IssueProvider } from './context/IssueContext';
import Dashboard from './components/Dashboard';
import IssueMap from './components/IssueMap';
import ReportIssue from './components/ReportIssue';
import Leaderboard from './components/Leaderboard';
import Settings from './components/Settings';
import { 
  ShieldAlert, LayoutDashboard, Map, 
  PlusCircle, Trophy, Settings as SettingsIcon 
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return (
          <div style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
            <IssueMap />
          </div>
        );
      case 'report':
        return <ReportIssue setActiveTab={setActiveTab} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {/* Header Navigation Bar */}
      <header className="navbar glass">
        <div className="nav-logo">
          <ShieldAlert size={28} style={{ color: 'var(--primary)' }} />
          <span>COMMUNITY HERO</span>
        </div>
        <nav className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={18} />
            <span>Issue Map</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <PlusCircle size={18} />
            <span>Report Issue</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={18} />
            <span>Leaderboard</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '24px 24px 40px 24px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        {renderContent()}
      </main>
    </>
  );
}

function App() {
  return (
    <IssueProvider>
      <AppContent />
    </IssueProvider>
  );
}

export default App;

import React, { useState, useContext } from 'react';
import { IssueProvider, IssueContext } from './context/IssueContext';
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
  const { role, setRole } = useContext(IssueContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setActiveTab('dashboard');
  };

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

        {/* Role Selector pill switch */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '20px', 
          padding: '2px', 
          marginLeft: 'auto', 
          marginRight: '20px',
          alignItems: 'center'
        }}>
          <button 
            type="button"
            onClick={() => handleRoleChange('citizen')}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              background: role === 'citizen' ? 'var(--primary)' : 'transparent',
              color: role === 'citizen' ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.3s ease'
            }}
          >
            Citizen
          </button>
          <button 
            type="button"
            onClick={() => handleRoleChange('worker')}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              background: role === 'worker' ? 'var(--secondary)' : 'transparent',
              color: role === 'worker' ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.3s ease'
            }}
          >
            Field Worker
          </button>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>{role === 'worker' ? 'Task List' : 'Dashboard'}</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={18} />
            <span>Issue Map</span>
          </button>
          
          {role === 'citizen' && (
            <>
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
            </>
          )}
          
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

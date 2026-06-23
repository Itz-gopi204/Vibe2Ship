import React, { useContext, useState } from 'react';
import { IssueContext } from '../context/IssueContext';
import { Key, ShieldCheck, HelpCircle } from 'lucide-react';

const Settings = () => {
  const { geminiKey, setGeminiKey } = useContext(IssueContext);
  const [tempKey, setTempKey] = useState(geminiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setGeminiKey(tempKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-container glass">
      <h2 className="section-title" style={{ marginBottom: '8px' }}>
        <Key className="nav-icon" style={{ color: 'var(--primary)' }} />
        AI Co-Pilot Settings
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
        Configure your Google AI Studio credentials to enable live multimodal analysis of civic issues.
      </p>

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="api-key">Gemini API Key</label>
          <input
            id="api-key"
            type="password"
            className="form-input"
            placeholder="AIzaSy..."
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Keys are saved locally in your browser's <code>localStorage</code> and never transmitted elsewhere.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          <button type="submit" className="btn-primary">
            Save Configuration
          </button>
          {saved && (
            <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} /> Settings Applied!
            </span>
          )}
        </div>
      </form>

      <hr style={{ borderColor: 'var(--card-border)', margin: '24px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          <HelpCircle size={18} style={{ color: 'var(--secondary)' }} />
          Configuration Guide
        </h4>
        
        <div style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--card-border)', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>1. Obtain a Free Key:</strong> Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Google AI Studio</a> and click on <strong>Get API Key</strong>.
          </p>
          <p style={{ marginBottom: '12px' }}>
            <strong>2. Simulation Mode:</strong> If you leave the API key blank, the application will run in <strong>Simulation Mode</strong>. It will automatically detect keywords in image filenames (e.g. <code>pothole.jpg</code>, <code>trash.png</code>, <code>leak.png</code>) to trigger corresponding mock AI classifications.
          </p>
          <p>
            <strong>3. Multimodal Scans:</strong> With a valid API key, Gemini will live-scan any uploaded image file (potholes, garbage piles, electrical faults) to fill in description, severity, and correct department categories automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

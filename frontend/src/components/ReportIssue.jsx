import React, { useState, useContext, useRef, useEffect } from 'react';
import { IssueContext } from '../context/IssueContext';
import { analyzeIssueImage, runAgenticWorkflow } from '../utils/gemini';
import IssueMap from './IssueMap';

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '');
const apiFetch = (path, options = {}) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${API_BASE_URL}${normalizedPath}`, options);
};
import { 
  UploadCloud, AlertTriangle, Cpu, Globe, 
  MapPin, CheckCircle2, ChevronRight, X 
} from 'lucide-react';

const ReportIssue = ({ setActiveTab }) => {
  const { addIssue, geminiKey, isBackendOnline } = useContext(IssueContext);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const fileInputRef = useRef(null);

  // AI & Workflow Loading States
  // AI & Workflow Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const consoleEndRef = useRef(null);

  // Form Fields (Pre-filled by AI)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Road Damage');
  const [severity, setSeverity] = useState('Medium');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(12.9344);
  const [longitude, setLongitude] = useState(77.6192);
  const [department, setDepartment] = useState('');
  const [dispatchOrder, setDispatchOrder] = useState('');
  const [priorityScore, setPriorityScore] = useState(0.0);
  const [estimatedCompletion, setEstimatedCompletion] = useState('');

  // Flow step control: 'upload' -> 'analyzing' -> 'review'
  const [flowStep, setFlowStep] = useState('upload');

  // Auto Scroll Console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Handle Drag & Drop Events
  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const videoCheck = file.type.startsWith('video/');
    setIsVideo(videoCheck);
    setPreviewUrl(URL.createObjectURL(file));
    setFlowStep('analyzing');
    triggerAIWorkflow(file);
  };

  // Run Gemini & Agent logs
  const triggerAIWorkflow = async (file) => {
    setIsAnalyzing(true);
    setConsoleLogs([]);

    // 1. Initial log
    addLog('Analyzing file upload visual arrays...', 'info');

    if (isBackendOnline) {
      try {
        addLog('Uploading evidence payload to FastAPI AI Civic agent core...', 'info');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiFetch('/api/analyze', {
          method: 'POST',
          headers: geminiKey ? { 'X-Gemini-Key': geminiKey } : {},
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Stream logs back to console with realistic speed
          for (let i = 0; i < result.logs.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
            addLog(result.logs[i].text, result.logs[i].type);
          }
          
          setTitle(result.title);
          setCategory(result.category);
          setSeverity(result.severity);
          setDescription(result.description);
          setLatitude(result.latitude);
          setLongitude(result.longitude);
          setDepartment(result.department || '');
          setDispatchOrder(result.dispatch_order || '');
          setPriorityScore(result.priorityScore ?? 0.0);
          setEstimatedCompletion(result.estimatedCompletion || '');
          
          setIsAnalyzing(false);
          setTimeout(() => {
            setFlowStep('review');
          }, 1000);
          return;
        } else {
          addLog('FastAPI analyzer returned error response. Falling back to local simulation...', 'warn');
        }
      } catch (err) {
        addLog('Network error connecting to FastAPI analyzer. Falling back to local simulation...', 'warn');
      }
    }

    // Local Fallback (Simulation / client-side Direct API call)
    let aiResults = null;
    const aiPromise = analyzeIssueImage(file, geminiKey).then(res => {
      aiResults = res;
    });

    // Run the step-by-step CLI simulator
    await runAgenticWorkflow('General Scan', (newLog) => {
      addLog(newLog.text, newLog.type);
    });

    // Wait for AI Analysis to complete if it hasn't
    await aiPromise;

    if (aiResults) {
      addLog(`Gemini successfully extracted data details.`, 'success');
      setTitle(aiResults.title || 'Civic Issue Report');
      setCategory(aiResults.category || 'Road Damage');
      setSeverity(aiResults.severity || 'Medium');
      setDescription(aiResults.description || '');
      setDepartment(aiResults.department || 'General Civic Infrastructure Command');
      setDispatchOrder(aiResults.dispatch_order || 'Inspect site visual attachment and repair the hazard immediately.');
      setPriorityScore(aiResults.priorityScore ?? 0.0);
      setEstimatedCompletion(aiResults.estimatedCompletion || '');
    } else {
      addLog('Failed to communicate with AI core. Falling back to default heuristics.', 'warn');
      // Assign default values
      setTitle('Identified Infrastructure Damage');
      setCategory('Road Damage');
      setSeverity('High');
      setDescription('Civic infrastructure requires repair. Please inspect the visual report attachment.');
      setDepartment('General Civic Infrastructure Command');
      setDispatchOrder('Inspect site visual attachment and repair the hazard immediately.');
    }

    // Auto-generate coordinates centered in Koramangala
    const latOffset = (Math.random() - 0.5) * 0.015;
    const lngOffset = (Math.random() - 0.5) * 0.015;
    const mockLat = 12.9344 + latOffset;
    const mockLng = 77.6192 + lngOffset;
    setLatitude(mockLat);
    setLongitude(mockLng);

    addLog(`Simulated GPS tagged near Koramangala: [${mockLat.toFixed(5)}, ${mockLng.toFixed(5)}]`, 'info');
    addLog('Pre-filling form elements. Ready for administrator review.', 'success');

    setIsAnalyzing(false);
    setTimeout(() => {
      setFlowStep('review');
    }, 1000);
  };

  const addLog = (text, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [...prev, { text, type, time }]);
  };

  const handleSelectLocation = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    addLog(`Location override set to coordinates: [${lat.toFixed(5)}, [${lng.toFixed(5)}]`, 'accent');
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFlowStep('upload');
    setConsoleLogs([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const issueData = {
      title,
      description,
      category,
      severity,
      latitude,
      longitude,
      image: previewUrl || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600',
      isVideo,
      reporter: 'Aarav Patel (You)',
      priorityScore,
      estimatedCompletion,
      history: [
        { 
          status: 'Reported', 
          message: `Issue reported by Aarav Patel. Gemini AI routed ticket to ${department || 'General Civic Infrastructure Command'}.`, 
          time: new Date().toISOString() 
        },
        { 
          status: 'Work Assigned', 
          message: `Automated dispatch order drafted: ${dispatchOrder || 'Inspect site visual attachment and repair the hazard immediately.'}`, 
          time: new Date().toISOString() 
        }
      ]
    };

    addIssue(issueData);
    setActiveTab('dashboard');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 className="section-title">
        <Cpu className="nav-icon" style={{ color: 'var(--primary)' }} />
        AI Dispatch & Report Console
      </h2>

      {flowStep === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div 
            className={`upload-card glass ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{ flex: 1, minHeight: '350px' }}
          >
            <UploadCloud size={48} style={{ color: 'var(--secondary)', marginBottom: '12px' }} />
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }}>Drag & drop issue photo or video here</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Supports PNG, JPG, JPEG, MP4 formats</p>
            <button className="btn-primary" style={{ marginTop: '16px', pointerEvents: 'none' }}>
              Browse Files
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*,video/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="glass" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <AlertTriangle size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              <strong>AI Analysis enabled:</strong> Once you upload an image, the civic agent will automatically classify the category, evaluate the severity, write a detailed title and description, and suggest a location pin.
            </div>
          </div>
        </div>
      )}

      {flowStep === 'analyzing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '16px' }}>
              <div style={{
                position: 'absolute',
                border: '4px solid var(--card-border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                width: '100%',
                height: '100%',
                animation: 'spin 1s infinite linear'
              }}></div>
            </div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>AI Civic Agent Executing...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Scanning image nodes and checking city routing tables</p>
          </div>

          <div className="console-box" ref={consoleEndRef} style={{ flex: 1, minHeight: '300px' }}>
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="console-line">
                <span className="console-timestamp">[{log.time}]</span>
                <span className={`console-text console-${log.type}`}>{log.text}</span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        </div>
      )}

      {flowStep === 'review' && (
        <form onSubmit={handleSubmit} className="report-layout" style={{ flex: 1 }}>
          {/* Left Hand: Image Review & Console Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
            <div className="upload-preview-container">
              {isVideo ? (
                <video src={previewUrl} controls className="upload-preview" />
              ) : (
                <img src={previewUrl} alt="Preview" className="upload-preview" />
              )}
              <button type="button" className="upload-remove-btn" onClick={handleRemoveImage}>
                <X size={18} />
              </button>
            </div>

            {/* Micro map editor */}
            <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} style={{ color: 'var(--secondary)' }} />
                  Adjust Geotag Coordinates
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
                </span>
              </div>
              <div style={{ height: '200px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                <IssueMap 
                  isReportingMode={true} 
                  onSelectLocation={handleSelectLocation}
                  selectedLocation={{ latitude, longitude }}
                />
              </div>
            </div>
          </div>

          {/* Right Hand: Pre-filled Form Fields */}
          <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
              <CheckCircle2 size={20} />
              <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>AI Pre-fill Completed</span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Issue Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Category</label>
                <select 
                  className="form-input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <option value="Road Damage">Road Damage</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Public Utilities">Public Utilities</option>
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Other">Other / Infrastructure</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Estimated Severity</label>
                <select 
                  className="form-input" 
                  value={severity} 
                  onChange={(e) => setSeverity(e.target.value)}
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Issue Description</label>
              <textarea 
                className="form-input" 
                rows="4" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                style={{ resize: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Priority Score</label>
                <input
                  type="number"
                  className="form-input"
                  value={priorityScore}
                  min={1}
                  max={10}
                  step={0.5}
                  onChange={(e) => setPriorityScore(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Estimated Completion</label>
                <input
                  type="text"
                  className="form-input"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  placeholder="e.g. 12 hours"
                />
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                Submit & Dispatch Agent
                <ChevronRight size={16} />
              </button>
              <button 
                type="button" 
                className="btn-action" 
                onClick={handleRemoveImage}
                style={{ padding: '0 20px', borderRadius: '10px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReportIssue;

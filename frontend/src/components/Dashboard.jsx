import React, { useContext, useState } from 'react';
import { IssueContext } from '../context/IssueContext';
import { getDepartment } from '../utils/gemini';
import { 
  AlertOctagon, CheckCircle2, ShieldAlert, Award, 
  MapPin, Clock, ThumbsUp, Flag, RefreshCw, 
  Search, Filter, ChevronDown, ChevronUp, Terminal,
  TrendingUp, HardHat, Camera, CheckSquare
} from 'lucide-react';

const Dashboard = () => {
  const { 
    issues, 
    currentUser, 
    verifyIssue, 
    flagIssue, 
    advanceIssueStatus,
    role,
    isBackendOnline,
    syncWithBackend
  } = useContext(IssueContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedIssueId, setExpandedIssueId] = useState(null);

  // Field Worker specific states
  const [proofFile, setProofFile] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null); // { verified: bool, feedback: str }
  const [activeAuditingId, setActiveAuditingId] = useState(null);

  // Statistics calculations
  const activeIssues = issues.filter(i => i.status !== 'Resolved').length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
  const impactPoints = currentUser.points;

  // Filters
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || issue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id) => {
    setExpandedIssueId(expandedIssueId === id ? null : id);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'var(--severity-critical)';
      case 'High': return 'var(--severity-high)';
      case 'Medium': return 'var(--severity-medium)';
      default: return 'var(--severity-low)';
    }
  };

  const handleProofUpload = (e, issueId) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofFile(file);
    setActiveAuditingId(issueId);
    setAuditResult(null);
  };

  const submitProof = async (issueId) => {
    if (!proofFile) return;
    
    setIsAuditing(true);
    setAuditResult(null);
    setActiveAuditingId(issueId);
    
    if (isBackendOnline) {
      try {
        const formData = new FormData();
        formData.append('file', proofFile);
        
        const response = await fetch(`/api/issues/${issueId}/resolve`, {
          method: 'POST',
          headers: currentUser.geminiKey ? { 'X-Gemini-Key': currentUser.geminiKey } : {},
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          // Delay to show auditing spinner
          await new Promise(resolve => setTimeout(resolve, 1800));
          
          const latestHistory = data.history[data.history.length - 1];
          const isVerified = data.status === 'Resolved';
          
          setAuditResult({
            verified: isVerified,
            feedback: data.aiResolutionFeedback || latestHistory.message
          });
          
          syncWithBackend();
          setProofFile(null);
        } else {
          setAuditResult({
            verified: false,
            feedback: 'Backend API failed to verify completion. Please try again.'
          });
        }
      } catch (err) {
        console.error(err);
        setAuditResult({
          verified: false,
          feedback: 'Network connection failed. Could not reach AI Auditor.'
        });
      } finally {
        setIsAuditing(false);
      }
    } else {
      // Local Fallback simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      const filename = proofFile.name.toLowerCase();
      const verified = !filename.includes('fail') && !filename.includes('bad') && !filename.includes('incomplete');
      const feedback = verified 
        ? "Simulation validation complete. The uploaded photo confirms resolution. Work site is certified clean."
        : "Proof evaluation rejected. The image shows remaining structural cracks and surrounding debris. Repair is incomplete.";
        
      setAuditResult({ verified, feedback });
      
      if (verified) {
        // Advance issue to Resolved locally
        await advanceIssueStatus(issueId);
      }
      setIsAuditing(false);
      setProofFile(null);
    }
  };

  const claimTask = async (issueId) => {
    let currentIssue = issues.find(i => i.id === issueId);
    let currentStatus = currentIssue ? currentIssue.status : 'Reported';
    
    // Sequential advances to reach 'In Progress'
    if (currentStatus === 'Reported') {
      await advanceIssueStatus(issueId); // Verified
      await advanceIssueStatus(issueId); // Work Assigned
      await advanceIssueStatus(issueId); // In Progress
    } else if (currentStatus === 'Verified') {
      await advanceIssueStatus(issueId); // Work Assigned
      await advanceIssueStatus(issueId); // In Progress
    } else if (currentStatus === 'Work Assigned') {
      await advanceIssueStatus(issueId); // In Progress
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat Panel */}
      <div className="dashboard-grid">
        <div className="stat-card glass">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--severity-critical)' }}>
            <AlertOctagon size={24} />
          </div>
          <div className="stat-info">
            <h4>Active Reports</h4>
            <p>{activeIssues}</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h4>Resolved Issues</h4>
            <p>{resolvedIssues}</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--secondary)' }}>
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h4>Impact Points</h4>
            <p>{impactPoints}</p>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Avg Dispatch</h4>
            <p>1.2 hrs</p>
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="dashboard-layout-container" style={{ display: 'grid', gridTemplateColumns: '2.1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Main Issue Hub */}
        <div className="glass" style={{ padding: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {role === 'worker' ? 'Municipal Assigned Work Orders' : 'Civic Issue Reports Feed'}
          </h2>
          
          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search reports..."
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Filter size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '34px', background: 'var(--bg-primary)', cursor: 'pointer' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Public Utilities">Public Utilities</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Other">Other / Misc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issue Cards Stack */}
        <div className="issue-list">
          {filteredIssues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              No issues match your current query filters.
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isExpanded = expandedIssueId === issue.id;
              const hasVerified = issue.verifiedBy.includes('user-me');
              const hasFlagged = issue.flaggedBy.includes('user-me');
              const severityColor = getSeverityColor(issue.severity);

              return (
                <div 
                  key={issue.id} 
                  className={`issue-card glass-interactive ${issue.severity === 'Critical' && issue.status !== 'Resolved' ? 'critical-pulse' : ''}`}
                  style={{ '--border-color': severityColor, padding: '20px' }}
                >
                  <div style={{ display: 'flex', gap: '20px', width: '100%', flexDirection: window.innerWidth < 640 ? 'column' : 'row' }}>
                    {issue.isVideo ? (
                      <video src={issue.image} controls className="issue-img-thumb" />
                    ) : (
                      <img 
                        src={issue.image} 
                        alt={issue.title} 
                        className="issue-img-thumb" 
                      />
                    )}
                    
                    <div className="issue-card-content">
                      <div className="issue-card-header">
                        <div>
                          <h3 className="issue-title">{issue.title}</h3>
                          <div className="issue-badges">
                            <span className={`badge badge-severity-${issue.severity.toLowerCase()}`}>
                              {issue.severity}
                            </span>
                            <span className="badge badge-status">
                              {issue.category}
                            </span>
                            <span className="badge badge-status" style={{ border: 'none', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}>
                              {issue.status}
                            </span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* Simulate State Advance */}
                          {role === 'citizen' && issue.status !== 'Resolved' && (
                            <button 
                              className="btn-action" 
                              onClick={() => advanceIssueStatus(issue.id)}
                              title="Advance resolving process"
                            >
                              <RefreshCw size={14} />
                              Simulate Action
                            </button>
                          )}
                          <button 
                            className="btn-action" 
                            onClick={() => toggleExpand(issue.id)}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      <p className="issue-desc">{issue.description}</p>

                      {/* Field Worker Claim & AI Upload controls */}
                      {role === 'worker' && issue.status === 'In Progress' && (
                        <div style={{ 
                          marginTop: '14px', 
                          background: 'rgba(255,255,255,0.01)', 
                          padding: '16px', 
                          borderRadius: '10px', 
                          border: '1px dashed var(--card-border)' 
                        }}>
                          <h5 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Camera size={16} style={{ color: 'var(--secondary)' }} />
                            Claimed Task - Submit Completion Proof
                          </h5>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleProofUpload(e, issue.id)}
                              style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                            />
                            {proofFile && activeAuditingId === issue.id && (
                              <button 
                                type="button" 
                                className="btn-primary" 
                                onClick={() => submitProof(issue.id)}
                                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                              >
                                Verify & Resolve with AI Auditor
                              </button>
                            )}
                          </div>
                          
                          {isAuditing && activeAuditingId === issue.id && (
                            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{
                                border: '2px solid var(--card-border)',
                                borderTopColor: 'var(--secondary)',
                                borderRadius: '50%',
                                width: '14px',
                                height: '14px',
                                animation: 'spin 1s infinite linear'
                              }}></div>
                              AI Auditor evaluating repair proof image...
                            </div>
                          )}
                          
                          {auditResult && activeAuditingId === issue.id && (
                            <div style={{ 
                              marginTop: '10px', 
                              padding: '10px', 
                              borderRadius: '6px', 
                              fontSize: '0.8rem',
                              background: auditResult.verified ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                              border: `1px solid ${auditResult.verified ? 'var(--primary)' : '#ef4444'}`,
                              color: auditResult.verified ? 'var(--primary)' : '#ef4444'
                            }}>
                              <strong>{auditResult.verified ? '✔ Certified' : '✘ Re-inspection Needed'}:</strong> {auditResult.feedback}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Display AI resolution proof details if resolved */}
                      {issue.proofImage && (
                        <div style={{ 
                          marginTop: '14px', 
                          padding: '14px', 
                          background: 'rgba(16, 185, 129, 0.02)', 
                          border: '1px solid rgba(16, 185, 129, 0.1)', 
                          borderRadius: '10px' 
                        }}>
                          <h5 style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckSquare size={16} />
                            ✔ AI Certified Resolution Proof
                          </h5>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start', marginTop: '10px' }}>
                            <img 
                              src={issue.proofImage} 
                              alt="Repair Proof" 
                              style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--card-border)' }} 
                            />
                            <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                              <strong>Auditor Remarks:</strong> {issue.aiResolutionFeedback || 'Visual verification successful. The hazard has been resolved.'}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="issue-card-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                          </span>
                          <span>Reported by: <strong>{issue.reporter}</strong></span>
                        </div>

                        <div className="issue-actions">
                          {role === 'citizen' ? (
                            <>
                              <button 
                                className={`btn-action ${hasVerified ? 'active-verify' : ''}`}
                                onClick={() => verifyIssue(issue.id)}
                              >
                                <ThumbsUp size={14} />
                                Verify ({issue.upvotes})
                              </button>
                              <button 
                                className={`btn-action ${hasFlagged ? 'active-flag' : ''}`}
                                onClick={() => flagIssue(issue.id)}
                              >
                                <Flag size={14} />
                                Flag ({issue.flags})
                              </button>
                            </>
                          ) : (
                            <>
                              {issue.status !== 'Resolved' && issue.status !== 'In Progress' && (
                                <button 
                                  className="btn-primary"
                                  onClick={() => claimTask(issue.id)}
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <HardHat size={14} />
                                  Claim Task & Start Repair
                                </button>
                              )}
                              {issue.status === 'In Progress' && (
                                <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: '600' }}>
                                  Claimed - Repair In Progress
                                </span>
                              )}
                              {issue.status === 'Resolved' && (
                                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '600' }}>
                                  ✔ Repair Verified & Resolved
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded timeline & logs view */}
                  {isExpanded && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Terminal size={16} style={{ color: 'var(--secondary)' }} />
                        Agent Dispatch Timeline & Records
                      </h4>

                      {/* Status timeline */}
                      <div className="timeline" style={{ marginBottom: '24px' }}>
                        {/* Calculate progress line width */}
                        {(() => {
                          const statusSequence = ['Reported', 'Verified', 'Work Assigned', 'In Progress', 'Resolved'];
                          const currentIdx = statusSequence.indexOf(issue.status);
                          const progressWidth = `${(currentIdx / (statusSequence.length - 1)) * 100}%`;
                          
                          return (
                            <>
                              <div className="timeline-progress" style={{ width: progressWidth }}></div>
                              {statusSequence.map((step, idx) => {
                                const isCompleted = idx < currentIdx;
                                const isActive = idx === currentIdx;
                                return (
                                  <div key={idx} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                    <div className="timeline-node">
                                      {idx + 1}
                                    </div>
                                    <span className="timeline-label">{step}</span>
                                  </div>
                                );
                              })}
                            </>
                          );
                        })()}
                      </div>

                      {/* Execution Console details */}
                      <div style={{ background: '#050608', border: '1px solid #1c2030', borderRadius: '10px', padding: '16px', fontFamily: 'monospace' }}>
                        <div style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '8px', borderBottom: '1px solid #1c2030', paddingBottom: '6px' }}>
                          CRITICAL ROUTING SPECIFICATION // TARGET: {getDepartment(issue.category).toUpperCase()}
                        </div>
                        {issue.history.map((log, index) => (
                          <div key={index} style={{ fontSize: '0.8rem', lineHeight: '1.6', color: '#38bdf8', marginBottom: '4px', display: 'flex', gap: '10px' }}>
                            <span style={{ color: '#6b7280' }}>[{new Date(log.time).toLocaleTimeString()}]</span>
                            <span style={{ color: '#4ade80' }}>✔ {log.status}:</span>
                            <span style={{ color: '#f3f4f6' }}>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI Predictive Insights Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
            <TrendingUp size={20} style={{ color: 'var(--secondary)' }} />
            AI Predictive Insights
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Real-time anomaly & degradation forecasting
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Insight 1 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Transformer Overload Risk</strong>
                <span className="badge badge-severity-high" style={{ fontSize: '0.65rem' }}>High</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                Koramangala Block 4 grid junction nodes reporting elevated thermo-resistance metrics.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Confidence: 84%</span>
                <span>Impact Area: Grid Nodes 4A-4D</span>
              </div>
              <div style={{ height: '4px', background: 'var(--card-border)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: '84%', height: '100%', background: 'var(--severity-high)' }}></div>
              </div>
            </div>

            {/* Insight 2 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Asphalt Shear Forecast</strong>
                <span className="badge badge-severity-critical" style={{ fontSize: '0.65rem' }}>Critical</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                Richmond Road underpass structural sensors detect micro-shifts. Pothole cluster expected within 48h.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Confidence: 92%</span>
                <span>Impact Area: Underpass lanes</span>
              </div>
              <div style={{ height: '4px', background: 'var(--card-border)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'var(--severity-critical)' }}></div>
              </div>
            </div>

            {/* Insight 3 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Silt Sewer Backup</strong>
                <span className="badge badge-severity-medium" style={{ fontSize: '0.65rem' }}>Medium</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                Flow variance algorithms indicate 30% reduction at block 6 drainage nodes. Blockage imminent.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Confidence: 65%</span>
                <span>Impact Area: Sector 3 Main drain</span>
              </div>
              <div style={{ height: '4px', background: 'var(--card-border)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--severity-medium)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Dashboard;

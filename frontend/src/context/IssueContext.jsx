import React, { createContext, useState, useEffect } from 'react';

export const IssueContext = createContext();

const SEED_ISSUES = [
  {
    id: 'issue-1',
    title: 'Major Pothole on Inner Ring Road',
    description: 'A deep pothole is causing severe traffic congestion and endangering motorcyclists near the Koramangala flyover. Needs immediate patching.',
    category: 'Road Damage',
    severity: 'High',
    status: 'In Progress',
    latitude: 12.9344,
    longitude: 77.6192,
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600',
    reporter: 'Rahul Sharma',
    upvotes: 24,
    flags: 0,
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    verifiedBy: ['user-123'],
    flaggedBy: [],
    history: [
      { status: 'Reported', message: 'Issue registered by Rahul Sharma', time: new Date(Date.now() - 172800000).toISOString() },
      { status: 'Verified', message: 'AI Civic Agent verified report. Geolocation matches traffic patterns.', time: new Date(Date.now() - 150000000).toISOString() },
      { status: 'Work Assigned', message: 'Dispatched to Department of Transportation (Road Maintenance Div 4).', time: new Date(Date.now() - 120000000).toISOString() },
      { status: 'In Progress', message: 'Maintenance team dispatched. Patch work scheduled.', time: new Date(Date.now() - 86400000).toISOString() }
    ]
  },
  {
    id: 'issue-2',
    title: 'Broken Streetlight Panel - 5th Cross',
    description: 'Entire row of streetlights is dark, making the street unsafe for pedestrians after 7 PM. Possible wiring damage in the junction box.',
    category: 'Public Utilities',
    severity: 'Medium',
    status: 'Resolved',
    latitude: 12.9372,
    longitude: 77.6210,
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600',
    reporter: 'Priya Nair',
    upvotes: 15,
    flags: 0,
    timestamp: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    verifiedBy: [],
    flaggedBy: [],
    history: [
      { status: 'Reported', message: 'Issue registered by Priya Nair', time: new Date(Date.now() - 345600000).toISOString() },
      { status: 'Verified', message: 'AI Civic Agent verified. Report matches local grid nodes.', time: new Date(Date.now() - 340000000).toISOString() },
      { status: 'Work Assigned', message: 'Dispatched to Electricity Board (Area 2 Grid Operations).', time: new Date(Date.now() - 300000000).toISOString() },
      { status: 'In Progress', message: 'Crew replacing street lamp ballast and check cables.', time: new Date(Date.now() - 250000000).toISOString() },
      { status: 'Resolved', message: 'Bulbs replaced, circuit tested. Streetlights are fully operational.', time: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  {
    id: 'issue-3',
    title: 'Overflowing Commercial Garbage Bin',
    description: 'Commercial waste has piled up outside the designated bin, blocking the pedestrian pathway and attracting stray dogs and flies.',
    category: 'Waste Management',
    severity: 'Critical',
    status: 'Reported',
    latitude: 12.9312,
    longitude: 77.6150,
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600',
    reporter: 'Amit Khare',
    upvotes: 8,
    flags: 0,
    timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    verifiedBy: [],
    flaggedBy: [],
    history: [
      { status: 'Reported', message: 'Issue registered by Amit Khare. Multimodal analysis confirms commercial waste.', time: new Date(Date.now() - 10800000).toISOString() }
    ]
  }
];

const SEED_LEADERBOARD = [
  { name: 'Karan Mehra', points: 340, badges: ['super-citizen', 'pothole-hunter'], issuesCount: 15, verifiedCount: 22 },
  { name: 'Priya Nair', points: 260, badges: ['reporter-badge', 'green-activist'], issuesCount: 9, verifiedCount: 14 },
  { name: 'Amit Khare', points: 195, badges: ['verify-badge'], issuesCount: 6, verifiedCount: 9 },
  { name: 'Aarav Patel (You)', points: 180, badges: ['reporter-badge', 'verify-badge'], issuesCount: 4, verifiedCount: 7, isMe: true },
  { name: 'Siddharth Sen', points: 120, badges: ['reporter-badge'], issuesCount: 3, verifiedCount: 5 }
];

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState(() => {
    const saved = localStorage.getItem('civic_issues');
    return saved ? JSON.parse(saved) : SEED_ISSUES;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('civic_leaderboard');
    return saved ? JSON.parse(saved) : SEED_LEADERBOARD;
  });

  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('civic_user_profile');
    if (saved) return JSON.parse(saved);
    const me = SEED_LEADERBOARD.find(u => u.isMe);
    return me || { name: 'Aarav Patel', points: 180, badges: ['reporter-badge', 'verify-badge'], issuesCount: 4, verifiedCount: 7 };
  });

  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [role, setRole] = useState('citizen'); // 'citizen' or 'worker'

  // Sync with Backend
  const syncWithBackend = async () => {
    try {
      const resIssues = await fetch('/api/issues');
      if (!resIssues.ok) throw new Error('API issue fetch failed');
      const dataIssues = await resIssues.json();
      setIssues(dataIssues);

      const resLeader = await fetch('/api/leaderboard');
      if (!resLeader.ok) throw new Error('API leaderboard fetch failed');
      const dataLeader = await resLeader.json();
      setLeaderboard(dataLeader);

      const resProfile = await fetch('/api/profile');
      if (!resProfile.ok) throw new Error('API profile fetch failed');
      const dataProfile = await resProfile.json();
      setCurrentUser(dataProfile);

      setIsBackendOnline(true);
      console.log('Connected to FastAPI backend successfully.');
    } catch (e) {
      console.warn('FastAPI backend offline or unavailable. Running in Local Standalone Mode:', e);
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    syncWithBackend();
  }, []);

  // Persist states to localStorage (useful as fallback)
  useEffect(() => {
    localStorage.setItem('civic_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('civic_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('civic_user_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (geminiKey) {
      localStorage.setItem('gemini_api_key', geminiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [geminiKey]);

  // Add a new issue
  const addIssue = async (newIssue) => {
    if (isBackendOnline) {
      try {
        const response = await fetch('/api/issues', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newIssue.title,
            description: newIssue.description,
            category: newIssue.category,
            severity: newIssue.severity,
            latitude: newIssue.latitude,
            longitude: newIssue.longitude,
            image: newIssue.image,
            isVideo: newIssue.isVideo,
            reporter: newIssue.reporter,
            history: newIssue.history
          })
        });

        if (response.ok) {
          await syncWithBackend();
          return;
        }
      } catch (err) {
        console.error('Failed to post issue to backend, falling back to local:', err);
      }
    }

    // Local Fallback
    const issueWithMeta = {
      id: `issue-${Date.now()}`,
      upvotes: 0,
      flags: 0,
      timestamp: new Date().toISOString(),
      verifiedBy: [],
      flaggedBy: [],
      upvotesCount: 0,
      ...newIssue
    };

    setIssues(prev => [issueWithMeta, ...prev]);

    // Update current user points & counts
    setCurrentUser(prev => {
      const updatedPoints = prev.points + 25; // 25 points for submitting a new issue
      const updatedCount = prev.issuesCount + 1;
      const updatedBadges = [...prev.badges];
      
      if (updatedCount >= 5 && !updatedBadges.includes('super-citizen')) {
        updatedBadges.push('super-citizen');
      }

      const updatedUser = {
        ...prev,
        points: updatedPoints,
        issuesCount: updatedCount,
        badges: updatedBadges
      };

      // Sync leaderboard
      setLeaderboard(leaders => 
        leaders.map(l => l.isMe ? { ...l, points: updatedPoints, issuesCount: updatedCount, badges: updatedBadges } : l)
               .sort((a, b) => b.points - a.points)
      );

      return updatedUser;
    });
  };

  // Upvote/Verify an issue
  const verifyIssue = async (issueId) => {
    if (isBackendOnline) {
      try {
        const response = await fetch(`/api/issues/${issueId}/verify`, {
          method: 'POST',
        });
        if (response.ok) {
          await syncWithBackend();
          return;
        }
      } catch (err) {
        console.error('Failed to verify issue on backend, falling back to local:', err);
      }
    }

    // Local Fallback
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      
      const userIndex = issue.verifiedBy.indexOf('user-me');
      const hasUpvoted = userIndex !== -1;
      
      let updatedVerifiedBy = [...issue.verifiedBy];
      let updatedUpvotes = issue.upvotes;

      if (hasUpvoted) {
        updatedVerifiedBy.splice(userIndex, 1);
        updatedUpvotes = Math.max(0, updatedUpvotes - 1);
        
        setCurrentUser(usr => {
          const updatedPoints = Math.max(0, usr.points - 10);
          const updatedUser = { ...usr, points: updatedPoints };
          setLeaderboard(leaders => 
            leaders.map(l => l.isMe ? { ...l, points: updatedPoints } : l)
                   .sort((a, b) => b.points - a.points)
          );
          return updatedUser;
        });
      } else {
        updatedVerifiedBy.push('user-me');
        updatedUpvotes += 1;

        setCurrentUser(usr => {
          const updatedPoints = usr.points + 10;
          const updatedVerifyCount = usr.verifiedCount + 1;
          const updatedBadges = [...usr.badges];

          if (updatedVerifyCount >= 10 && !updatedBadges.includes('master-verifier')) {
            updatedBadges.push('master-verifier');
          }

          const updatedUser = {
            ...usr,
            points: updatedPoints,
            verifiedCount: updatedVerifyCount,
            badges: updatedBadges
          };

          setLeaderboard(leaders => 
            leaders.map(l => l.isMe ? { ...l, points: updatedPoints, verifiedCount: updatedVerifyCount, badges: updatedBadges } : l)
                   .sort((a, b) => b.points - a.points)
          );

          return updatedUser;
        });
      }

      return {
        ...issue,
        upvotes: updatedUpvotes,
        verifiedBy: updatedVerifiedBy
      };
    }));
  };

  // Flag/Report inaccurate issue
  const flagIssue = async (issueId) => {
    if (isBackendOnline) {
      try {
        const response = await fetch(`/api/issues/${issueId}/flag`, {
          method: 'POST',
        });
        if (response.ok) {
          await syncWithBackend();
          return;
        }
      } catch (err) {
        console.error('Failed to flag issue on backend, falling back to local:', err);
      }
    }

    // Local Fallback
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;

      const userIndex = issue.flaggedBy.indexOf('user-me');
      const hasFlagged = userIndex !== -1;

      let updatedFlaggedBy = [...issue.flaggedBy];
      let updatedFlags = issue.flags;

      if (hasFlagged) {
        updatedFlaggedBy.splice(userIndex, 1);
        updatedFlags = Math.max(0, updatedFlags - 1);
      } else {
        updatedFlaggedBy.push('user-me');
        updatedFlags += 1;
      }

      return {
        ...issue,
        flags: updatedFlags,
        flaggedBy: updatedFlaggedBy
      };
    }));
  };

  // Simulate issue resolution flow
  const advanceIssueStatus = async (issueId) => {
    if (isBackendOnline) {
      try {
        const response = await fetch(`/api/issues/${issueId}/advance`, {
          method: 'POST',
        });
        if (response.ok) {
          await syncWithBackend();
          return;
        }
      } catch (err) {
        console.error('Failed to advance issue on backend, falling back to local:', err);
      }
    }

    // Local Fallback
    const statusSequence = ['Reported', 'Verified', 'Work Assigned', 'In Progress', 'Resolved'];
    
    setIssues(prev => prev.map(issue => {
      if (issue.id !== issueId) return issue;
      
      const currentIdx = statusSequence.indexOf(issue.status);
      if (currentIdx === -1 || currentIdx === statusSequence.length - 1) return issue;
      
      const nextStatus = statusSequence[currentIdx + 1];
      
      let message = '';
      switch (nextStatus) {
        case 'Verified':
          message = 'AI Civic Agent verified report. Geolocation verified by local mesh analysis.';
          break;
        case 'Work Assigned':
          message = `Assigned task to local municipal division for ${issue.category}.`;
          break;
        case 'In Progress':
          message = 'Maintenance team dispatched. Field operations are underway.';
          break;
        case 'Resolved':
          message = 'Issue resolved. Site inspection cleared by Civic Co-pilot.';
          break;
        default:
          message = `Status updated to ${nextStatus}`;
      }

      const updatedHistory = [
        ...issue.history,
        { status: nextStatus, message, time: new Date().toISOString() }
      ];

      return {
        ...issue,
        status: nextStatus,
        history: updatedHistory
      };
    }));
  };

  return (
    <IssueContext.Provider value={{
      issues,
      leaderboard,
      currentUser,
      geminiKey,
      setGeminiKey,
      addIssue,
      verifyIssue,
      flagIssue,
      advanceIssueStatus,
      isBackendOnline,
      syncWithBackend,
      role,
      setRole
    }}>
      {children}
    </IssueContext.Provider>
  );
};

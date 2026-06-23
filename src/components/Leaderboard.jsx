import React, { useContext } from 'react';
import { IssueContext } from '../context/IssueContext';
import { 
  Trophy, Shield, MapPin, CheckCircle, 
  UserCheck, Award, MessageSquareHeart 
} from 'lucide-react';

const Leaderboard = () => {
  const { leaderboard, currentUser } = useContext(IssueContext);

  const BADGES_LIST = [
    {
      id: 'reporter-badge',
      name: 'First Alert',
      desc: 'Submit at least 1 civic report',
      icon: MapPin,
      color: '#10b981'
    },
    {
      id: 'verify-badge',
      name: 'Truth Seeker',
      desc: 'Verify 1 other citizen report',
      icon: UserCheck,
      color: '#06b6d4'
    },
    {
      id: 'super-citizen',
      name: 'City Guardian',
      desc: 'Submit 5 or more valid civic reports',
      icon: Shield,
      color: '#c084fc'
    },
    {
      id: 'master-verifier',
      name: 'Shield of Truth',
      desc: 'Verify 10 or more citizen reports',
      icon: CheckCircle,
      color: '#3b82f6'
    },
    {
      id: 'green-activist',
      name: 'Eco Hero',
      desc: 'Resolve or report environmental issues',
      icon: Award,
      color: '#10b981'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 className="section-title">
        <Trophy className="nav-icon" style={{ color: 'var(--primary)' }} />
        Civic Leaderboard & Achievements
      </h2>

      <div className="leaderboard-container">
        {/* Left column: Profile card */}
        <div className="profile-card glass">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
            alt={currentUser.name} 
            className="avatar-large"
          />
          <h3 className="profile-title">{currentUser.name}</h3>
          <span className="profile-role">Level 4 Civic Guardian</span>

          <div className="profile-stats">
            <div className="profile-stat-box">
              <div className="profile-stat-val">{currentUser.points}</div>
              <div className="profile-stat-lbl">Civic Points</div>
            </div>
            <div className="profile-stat-box">
              <div className="profile-stat-val">{currentUser.issuesCount}</div>
              <div className="profile-stat-lbl">Reports</div>
            </div>
            <div className="profile-stat-box">
              <div className="profile-stat-val">{currentUser.verifiedCount}</div>
              <div className="profile-stat-lbl">Verifications</div>
            </div>
          </div>

          <h4 style={{ 
            fontSize: '0.85rem', 
            textTransform: 'uppercase', 
            letterSpacing: '1px', 
            color: 'var(--text-secondary)',
            marginBottom: '16px',
            alignSelf: 'flex-start',
            fontWeight: '600'
          }}>
            Civic Badges
          </h4>

          <div className="badges-grid">
            {BADGES_LIST.map((badge) => {
              const isEarned = currentUser.badges.includes(badge.id);
              const IconComp = badge.icon;
              return (
                <div 
                  key={badge.id} 
                  className={`badge-item ${isEarned ? 'earned' : ''}`}
                  title={`${badge.name}: ${badge.desc}`}
                >
                  <IconComp className="badge-icon" style={{ color: isEarned ? badge.color : 'var(--text-muted)' }} />
                  <span className="badge-name">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Standings */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)' }}>
            City Standing (Koramangala Ward)
          </h3>

          <div className="leader-list">
            {leaderboard.map((user, idx) => {
              const isMe = user.isMe || user.name.includes('(You)');
              // Beautiful mock avatars
              const avatarUrls = [
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80",
                "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=80",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80"
              ];
              
              return (
                <div key={idx} className={`leader-row ${isMe ? 'me' : ''}`}>
                  <div className="leader-user-info">
                    <span className="leader-rank">{idx + 1}</span>
                    <img 
                      src={avatarUrls[idx % avatarUrls.length]} 
                      alt={user.name} 
                      className="leader-avatar"
                    />
                    <span className="leader-name" style={{ color: isMe ? 'var(--primary)' : 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                  </div>
                  <div className="leader-points">
                    {user.points} pts
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(6, 182, 212, 0.03)', border: '1px solid rgba(6, 182, 212, 0.1)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <MessageSquareHeart size={24} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <strong>Tip:</strong> Earn +25 points for reporting new verified issues, and +10 points for verifying existing issues reported by your neighbors!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

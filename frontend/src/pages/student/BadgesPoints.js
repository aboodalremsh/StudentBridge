import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

export default function BadgesPoints() {
  const [points,  setPoints]  = useState({ total_points:0, history:[] });

  // ✅ FIX: ensure safe structure always
  const [badges,  setBadges]  = useState({ earned:[], all:[] });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([studentAPI.getPoints(), studentAPI.getBadges()])
      .then(([p, b]) => {
        setPoints(p?.data || { total_points:0, history:[] });

        // ✅ FIX: enforce structure safety
        setBadges({
          earned: b?.data?.earned || [],
          all: b?.data?.all || []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-screen">
          <div className="spinner"/>
        </div>
      </DashboardLayout>
    );
  }

  // ✅ FIX: safe arrays
  const earnedIds = new Set((badges.earned || []).map(b => b.id));
  const nextBadge = (badges.all || []).find(b => !earnedIds.has(b.id));

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>⚡ Points & Badges</h1>
        <p className="subtitle">Your achievements and rewards</p>
      </div>

      {/* Points overview */}
      <div className="grid-3" style={{ marginBottom:28 }}>
        <div className="stat-card" style={{ borderTop:'3px solid var(--accent-primary)' }}>
          <div className="stat-value" style={{ color:'var(--accent-primary)' }}>
            {points.total_points}
          </div>
          <div className="stat-label">Total Points</div>
        </div>

        <div className="stat-card" style={{ borderTop:'3px solid var(--accent-amber)' }}>
          <div className="stat-value" style={{ color:'var(--accent-amber)' }}>
            {(badges.earned || []).length}
          </div>
          <div className="stat-label">Badges Earned</div>
        </div>

        {nextBadge && (
          <div className="stat-card" style={{ borderTop:'3px solid var(--accent-green)' }}>
            <div style={{ fontSize:'1.8rem',marginBottom:8 }}>{nextBadge.icon}</div>
            <div style={{ fontFamily:'var(--font-display)',fontWeight:700,marginBottom:4 }}>
              {nextBadge.name}
            </div>
            <div style={{ fontSize:'0.78rem',color:'var(--text-muted)' }}>
              Need {nextBadge.trigger_at - points.total_points} more pts
            </div>

            <div className="progress-bar" style={{ marginTop:8 }}>
              <div
                className="progress-fill"
                style={{
                  width:`${Math.min((points.total_points/nextBadge.trigger_at)*100,100)}%`,
                  height:6
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ gap:24 }}>

        {/* Badges */}
        <div>
          <h3 style={{ marginBottom:16 }}>🏅 All Badges</h3>

          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>

            {(badges.all || []).map(b => {
              const isEarned = earnedIds.has(b.id);

              return (
                <div
                  key={b.id}
                  className="card"
                  style={{
                    textAlign:'center',
                    opacity:isEarned?1:0.4,
                    borderColor:isEarned?'rgba(52,217,155,0.4)':'var(--border)'
                  }}
                >
                  <div style={{ fontSize:'2rem',marginBottom:8 }}>{b.icon}</div>
                  <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9rem',marginBottom:4 }}>
                    {b.name}
                  </div>
                  <div style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:6 }}>
                    {b.description}
                  </div>

                  {isEarned
                    ? <span className="badge badge-active">✓ Earned</span>
                    : <span style={{ fontSize:'0.72rem',color:'var(--text-muted)' }}>
                        {b.trigger_at} pts needed
                      </span>
                  }
                </div>
              );
            })}

          </div>
        </div>

        {/* Points history */}
        <div>
          <h3 style={{ marginBottom:16 }}>📊 Points History</h3>

          {(points.history || []).length === 0
            ? <div className="empty-state card">
                <p>No points yet. Complete activities to earn points!</p>
              </div>
            : (points.history || []).map((h,i) => (
              <div
                key={i}
                style={{
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                  padding:'10px 0',
                  borderBottom:'1px solid var(--border)'
                }}
              >
                <div>
                  <div style={{ fontSize:'0.875rem',fontWeight:600 }}>{h.reason}</div>
                  <div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>
                    {new Date(h.awarded_at).toLocaleDateString()}
                  </div>
                </div>

                <span style={{
                  fontFamily:'var(--font-display)',
                  fontWeight:700,
                  color:'var(--accent-green)',
                  fontSize:'1rem'
                }}>
                  +{h.points}
                </span>
              </div>
            ))
          }
        </div>

      </div>
    </DashboardLayout>
  );
}
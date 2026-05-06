import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

const STATUS_COLORS = {
  pending:  { bg: 'rgba(245,166,35,0.12)',  color: 'var(--accent-amber)', label: '⏳ Pending'  },
  accepted: { bg: 'rgba(52,217,155,0.12)',  color: 'var(--accent-green)', label: '✅ Accepted' },
  rejected: { bg: 'rgba(244,110,110,0.12)', color: 'var(--accent-red)',   label: '❌ Rejected' },
};

export default function StudentMentorship() {
  const [programs,     setPrograms]     = useState([]);
  const [myApps,       setMyApps]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('browse');
  const [selected,     setSelected]     = useState(null);
  const [message,      setMessage]      = useState('');
  const [applying,     setApplying]     = useState(false);
  const [msg,          setMsg]          = useState({ type: '', text: '' });

  async function loadPrograms() {
    const { data } = await studentAPI.getMentorshipPrograms();
    setPrograms(data.programs || []);
  }

  async function loadMyApps() {
    const { data } = await studentAPI.getMyMentorshipApplications();
    setMyApps(data.applications || []);
  }

  useEffect(() => {
    Promise.all([loadPrograms(), loadMyApps()]).finally(() => setLoading(false));
  }, []);

  async function handleApply(e) {
    e.preventDefault();
    setApplying(true);
    setMsg({ type: '', text: '' });
    try {
      await studentAPI.applyToMentorship(selected.id, { message });
      setMsg({ type: 'success', text: '🎉 Application submitted! The company will review it.' });
      await loadPrograms();
      await loadMyApps();
      setTimeout(() => { setSelected(null); setMessage(''); setMsg({ type: '', text: '' }); }, 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Application failed.' });
    } finally {
      setApplying(false);
    }
  }

  const appliedIds = new Set(myApps.map(a => a.program_id));

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen"><div className="spinner"/></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>🎓 Mentorship Programs</h1>
        <p className="subtitle">Get guided by professionals — apply to mentorship programs from top companies</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['browse', `🔍 Browse Programs (${programs.length})`], ['mine', `📋 My Applications (${myApps.length})`]].map(([t, label]) => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── BROWSE TAB ── */}
      {tab === 'browse' && (
        programs.length === 0
          ? (
            <div className="empty-state card">
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎓</p>
              <p>No mentorship programs available right now. Check back soon!</p>
            </div>
          )
          : (
            <div className="grid-2" style={{ gap: 20 }}>
              {programs.map(p => {
                const already = appliedIds.has(p.id);
                const full    = p.accepted_count >= p.capacity;
                const spotsLeft = p.capacity - p.accepted_count;

                return (
                  <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Company header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <img
                        src={p.logo_url || 'https://via.placeholder.com/48'}
                        alt="logo"
                        onError={e => { e.target.src = 'https://via.placeholder.com/48'; }}
                        style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }}
                      />
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                          {p.company_name || 'Company'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.industry || ''}</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <span className={`badge ${p.is_active ? 'badge-active' : 'badge-rejected'}`}>
                          {p.is_active ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    </div>

                    <h3 style={{ marginBottom: 8 }}>{p.title}</h3>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.6, flex: 1, marginBottom: 14 }}>
                      {p.description || 'No description provided.'}
                    </p>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>👥 {p.applicant_count} applied</span>
                      <span style={{ color: full ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600 }}>
                        {full ? '🔴 Full' : `🟢 ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                      </span>
                      <span>📌 Capacity: {p.capacity}</span>
                    </div>

                    {/* CTA */}
                    {already
                      ? (
                        <div style={{
                          textAlign: 'center', padding: '10px',
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(52,217,155,0.08)',
                          border: '1px solid rgba(52,217,155,0.2)',
                          color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.85rem'
                        }}>
                          ✅ Applied
                        </div>
                      )
                      : full
                        ? (
                          <button className="btn btn-ghost btn-full" disabled>
                            Program Full
                          </button>
                        )
                        : (
                          <button
                            className="btn btn-primary btn-full"
                            onClick={() => { setSelected(p); setMsg({ type: '', text: '' }); setMessage(''); }}
                          >
                            Apply to Program →
                          </button>
                        )
                    }
                  </div>
                );
              })}
            </div>
          )
      )}

      {/* ── MY APPLICATIONS TAB ── */}
      {tab === 'mine' && (
        myApps.length === 0
          ? (
            <div className="empty-state card">
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📋</p>
              <p>You haven't applied to any mentorship programs yet.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('browse')}>
                Browse Programs →
              </button>
            </div>
          )
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myApps.map(a => {
                const s = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                return (
                  <div key={a.id} className="card" style={{ borderLeft: `3px solid ${s.color}` }}>
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 2 }}>
                          {a.program_title}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
                          {a.company_name}
                          {a.industry ? ` · ${a.industry}` : ''}
                        </div>
                      </div>
                      <span style={{
                        background: s.bg, color: s.color,
                        border: `1px solid ${s.color}33`,
                        padding: '4px 12px', borderRadius: 20,
                        fontSize: '0.8rem', fontWeight: 600,
                      }}>
                        {s.label}
                      </span>
                    </div>

                    {a.program_description && (
                      <p style={{ fontSize: '0.83rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                        {a.program_description}
                      </p>
                    )}

                    {a.message && (
                      <div style={{
                        background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                        padding: '8px 12px', fontSize: '0.8rem',
                        color: 'var(--text-muted)', marginBottom: 8,
                      }}>
                        💬 Your message: {a.message}
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Applied {new Date(a.applied_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )
      )}

      {/* ── APPLY MODAL ── */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>Apply: {selected.title}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img
                src={selected.logo_url || 'https://via.placeholder.com/40'}
                alt="logo"
                onError={e => { e.target.src = 'https://via.placeholder.com/40'; }}
                style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{selected.company_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {selected.capacity - selected.accepted_count} spots remaining
                </div>
              </div>
            </div>

            {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 14 }}>{msg.text}</div>}

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Why do you want to join this program? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Tell the company why you're interested and what you hope to learn…"
                  style={{ minHeight: 120 }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={applying}>
                {applying ? 'Submitting…' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

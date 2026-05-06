import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { companyAPI } from '../../services';

const STATUS_COLORS = {
  pending:  { color: 'var(--accent-amber)', label: '⏳ Pending'  },
  accepted: { color: 'var(--accent-green)', label: '✅ Accepted' },
  rejected: { color: 'var(--accent-red)',   label: '❌ Rejected' },
};

export default function Mentorship() {
  const [programs,    setPrograms]    = useState([]);
  const [form,        setForm]        = useState({ title: '', description: '', capacity: 10 });
  const [msg,         setMsg]         = useState({ type: '', text: '' });
  const [saving,      setSaving]      = useState(false);
  const [tab,         setTab]         = useState('programs');
  const [viewing,     setViewing]     = useState(null);   // program whose applicants we're viewing
  const [applicants,  setApplicants]  = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [editProg,    setEditProg]    = useState(null);   // program being edited

  async function load() {
    const { data } = await companyAPI.getMentorships();
    setPrograms(data.programs || []);
  }

  useEffect(() => { load(); }, []);

  // ── Create ────────────────────────────────────────────────
  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await companyAPI.createMentorship(form);
      setMsg({ type: 'success', text: '✅ Program created!' });
      setForm({ title: '', description: '', capacity: 10 });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create.' });
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle active/inactive ────────────────────────────────
  async function toggleActive(prog) {
    await companyAPI.updateMentorship(prog.id, { ...prog, is_active: prog.is_active ? 0 : 1 });
    load();
  }

  // ── Delete ────────────────────────────────────────────────
  async function handleDelete(id) {
    if (!window.confirm('Delete this mentorship program? This cannot be undone.')) return;
    await companyAPI.deleteMentorship(id);
    load();
  }

  // ── View applicants ───────────────────────────────────────
  async function openApplicants(prog) {
    setViewing(prog);
    setLoadingApps(true);
    try {
      const { data } = await companyAPI.getMentorshipApplicants(prog.id);
      setApplicants(data.applicants || []);
    } finally {
      setLoadingApps(false);
    }
  }

  async function updateStatus(appId, status) {
    await companyAPI.updateMentorshipAppStatus(appId, { status });
    // Re-load applicants
    const { data } = await companyAPI.getMentorshipApplicants(viewing.id);
    setApplicants(data.applicants || []);
    load(); // refresh counts
  }

  // ── Save edit ─────────────────────────────────────────────
  async function handleEdit(e) {
    e.preventDefault();
    await companyAPI.updateMentorship(editProg.id, editProg);
    setEditProg(null);
    load();
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>🎓 Mentorship Programs</h1>
        <p className="subtitle">Create and manage mentorship opportunities for students</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['programs', '📋 My Programs'], ['create', '+ Create New']].map(([t, label]) => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── CREATE TAB ── */}
      {tab === 'create' && (
        <div style={{ maxWidth: 560 }}>
          <form onSubmit={handleCreate} className="card">
            <h3 style={{ marginBottom: 16 }}>Create New Mentorship Program</h3>
            {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom: 14 }}>{msg.text}</div>}

            <div className="form-group">
              <label>Program Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. Web Development Mentorship"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what students will learn, the format, duration, etc."
                style={{ minHeight: 100 }}
              />
            </div>

            <div className="form-group">
              <label>Capacity (max students accepted)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Creating…' : '+ Create Program'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setTab('programs')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── PROGRAMS TAB ── */}
      {tab === 'programs' && (
        programs.length === 0
          ? (
            <div className="empty-state card">
              <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎓</p>
              <p>No mentorship programs yet.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setTab('create')}>
                + Create First Program
              </button>
            </div>
          )
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {programs.map(p => (
                <div key={p.id} className="card">
                  <div className="flex-between" style={{ marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ marginBottom: 0 }}>{p.title}</h3>
                        <span className={`badge ${p.is_active ? 'badge-active' : 'badge-rejected'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                        {p.description || 'No description.'}
                      </p>
                      <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>👥 {p.applicant_count} applied</span>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>✅ {p.accepted_count} accepted</span>
                        <span>📌 Capacity: {p.capacity}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openApplicants(p)}
                      >
                        👤 Applicants ({p.applicant_count})
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditProg({ ...p })}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={`btn btn-sm ${p.is_active ? 'btn-ghost' : 'btn-success'}`}
                        onClick={() => toggleActive(p)}
                      >
                        {p.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {/* ── EDIT MODAL ── */}
      {editProg && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditProg(null)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>Edit Program</h3>
              <button className="modal-close" onClick={() => setEditProg(null)}>✕</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  value={editProg.title}
                  onChange={e => setEditProg(p => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editProg.description || ''}
                  onChange={e => setEditProg(p => ({ ...p, description: e.target.value }))}
                  style={{ minHeight: 80 }}
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={editProg.capacity}
                  onChange={e => setEditProg(p => ({ ...p, capacity: Number(e.target.value) }))}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditProg(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── APPLICANTS MODAL ── */}
      {viewing && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewing(null)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>👤 Applicants — {viewing.title}</h3>
              <button className="modal-close" onClick={() => setViewing(null)}>✕</button>
            </div>

            {loadingApps
              ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
              : applicants.length === 0
                ? <div className="empty-state"><p>No applicants yet.</p></div>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '60vh', overflowY: 'auto' }}>
                    {applicants.map(a => {
                      const s = STATUS_COLORS[a.status] || STATUS_COLORS.pending;
                      return (
                        <div key={a.id} style={{
                          background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)', padding: 16,
                          borderLeft: `3px solid ${s.color}`,
                        }}>
                          <div className="flex-between" style={{ marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{a.full_name || a.student_email}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.student_email}</div>
                              {a.university && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.university} · {a.major}</div>}
                            </div>
                            <span style={{
                              color: s.color, fontWeight: 600, fontSize: '0.82rem',
                              background: `${s.color}15`, padding: '3px 10px', borderRadius: 20,
                            }}>
                              {s.label}
                            </span>
                          </div>

                          {a.skills && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                              {a.skills.split(',').slice(0, 5).map(sk => (
                                <span key={sk} style={{
                                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                                  borderRadius: 20, padding: '2px 8px', fontSize: '0.72rem',
                                }}>
                                  {sk.trim()}
                                </span>
                              ))}
                            </div>
                          )}

                          {a.message && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10, fontStyle: 'italic' }}>
                              "{a.message}"
                            </p>
                          )}

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            {a.cv_link && (
                              <a href={a.cv_link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                                📄 CV
                              </a>
                            )}
                            {a.linkedin_url && (
                              <a href={a.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                                💼 LinkedIn
                              </a>
                            )}
                            {a.status === 'pending' && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => updateStatus(a.id, 'accepted')}>
                                  ✅ Accept
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a.id, 'rejected')}>
                                  ❌ Reject
                                </button>
                              </>
                            )}
                            {a.status !== 'pending' && (
                              <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(a.id, 'pending')}>
                                ↩ Reset to Pending
                              </button>
                            )}
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                              Applied {new Date(a.applied_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
            }
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

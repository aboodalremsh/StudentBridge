import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

export default function BrowseJobs() {
  const [jobs,     setJobs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filters,  setFilters]  = useState({ search:'', type:'' });
  const [selected, setSelected] = useState(null);
  const [cover,    setCover]    = useState('');
  const [applying, setApplying] = useState(false);
  const [msg,      setMsg]      = useState({ type:'', text:'' });
  const [appliedIds, setAppliedIds] = useState(new Set());

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.type)   params.type   = filters.type;
      const { data } = await studentAPI.getJobs(params);
      setJobs(data.jobs);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    // Pre-load applied IDs for UI
    studentAPI.getApplications().then(({ data }) => {
      setAppliedIds(new Set(data.applications.map(a => a.job_id)));
    }).catch(() => {});
    load();
  }, []);

  useEffect(() => { load(); }, [filters.type]);

  async function handleApply(e) {
    e.preventDefault();
    setApplying(true); setMsg({ type:'', text:'' });
    try {
      const { data } = await studentAPI.applyToJob(selected.id, { cover_letter: cover });
      setMsg({ type:'success', text:`✅ Applied! Your match score: ${data.match_score}%` });
      setAppliedIds(prev => new Set([...prev, selected.id]));
      setTimeout(() => { setSelected(null); setCover(''); setMsg({type:'',text:''}); }, 2000);
    } catch(err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Application failed.' });
    } finally { setApplying(false); }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Browse Jobs</h1>
        <p className="subtitle">Find opportunities that match your skills</p>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <input placeholder="🔍 Search jobs, keywords…" value={filters.search}
          onChange={e => setFilters(f => ({...f, search:e.target.value}))}
          onKeyDown={e => e.key === 'Enter' && load()} style={{ maxWidth:280 }}/>
        <select value={filters.type} onChange={e => setFilters(f => ({...f, type:e.target.value}))} style={{ maxWidth:160 }}>
          <option value="">All Types</option>
          {['full-time','part-time','internship','remote','project'].map(t => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={load}>Search</button>
      </div>

      {loading ? <div className="loading-screen" style={{ minHeight:'40vh' }}><div className="spinner"/></div>
      : jobs.length === 0 ? <div className="empty-state card"><p style={{ fontSize:'2rem',marginBottom:12 }}>💼</p><p>No jobs found.</p></div>
      : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                  <h3 style={{ fontSize:'1rem', marginBottom:0 }}>{job.title}</h3>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.85rem',
                    color:job.match_score>=70?'var(--accent-green)':job.match_score>=40?'var(--accent-amber)':'var(--accent-red)',
                    background:job.match_score>=70?'rgba(52,217,155,0.1)':'rgba(245,166,35,0.1)',
                    padding:'2px 10px', borderRadius:20 }}>
                    {job.match_score}% match
                  </span>
                </div>
                <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:8 }}>
                  {job.company_name || '—'} · {job.location || 'Remote'} ·{' '}
                  <span className="badge badge-applied" style={{ padding:'1px 8px', fontSize:'0.7rem' }}>{job.type}</span>
                </div>
                <p style={{ fontSize:'0.85rem', lineHeight:1.5, marginBottom:10 }}>{job.description?.slice(0,160)}…</p>
                {job.requirements && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {job.requirements.split(',').slice(0, 6).map(r => (
                      <span key={r} style={{ background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:20,padding:'2px 10px',fontSize:'0.75rem',color:'var(--text-secondary)' }}>
                        {r.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0, alignItems:'flex-end' }}>
                {job.salary_range && <span style={{ fontSize:'0.8rem', color:'var(--accent-amber)', fontWeight:700 }}>{job.salary_range}</span>}
                {appliedIds.has(job.id)
                  ? <span className="badge badge-active">✓ Applied</span>
                  : <button className="btn btn-primary btn-sm" onClick={() => { setSelected(job); setMsg({type:'',text:''}); setCover(''); }}>Apply →</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-header">
              <h3>Apply: {selected.title}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <p style={{ marginBottom:8, fontSize:'0.9rem', color:'var(--text-muted)' }}>{selected.company_name} · {selected.location}</p>
            <div style={{ display:'inline-block', fontFamily:'var(--font-display)', fontWeight:800,
              color:selected.match_score>=70?'var(--accent-green)':'var(--accent-amber)', marginBottom:16, fontSize:'0.9rem' }}>
              {selected.match_score}% skill match
            </div>
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea value={cover} onChange={e => setCover(e.target.value)}
                  placeholder="Explain why you're a great fit for this role…" style={{ minHeight:140 }}/>
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

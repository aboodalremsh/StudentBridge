import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { companyAPI } from '../../services';

const STATUS_OPTIONS = ['applied','interviewed','hired','rejected'];
const STATUS_COLORS  = { applied:'badge-applied',interviewed:'badge-interviewed',hired:'badge-hired',rejected:'badge-rejected' };

export default function Applicants() {
  const location = useLocation();
  const [jobs,       setJobs]       = useState([]);
  const [selectedJob,setSelectedJob]= useState(location.state?.jobId||null);
  const [applicants, setApplicants] = useState([]);
  const [filter,     setFilter]     = useState({ status:'', skills:'' });
  const [loading,    setLoading]    = useState(false);
  const [selected,   setSelected]   = useState(null);   // applicant detail modal
  const [msgModal,   setMsgModal]   = useState(null);
  const [msgText,    setMsgText]    = useState('');
  const [intDate,    setIntDate]    = useState('');

  useEffect(() => {
    companyAPI.getJobs().then(({ data }) => {
      setJobs(data.jobs);
      if (!selectedJob && data.jobs.length) setSelectedJob(data.jobs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    companyAPI.getApplicants(selectedJob, filter)
      .then(({ data }) => setApplicants(data.applicants))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedJob, filter.status]);

  async function updateStatus(appId, status, interviewDate) {
    await companyAPI.updateAppStatus(appId, { status, interview_date: interviewDate||null });
    // Refresh
    companyAPI.getApplicants(selectedJob, filter).then(({ data }) => setApplicants(data.applicants));
    if (selected?.id === appId) setSelected(a => ({ ...a, status }));
  }

  async function sendMessage(studentId) {
    await companyAPI.sendMessage(studentId, { message: msgText, subject:'Message from company' });
    setMsgModal(null); setMsgText('');
    alert('Message sent to student as a notification!');
  }

  // Top-3 candidates comparison (highest match)
  const top3 = [...applicants].sort((a,b)=>b.match_score-a.match_score).slice(0,3);

  return (
    <DashboardLayout>
      <div className="page-header"><h1>Applicants</h1><p className="subtitle">Review and manage job applicants</p></div>

      {/* Job selector */}
      <div style={{ display:'flex',gap:12,marginBottom:20,flexWrap:'wrap' }}>
        <select value={selectedJob||''} onChange={e=>setSelectedJob(Number(e.target.value))} style={{ maxWidth:280 }}>
          {jobs.map(j=><option key={j.id} value={j.id}>{j.title} ({j.applicant_count} applicants)</option>)}
        </select>
        <select value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))} style={{ maxWidth:160 }}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Top 3 comparison */}
      {top3.length > 1 && (
        <div className="card" style={{ marginBottom:24 }}>
          <h3 style={{ marginBottom:14 }}>🏆 Top Candidates (by Match Score)</h3>
          <div className="grid-3">
            {top3.map((a,i)=>(
              <div key={a.id} style={{ background:'var(--bg-surface)',borderRadius:'var(--radius-md)',padding:16,border:'1px solid var(--border)',textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem',marginBottom:8 }}>{['🥇','🥈','🥉'][i]}</div>
                <div style={{ fontWeight:700,marginBottom:4 }}>{a.full_name||a.email}</div>
                <div style={{ fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.3rem',
                  color:a.match_score>=70?'var(--accent-green)':a.match_score>=40?'var(--accent-amber)':'var(--accent-red)' }}>
                  {a.match_score}%
                </div>
                <div style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginTop:4 }}>{a.university||'—'}</div>
                <span className={`badge ${STATUS_COLORS[a.status]}`} style={{ marginTop:8 }}>{a.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applicants table */}
      {loading ? <div className="loading-screen" style={{ minHeight:'30vh' }}><div className="spinner"/></div>
      : applicants.length === 0 ? <div className="empty-state card"><p>No applicants found.</p></div>
      : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>University</th><th>Skills</th><th>Match</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
            <tbody>
              {applicants.map(a=>(
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{a.full_name||'(unnamed)'}</div>
                    <div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>{a.email}</div>
                  </td>
                  <td style={{ fontSize:'0.85rem' }}>{a.university||'—'}</td>
                  <td><div style={{ maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:'0.8rem',color:'var(--text-muted)' }}>{a.skills||'—'}</div></td>
                  <td><span style={{ fontWeight:800,color:a.match_score>=70?'var(--accent-green)':a.match_score>=40?'var(--accent-amber)':'var(--accent-red)' }}>{a.match_score}%</span></td>
                  <td>
                    <select value={a.status} onChange={e=>updateStatus(a.id,e.target.value)}
                      style={{ width:130,padding:'4px 8px',fontSize:'0.8rem' }}>
                      {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize:'0.78rem',color:'var(--text-muted)' }}>{new Date(a.applied_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display:'flex',gap:4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(a)}>👁 View</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setMsgModal(a)}>📩</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicant detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-header">
              <h3>{selected.full_name||selected.email}</h3>
              <button className="modal-close" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="grid-2" style={{ marginBottom:16 }}>
              {[['University',selected.university],['Major',selected.major],['Experience',`${selected.experience_years||0} yrs`],['Match Score',`${selected.match_score}%`]].map(([k,v])=>(
                <div key={k} style={{ background:'var(--bg-surface)',padding:'10px 14px',borderRadius:'var(--radius-md)',border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'0.7rem',color:'var(--text-muted)',textTransform:'uppercase',fontWeight:700 }}>{k}</div>
                  <div style={{ fontWeight:700,marginTop:4 }}>{v||'—'}</div>
                </div>
              ))}
            </div>
            {selected.skills && <div style={{ marginBottom:12 }}><strong style={{ fontSize:'0.8rem' }}>Skills:</strong><p style={{ fontSize:'0.875rem',marginTop:4 }}>{selected.skills}</p></div>}
            {selected.bio    && <div style={{ marginBottom:12 }}><strong style={{ fontSize:'0.8rem' }}>Bio:</strong><p style={{ fontSize:'0.875rem',marginTop:4 }}>{selected.bio}</p></div>}
            {selected.cover_letter && <div style={{ marginBottom:16 }}><strong style={{ fontSize:'0.8rem' }}>Cover Letter:</strong><p style={{ fontSize:'0.875rem',marginTop:4,background:'var(--bg-surface)',padding:12,borderRadius:'var(--radius-md)',border:'1px solid var(--border)' }}>{selected.cover_letter}</p></div>}
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {selected.cv_link && <a href={selected.cv_link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📄 View CV</a>}
              {selected.github_url && <a href={selected.github_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">💻 GitHub</a>}
              {selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">💼 LinkedIn</a>}
              <button className="btn btn-ghost btn-sm" onClick={()=>setMsgModal(selected)}>📩 Message</button>
            </div>
            {/* Schedule interview */}
            {selected.status === 'applied' && (
              <div style={{ marginTop:20,background:'var(--bg-surface)',padding:16,borderRadius:'var(--radius-md)',border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'0.8rem',fontWeight:700,marginBottom:10 }}>📅 Schedule Interview</div>
                <div style={{ display:'flex',gap:10,alignItems:'center' }}>
                  <input type="datetime-local" value={intDate} onChange={e=>setIntDate(e.target.value)} style={{ flex:1 }}/>
                  <button className="btn btn-primary btn-sm" onClick={()=>{updateStatus(selected.id,'interviewed',intDate);setIntDate('');}}>Confirm</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message modal */}
      {msgModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setMsgModal(null)}>
          <div className="modal" style={{ maxWidth:440 }}>
            <div className="modal-header">
              <h3>Message {msgModal.full_name||msgModal.email}</h3>
              <button className="modal-close" onClick={()=>setMsgModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="Write your message here…" style={{ minHeight:120 }}/>
            </div>
            <button className="btn btn-primary btn-full" onClick={()=>sendMessage(msgModal.student_id)}>Send Message</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

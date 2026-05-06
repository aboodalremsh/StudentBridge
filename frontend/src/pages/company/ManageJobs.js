import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { companyAPI } from '../../services';

const EMPTY = { title:'',description:'',requirements:'',location:'',type:'full-time',salary_range:'',deadline:'',is_active:true,is_internship:false };

export default function ManageJobs() {
  const [jobs,   setJobs]   = useState([]);
  const [modal,  setModal]  = useState(false);
  const [editing,setEditing]= useState(null);
  const [form,   setForm]   = useState(EMPTY);
  const [msg,    setMsg]    = useState({ type:'', text:'' });
  const [saving, setSaving] = useState(false);
  const [loading,setLoading]= useState(true);

  async function load() {
    const { data } = await companyAPI.getJobs();
    setJobs(data.jobs);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY); setMsg({type:'',text:''}); setModal(true); }
  function openEdit(job) { setEditing(job); setForm({ title:job.title,description:job.description||'',requirements:job.requirements||'',location:job.location||'',type:job.type||'full-time',salary_range:job.salary_range||'',deadline:job.deadline?.split('T')[0]||'',is_active:!!job.is_active,is_internship:!!job.is_internship }); setMsg({type:'',text:''}); setModal(true); }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setMsg({type:'',text:''});
    try {
      if (editing) await companyAPI.updateJob(editing.id, form);
      else         await companyAPI.createJob(form);
      setMsg({ type:'success', text:'Job saved!' });
      load();
      setTimeout(() => setModal(false), 800);
    } catch(err) {
      setMsg({ type:'error', text:err.response?.data?.message||'Save failed.' });
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this job? This will also delete all applications.')) return;
    await companyAPI.deleteJob(id);
    load();
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div><h1>Manage Jobs</h1><p className="subtitle">Post and manage your job listings</p></div>
          <button className="btn btn-primary" onClick={openCreate}>+ Post New Job</button>
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : jobs.length === 0 ? (
        <div className="empty-state card">
          <p style={{ fontSize:'2.5rem',marginBottom:12 }}>💼</p>
          <p>No jobs posted yet.</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={openCreate}>Post Your First Job</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Location</th><th>Applicants</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td><div style={{ fontWeight:600 }}>{j.title}</div>{j.salary_range&&<div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>{j.salary_range}</div>}</td>
                  <td><span className="badge badge-applied">{j.type}</span>{j.is_internship?<span className="badge badge-company" style={{ marginLeft:4 }}>Internship</span>:null}</td>
                  <td>{j.location||'—'}</td>
                  <td style={{ fontWeight:700,color:'var(--accent-primary)' }}>{j.applicant_count}</td>
                  <td><span className={`badge ${j.is_active?'badge-active':'badge-inactive'}`}>{j.is_active?'Active':'Inactive'}</span></td>
                  <td>
                    <div style={{ display:'flex',gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(j)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(j.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{ maxWidth:580 }}>
            <div className="modal-header">
              <h3>{editing?'Edit Job':'Post New Job'}</h3>
              <button className="modal-close" onClick={()=>setModal(false)}>✕</button>
            </div>
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Job Title *</label><input value={form.title} onChange={e=>set('title',e.target.value)} required placeholder="e.g. React Developer"/></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe the role…"/></div>
              <div className="form-group"><label>Requirements (comma-separated skills)</label><input value={form.requirements} onChange={e=>set('requirements',e.target.value)} placeholder="React, Node.js, SQL"/></div>
              <div className="grid-2">
                <div className="form-group"><label>Location</label><input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Beirut, Remote…"/></div>
                <div className="form-group"><label>Type</label>
                  <select value={form.type} onChange={e=>set('type',e.target.value)}>
                    {['full-time','part-time','internship','remote','project'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Salary Range</label><input value={form.salary_range} onChange={e=>set('salary_range',e.target.value)} placeholder="$1000 - $2000/mo"/></div>
                <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={e=>set('deadline',e.target.value)}/></div>
              </div>
              <div style={{ display:'flex',gap:20,marginBottom:20 }}>
                <label style={{ display:'flex',alignItems:'center',gap:8,textTransform:'none',fontSize:'0.875rem' }}>
                  <input type="checkbox" checked={!!form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ width:'auto' }}/>
                  Active (visible to students)
                </label>
                <label style={{ display:'flex',alignItems:'center',gap:8,textTransform:'none',fontSize:'0.875rem' }}>
                  <input type="checkbox" checked={!!form.is_internship} onChange={e=>set('is_internship',e.target.checked)} style={{ width:'auto' }}/>
                  Internship Program
                </label>
              </div>
              <div style={{ display:'flex',gap:10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'✓ Save Job'}</button>
                <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

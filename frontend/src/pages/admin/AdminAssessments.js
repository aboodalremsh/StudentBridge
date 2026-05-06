import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState([]);
  const [modal,       setModal]       = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState({ title:'', description:'' });
  const [msg,         setMsg]         = useState({ type:'', text:'' });
  const [saving,      setSaving]      = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [questions,   setQuestions]   = useState([]);
  const [qForm,       setQForm]       = useState({ question_text:'', options:['','','',''], correct_answer:'', question_type:'mcq' });

  async function load() {
    const { data } = await adminAPI.getAssessments();
    setAssessments(data.assessments);
  }
  useEffect(() => { load(); }, []);

  async function openQuestions(a) {
    setSelected(a);
    const { data } = await adminAPI.getQuestions(a.id);
    setQuestions(data.questions);
  }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setMsg({type:'',text:''});
    try {
      if (editing) await adminAPI.updateAssessment(editing.id, form);
      else         await adminAPI.createAssessment(form);
      setMsg({ type:'success', text:'Saved!' });
      load();
      setTimeout(()=>setModal(false), 700);
    } catch(err) { setMsg({ type:'error', text:'Failed.' });
    } finally { setSaving(false); }
  }

  async function deleteAssessment(id) {
    if (!window.confirm('Delete this assessment?')) return;
    await adminAPI.deleteAssessment(id);
    load();
    if (selected?.id === id) setSelected(null);
  }

  async function addQuestion(e) {
    e.preventDefault();
    const payload = { ...qForm, options: qForm.question_type==='mcq' ? qForm.options.filter(o=>o.trim()) : [] };
    await adminAPI.addQuestion(selected.id, payload);
    const { data } = await adminAPI.getQuestions(selected.id);
    setQuestions(data.questions);
    setQForm({ question_text:'', options:['','','',''], correct_answer:'', question_type:'mcq' });
    load();
  }

  async function deleteQuestion(qId) {
    await adminAPI.deleteQuestion(selected.id, qId);
    setQuestions(q => q.filter(q=>q.id!==qId));
    load();
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div><h1>Assessments</h1><p className="subtitle">Create skill assessments for students</p></div>
          <button className="btn btn-primary" onClick={()=>{ setEditing(null); setForm({title:'',description:''}); setMsg({type:'',text:''}); setModal(true); }}>+ New Assessment</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 1fr':'1fr', gap:20 }}>
        <div>
          {assessments.map(a=>(
            <div key={a.id} className="card" style={{ marginBottom:12, border:selected?.id===a.id?'1px solid var(--accent-primary)':undefined }}>
              <div className="flex-between" style={{ marginBottom:8 }}>
                <div>
                  <h4>{a.title}</h4>
                  <div style={{ fontSize:'0.78rem',color:'var(--text-muted)' }}>{a.description}</div>
                </div>
                <span className="badge badge-applied">{a.q_count} questions</span>
              </div>
              <div style={{ display:'flex',gap:6 }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>openQuestions(a)}>📝 Questions</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>{ setEditing(a); setForm({title:a.title,description:a.description||''}); setMsg({type:'',text:''}); setModal(true); }}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={()=>deleteAssessment(a.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card" style={{ alignSelf:'start' }}>
            <div className="flex-between" style={{ marginBottom:14 }}>
              <h3>{selected.title}</h3>
              <button className="modal-close" onClick={()=>setSelected(null)}>✕</button>
            </div>

            {/* Add question form */}
            <form onSubmit={addQuestion} style={{ background:'var(--bg-surface)',padding:14,borderRadius:'var(--radius-md)',border:'1px solid var(--border)',marginBottom:16 }}>
              <div style={{ fontWeight:700,fontSize:'0.85rem',marginBottom:10 }}>+ Add Question</div>
              <div className="form-group" style={{ marginBottom:8 }}>
                <label>Type</label>
                <select value={qForm.question_type} onChange={e=>setQForm(f=>({...f,question_type:e.target.value}))}>
                  <option value="mcq">Multiple Choice</option>
                  <option value="open">Open Text</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom:8 }}>
                <label>Question</label>
                <textarea value={qForm.question_text} onChange={e=>setQForm(f=>({...f,question_text:e.target.value}))} required style={{ minHeight:60 }}/>
              </div>
              {qForm.question_type === 'mcq' && (
                <>
                  {qForm.options.map((opt,i)=>(
                    <div key={i} className="form-group" style={{ marginBottom:6 }}>
                      <label>Option {i+1}</label>
                      <input value={opt} onChange={e=>{ const o=[...qForm.options]; o[i]=e.target.value; setQForm(f=>({...f,options:o})); }} placeholder={`Option ${i+1}`}/>
                    </div>
                  ))}
                  <div className="form-group" style={{ marginBottom:8 }}>
                    <label>Correct Answer</label>
                    <select value={qForm.correct_answer} onChange={e=>setQForm(f=>({...f,correct_answer:e.target.value}))}>
                      <option value="">Select correct answer</option>
                      {qForm.options.filter(o=>o.trim()).map((o,i)=><option key={i} value={o}>{o}</option>)}
                    </select>
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary btn-sm">+ Add Question</button>
            </form>

            {/* Questions list */}
            {questions.map((q,i)=>(
              <div key={q.id} style={{ padding:'10px 0',borderBottom:'1px solid var(--border)' }}>
                <div className="flex-between">
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.875rem',fontWeight:600,marginBottom:4 }}>{i+1}. {q.question_text}</div>
                    {q.question_type==='mcq'&&q.options && (
                      <div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>
                        Options: {(typeof q.options==='string'?JSON.parse(q.options):q.options).join(', ')}
                      </div>
                    )}
                    {q.correct_answer && <div style={{ fontSize:'0.75rem',color:'var(--accent-green)' }}>✓ {q.correct_answer}</div>}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={()=>deleteQuestion(q.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{ maxWidth:460 }}>
            <div className="modal-header">
              <h3>{editing?'Edit Assessment':'New Assessment'}</h3>
              <button className="modal-close" onClick={()=>setModal(false)}>✕</button>
            </div>
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Title *</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required/></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ minHeight:80 }}/></div>
              <div style={{ display:'flex',gap:10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving…':'✓ Save'}</button>
                <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

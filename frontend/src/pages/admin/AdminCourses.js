import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI, learningAPI } from '../../services';

const EMPTY_COURSE = { title:'',description:'',category:'',level:'beginner',duration:'',price:0,instructor:'',skills_taught:'',is_active:true };
const EMPTY_LESSON = { title:'',content:'',duration:'',order_index:'' };

export default function AdminCourses() {
  const [courses,  setCourses]  = useState([]);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_COURSE);
  const [msg,      setMsg]      = useState({ type:'', text:'' });
  const [saving,   setSaving]   = useState(false);
  const [selected, setSelected] = useState(null);  // for lessons panel
  const [lessons,  setLessons]  = useState([]);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [savingLesson, setSavingLesson] = useState(false);

  async function load() {
    const { data } = await adminAPI.getCourses();
    setCourses(data.courses);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setForm(EMPTY_COURSE); setMsg({type:'',text:''}); setModal(true); }
  function openEdit(c)  { setEditing(c); setForm({ title:c.title,description:c.description||'',category:c.category||'',level:c.level||'beginner',duration:c.duration||'',price:c.price||0,instructor:c.instructor||'',skills_taught:c.skills_taught||'',is_active:!!c.is_active }); setMsg({type:'',text:''}); setModal(true); }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setMsg({type:'',text:''});
    try {
      if (editing) await adminAPI.updateCourse(editing.id, form);
      else         await adminAPI.createCourse(form);
      setMsg({ type:'success', text:'Course saved!' });
      load();
      setTimeout(()=>setModal(false), 800);
    } catch(err) { setMsg({ type:'error', text:err.response?.data?.message||'Failed.' });
    } finally { setSaving(false); }
  }

  async function deleteCourse(id) {
    if (!window.confirm('Delete this course and all its lessons?')) return;
    await adminAPI.deleteCourse(id);
    load();
    if (selected?.id === id) setSelected(null);
  }

  async function openLessons(course) {
    setSelected(course);
    const { data } = await learningAPI.getCourse(course.id);
    setLessons(data.lessons || []);
  }

  async function addLesson(e) {
    e.preventDefault(); setSavingLesson(true);
    try {
      await adminAPI.addLesson(selected.id, lessonForm);
      setLessonForm(EMPTY_LESSON);
      const { data } = await learningAPI.getCourse(selected.id);
      setLessons(data.lessons || []);
      load();
    } catch(err) { alert(err.response?.data?.message||'Failed.');
    } finally { setSavingLesson(false); }
  }

  async function deleteLesson(lessonId) {
    await adminAPI.deleteLesson(selected.id, lessonId);
    const { data } = await learningAPI.getCourse(selected.id);
    setLessons(data.lessons || []);
    load();
  }

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div><h1>Manage Courses</h1><p className="subtitle">Create and manage Learning Hub courses</p></div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Course</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:selected?'1fr 1fr':'1fr', gap:20 }}>
        <div>
          {courses.map(c=>(
            <div key={c.id} className="card" style={{ marginBottom:12, border:selected?.id===c.id?'1px solid var(--accent-primary)':undefined }}>
              <div className="flex-between" style={{ marginBottom:8 }}>
                <div>
                  <div style={{ fontFamily:'var(--font-display)',fontWeight:700 }}>{c.title}</div>
                  <div style={{ fontSize:'0.78rem',color:'var(--text-muted)' }}>{c.category} · {c.level} · {c.instructor}</div>
                </div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap',alignItems:'center' }}>
                  <span style={{ fontWeight:700,color:c.price>0?'var(--accent-amber)':'var(--accent-green)',fontSize:'0.85rem' }}>{c.price>0?`$${c.price}`:'FREE'}</span>
                  <span className="badge badge-applied">{c.lesson_count} lessons</span>
                  <span className="badge badge-active">{c.enrolled_count} enrolled</span>
                  <span className={`badge ${c.is_active?'badge-active':'badge-inactive'}`}>{c.is_active?'Active':'Off'}</span>
                </div>
              </div>
              <div style={{ display:'flex',gap:6 }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>openLessons(c)}>📖 Lessons</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(c)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={()=>deleteCourse(c.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="card" style={{ alignSelf:'start' }}>
            <div className="flex-between" style={{ marginBottom:14 }}>
              <h3>{selected.title} — Lessons</h3>
              <button className="modal-close" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <form onSubmit={addLesson} style={{ background:'var(--bg-surface)',padding:14,borderRadius:'var(--radius-md)',border:'1px solid var(--border)',marginBottom:16 }}>
              <div style={{ fontWeight:700,fontSize:'0.85rem',marginBottom:10 }}>+ Add Lesson</div>
              <div className="form-group" style={{ marginBottom:8 }}><label>Title</label><input value={lessonForm.title} onChange={e=>setLessonForm(f=>({...f,title:e.target.value}))} required placeholder="Lesson title"/></div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8 }}>
                <div className="form-group" style={{ marginBottom:0 }}><label>Duration</label><input value={lessonForm.duration} onChange={e=>setLessonForm(f=>({...f,duration:e.target.value}))} placeholder="45 min"/></div>
                <div className="form-group" style={{ marginBottom:0 }}><label>Order</label><input type="number" value={lessonForm.order_index} onChange={e=>setLessonForm(f=>({...f,order_index:e.target.value}))} placeholder="1"/></div>
              </div>
              <div className="form-group" style={{ marginBottom:8 }}><label>Content</label><textarea value={lessonForm.content} onChange={e=>setLessonForm(f=>({...f,content:e.target.value}))} style={{ minHeight:60 }} placeholder="Lesson content…"/></div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingLesson}>{savingLesson?'Adding…':'+ Add Lesson'}</button>
            </form>
            {lessons.map((l,i)=>(
              <div key={l.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:'0.875rem',fontWeight:600 }}>{i+1}. {l.title}</div>
                  <div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>{l.duration}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={()=>deleteLesson(l.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-header">
              <h3>{editing?'Edit Course':'New Course'}</h3>
              <button className="modal-close" onClick={()=>setModal(false)}>✕</button>
            </div>
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group"><label>Title *</label><input value={form.title} onChange={e=>set('title',e.target.value)} required/></div>
              <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} style={{ minHeight:80 }}/></div>
              <div className="grid-2">
                <div className="form-group"><label>Category</label><input value={form.category} onChange={e=>set('category',e.target.value)} placeholder="Programming"/></div>
                <div className="form-group"><label>Level</label><select value={form.level} onChange={e=>set('level',e.target.value)}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>
                <div className="form-group"><label>Duration</label><input value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="10 hours"/></div>
                <div className="form-group"><label>Price ($)</label><input type="number" min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)}/></div>
              </div>
              <div className="form-group"><label>Instructor</label><input value={form.instructor} onChange={e=>set('instructor',e.target.value)}/></div>
              <div className="form-group"><label>Skills Taught (comma-separated)</label><input value={form.skills_taught} onChange={e=>set('skills_taught',e.target.value)} placeholder="React,Node.js,SQL"/></div>
              <div className="form-group"><label style={{ display:'flex',alignItems:'center',gap:8,textTransform:'none',fontSize:'0.875rem' }}><input type="checkbox" checked={!!form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ width:'auto' }}/> Active (visible to students)</label></div>
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

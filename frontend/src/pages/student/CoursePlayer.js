import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { learningAPI } from '../../services';

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [active,  setActive]  = useState(null);
  const [cert,    setCert]    = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data: d } = await learningAPI.getLessons(courseId);
      setData(d);
      if (d.lessons?.length) {
        const target = lessonId
          ? d.lessons.find(l => String(l.id ?? l._id) === String(lessonId)) ?? d.lessons[0]
          : d.lessons[0];
        setActive(prev => {
          // If prev lesson belongs to this course, keep it (e.g. after markComplete reload)
          // If navigating fresh to a new course, use target
          const belongsHere = prev && d.lessons.some(
            l => String(l.id ?? l._id) === String(prev.id ?? prev._id)
          );
          return belongsHere ? prev : target;
        });
      }
    } catch { navigate('/student/my-courses'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [courseId]);

  async function markComplete(lesson) {
    const lessonId = lesson.id ?? lesson._id;
    const { data: r } = await learningAPI.completeLesson(courseId, lessonId);
    if (r.certificate_uid) setCert(r.certificate_uid);
    load();
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen"><div className="spinner"/></div>
    </DashboardLayout>
  );

  const pct  = data?.progress?.percentage || 0;
  const done = data?.progress?.completed  || 0;
  const tot  = data?.progress?.total      || 0;

  return (
    <DashboardLayout>
      {cert && (
        <div className="alert alert-success" style={{ marginBottom:20, padding:'16px 20px' }}>
          🏆 <strong>Certificate issued!</strong> Certificate ID: <code style={{ fontFamily:'monospace' }}>{cert}</code>
          <button className="btn btn-success btn-sm" style={{ marginLeft:16 }} onClick={()=>navigate('/student/certificates')}>
            View Certificate
          </button>
        </div>
      )}

      {/* Progress */}
      <div className="card" style={{ marginBottom:20 }}>
        <div className="flex-between" style={{ marginBottom:8 }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>Progress</span>
          <span style={{ color:'var(--accent-primary)', fontWeight:800 }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width:`${pct}%`, height:10 }}/>
        </div>
        <p style={{ marginTop:6, fontSize:'0.8rem' }}>{done} / {tot} lessons completed</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
        {/* Lesson list */}
        <div className="card" style={{ position:'sticky', top:20, alignSelf:'start' }}>
          <h4 style={{ marginBottom:14 }}>Lessons</h4>
          {data?.lessons?.map((l, i) => {
            const lId = l.id ?? l._id;
            const aId = active?.id ?? active?._id;
            return (
              <div key={lId} onClick={()=>setActive(l)}
                style={{ padding:'9px 12px', borderRadius:'var(--radius-md)', marginBottom:4, cursor:'pointer',
                  background: aId===lId?'var(--primary-glow)':'transparent',
                  border:`1px solid ${aId===lId?'var(--accent-primary)':'transparent'}`,
                  display:'flex', alignItems:'center', gap:10, transition:'all var(--transition)' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'0.72rem', background: l.is_completed?'var(--accent-green)':'var(--bg-surface)',
                  color: l.is_completed?'#fff':'var(--text-muted)', border:`1px solid ${l.is_completed?'var(--accent-green)':'var(--border)'}` }}>
                  {l.is_completed ? '✓' : i+1}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.83rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    color: aId===lId?'var(--accent-primary)':'var(--text-main)' }}>{l.title}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{l.duration}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lesson content */}
        {active && (
          <div className="card">
            <div className="flex-between" style={{ marginBottom:20 }}>
              <div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:4 }}>
                  Lesson {data.lessons.findIndex(l=>(l.id??l._id)===(active.id??active._id))+1}
                </div>
                <h2>{active.title}</h2>
              </div>
              {active.is_completed
                ? <span className="badge badge-active">✓ Completed</span>
                : <button className="btn btn-primary" onClick={()=>markComplete(active)}>✓ Mark Complete</button>
              }
            </div>

            <div style={{ background:'var(--bg-surface)', borderRadius:'var(--radius-md)', padding:24, minHeight:280,
              border:'1px solid var(--border)', lineHeight:1.8, color:'var(--text-secondary)', marginBottom:20 }}>
              {active.content || (
                <div>
                  <p style={{ marginBottom:12, color:'var(--text-main)' }}><strong>{active.title}</strong></p>
                  <p style={{ marginBottom:12 }}>In this lesson you'll learn the core concepts of <strong>{active.title}</strong>.</p>
                  <p style={{ marginBottom:12 }}>📌 <strong style={{ color:'var(--accent-primary)' }}>Key Topics:</strong></p>
                  <ul style={{ paddingLeft:20, listStyle:'disc' }}>
                    <li style={{ marginBottom:6 }}>Fundamentals and theory</li>
                    <li style={{ marginBottom:6 }}>Hands-on examples</li>
                    <li style={{ marginBottom:6 }}>Best practices</li>
                    <li style={{ marginBottom:6 }}>Common mistakes to avoid</li>
                  </ul>
                  <p style={{ marginTop:16 }}>Duration: <strong>{active.duration}</strong></p>
                </div>
              )}
            </div>

            <div className="flex-between">
              <button className="btn btn-ghost"
                onClick={() => {
                  const idx = data.lessons.findIndex(l=>(l.id??l._id)===(active.id??active._id));
                  if (idx > 0) setActive(data.lessons[idx - 1]);
                }}
                disabled={data.lessons.findIndex(l=>(l.id??l._id)===(active.id??active._id)) === 0}>
                ← Previous
              </button>
              <button className="btn btn-primary"
                onClick={() => {
                  const idx = data.lessons.findIndex(l=>(l.id??l._id)===(active.id??active._id));
                  if (idx < data.lessons.length - 1) setActive(data.lessons[idx + 1]);
                }}
                disabled={data.lessons.findIndex(l=>(l.id??l._id)===(active.id??active._id)) === data.lessons.length - 1}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
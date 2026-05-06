import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { learningAPI } from '../../services';

export default function LearningHub() {
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [msg,       setMsg]       = useState({ type: '', text: '' });
  const [filter,    setFilter]    = useState({ category: '', level: '' });
  const navigate = useNavigate();

  useEffect(() => {
    learningAPI.getCourses(filter)
      .then(({ data }) => setCourses(data.courses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter.category, filter.level]);

  async function openCourse(id) {
    const { data } = await learningAPI.getCourse(id);
    setSelected(data);
    setMsg({ type: '', text: '' });
  }

  // Only called for FREE courses — paid go to /student/checkout/:id
  async function handleFreeEnroll(e) {
    e.preventDefault();
    setEnrolling(true);
    setMsg({ type: '', text: '' });
    try {
      await learningAPI.enroll(selected.course.id, {});
      setMsg({ type: 'success', text: '\ud83c\udf89 Enrolled successfully! Opening course\u2026' });
      setTimeout(() => {
        setSelected(null);
        navigate(`/student/course/${selected.course.id}`);
      }, 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Enrollment failed' });
    } finally { setEnrolling(false); }
  }

  const LEVELS = { beginner: '\ud83d\udfe2 Beginner', intermediate: '\ud83d\udfe1 Intermediate', advanced: '\ud83d\udd34 Advanced' };
  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Learning Hub</h1>
            <p className="subtitle">Courses Certificates Skill building</p>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/student/my-courses')}>My Courses</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{ maxWidth: 160 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filter.level} onChange={e => setFilter(f => ({ ...f, level: e.target.value }))} style={{ maxWidth: 160 }}>
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : courses.length === 0 ? (
        <div className="empty-state card"><p>No courses found.</p></div>
      ) : (
        <div className="grid-3">
          {courses.map(c => (
            <div key={c.id} className="card" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => openCourse(c.id)}>
              <div style={{ marginBottom: 12 }}>
                <span className="badge badge-applied" style={{ marginRight: 8 }}>{c.category}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{LEVELS[c.level]}</span>
              </div>
              <h3 style={{ marginBottom: 6 }}>{c.title}</h3>
              <p style={{ fontSize: '0.83rem', flex: 1, marginBottom: 12 }}>{c.description?.slice(0, 90)}</p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', gap: 12 }}>
                <span>{c.duration}</span>
                <span>{c.lesson_count} lessons</span>
              </div>
              <div className="flex-between">
                <span style={{ fontWeight: 800, color: c.price > 0 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                  {c.price > 0 ? `$${c.price}` : '\ud83c\udd93 FREE'}
                </span>
                {c.is_enrolled ? (
                  <span className="badge badge-active">Enrolled</span>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); openCourse(c.id); }}>
                    {c.price > 0 ? 'Buy \u2192' : 'Enroll \u2192'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3>{selected.course.title}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}></button>
            </div>
            <p style={{ marginBottom: 16 }}>{selected.course.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['Level',    LEVELS[selected.course.level]],
                ['Duration', selected.course.duration],
                ['Lessons',  `${selected.lessons?.length} lessons`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '10px 14px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{k}</div>
                  <div style={{ fontWeight: 700, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>

            {selected.is_enrolled ? (
              <button className="btn btn-success btn-full" onClick={() => navigate(`/student/course/${selected.course.id}`)}>
                Continue Learning
              </button>
            ) : (
              <>
                {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

                <div style={{ textAlign: 'center', marginBottom: 16, fontSize: '1.6rem', fontWeight: 800, color: selected.course.price > 0 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                  {selected.course.price > 0 ? `$${selected.course.price}` : 'FREE'}
                </div>

                {selected.course.price > 0 ? (
                  /* PAID: redirect to dedicated Checkout page */
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => {
                      setSelected(null);
                      navigate(`/student/checkout/${selected.course.id}`);
                    }}
                  >
                    Go to Checkout ${selected.course.price}
                  </button>
                ) : (
                  /* FREE: enroll inline */
                  <button className="btn btn-primary btn-full" disabled={enrolling} onClick={handleFreeEnroll}>
                    {enrolling ? 'Processing\u2026' : 'Enroll for Free'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

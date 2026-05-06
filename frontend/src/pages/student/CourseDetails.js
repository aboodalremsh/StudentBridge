import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { learningAPI } from '../../services';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learningAPI.getCourse(courseId)
      .then(({ data: d }) => setData(d))
      .catch(() => navigate('/student/learning'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen"><div className="spinner"/></div>
    </DashboardLayout>
  );

  const { course, lessons, is_enrolled } = data || {};
  const LEVELS = { beginner:'🟢 Beginner', intermediate:'🟡 Intermediate', advanced:'🔴 Advanced' };

  // Safe ID reader — works for both `id` (REST) and `_id` (MongoDB)
  function lid(lesson) {
    return lesson?.id ?? lesson?._id;
  }

  // Find the first incomplete lesson; fall back to first lesson
  // Returns null if lessons list is empty
  function getResumeLessonId() {
    if (!lessons?.length) return null;
    const incomplete = lessons.find(l => !l.is_completed);
    return lid(incomplete ?? lessons[0]);
  }

  function goToPlayer() {
    const lessonId = getResumeLessonId();
    if (!lessonId) return;
    navigate(`/student/course/${courseId}/lesson/${lessonId}`);
  }

  const hasLessons = lessons?.length > 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header">
        <div className="flex-between">
          <div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom:8 }}
              onClick={() => navigate('/student/learning')}
            >
              ← Back to Learning Hub
            </button>
            <h1>{course?.title}</h1>
            <p className="subtitle">
              {course?.category}
              {course?.level ? ` · ${LEVELS[course.level]}` : ''}
            </p>
          </div>
          {is_enrolled ? (
            <button
              className="btn btn-success"
              onClick={goToPlayer}
              disabled={!hasLessons}
              title={!hasLessons ? 'No lessons available yet' : ''}
            >
              ▶ Continue Learning
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/student/checkout/${courseId}`)}
            >
              {course?.price > 0 ? `Enroll — $${course.price}` : 'Enroll Free'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, alignItems:'start' }}>

        {/* Left — description + curriculum */}
        <div>
          <div className="card" style={{ marginBottom:20 }}>
            <h3 style={{ marginBottom:12 }}>About this Course</h3>
            <p style={{ lineHeight:1.8, color:'var(--text-secondary)' }}>{course?.description}</p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom:14 }}>
              Course Curriculum
              <span style={{ fontSize:'0.8rem', fontWeight:400, color:'var(--text-muted)', marginLeft:8 }}>
                {lessons?.length || 0} lessons
              </span>
            </h3>
            {!hasLessons && (
              <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No lessons available yet.</p>
            )}
            {lessons?.map((l, i) => {
              const lessonId = lid(l);
              return (
                <div
                  key={lessonId ?? i}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'11px 0',
                    borderBottom: i < lessons.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: is_enrolled && lessonId ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (is_enrolled && lessonId) {
                      navigate(`/student/course/${courseId}/lesson/${lessonId}`);
                    }
                  }}
                >
                  {/* Step number / completion indicator */}
                  <div style={{
                    width:28, height:28, borderRadius:'50%', flexShrink:0,
                    background: l.is_completed ? 'var(--accent-green)' : 'var(--bg-surface)',
                    border: `1px solid ${l.is_completed ? 'var(--accent-green)' : 'var(--border)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.78rem',
                    color: l.is_completed ? '#fff' : 'var(--text-muted)',
                  }}>
                    {l.is_completed ? '✓' : i + 1}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-main)' }}>
                      {l.title}
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>
                      {l.duration}
                    </div>
                  </div>

                  {/* Lock icon for non-enrolled */}
                  {!is_enrolled && (
                    <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>🔒</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — sticky enroll card */}
        <div className="card" style={{ position:'sticky', top:20 }}>
          {/* Price */}
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{
              fontSize:'2.2rem', fontWeight:800,
              color: course?.price > 0 ? 'var(--accent-amber)' : 'var(--accent-green)',
            }}>
              {course?.price > 0 ? `$${course.price}` : '🆓 FREE'}
            </div>
          </div>

          {/* Meta */}
          <div style={{ display:'flex', flexDirection:'column', gap:0, marginBottom:20 }}>
            {[
              ['⏱ Duration',  course?.duration   || '—'],
              ['📖 Lessons',  `${lessons?.length || 0} lessons`],
              ['📊 Level',    LEVELS[course?.level] || '—'],
              ['🏷️ Category', course?.category   || '—'],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display:'flex', justifyContent:'space-between',
                  fontSize:'0.85rem', padding:'9px 0',
                  borderBottom:'1px solid var(--border)',
                }}
              >
                <span style={{ color:'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {is_enrolled ? (
            <button
              className="btn btn-success btn-full"
              onClick={goToPlayer}
              disabled={!hasLessons}
              title={!hasLessons ? 'No lessons available yet' : ''}
            >
              ▶ Continue Learning
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary btn-full"
                style={{ marginBottom:10 }}
                onClick={() => navigate(`/student/checkout/${courseId}`)}
              >
                {course?.price > 0 ? `Pay $${course.price} & Enroll` : 'Enroll for Free'}
              </button>
              <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', textAlign:'center' }}>
                {course?.price > 0
                  ? '🔒 Simulated payment — no real data processed.'
                  : 'No payment required.'}
              </p>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
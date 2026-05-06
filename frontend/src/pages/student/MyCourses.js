import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { learningAPI } from '../../services';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    learningAPI.getMyCourses().then(({ data }) => setCourses(data.courses)).finally(()=>setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div><h1>My Courses</h1><p className="subtitle">Enrolled courses and progress</p></div>
          <button className="btn btn-primary" onClick={()=>navigate('/student/learning')}>Browse More →</button>
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : courses.length === 0 ? (
        <div className="empty-state card">
          <p style={{ fontSize:'2.5rem', marginBottom:12 }}>📚</p>
          <p>No courses enrolled yet.</p>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>navigate('/student/learning')}>Browse Learning Hub</button>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map(c => (
            <div key={c.id} className="card" style={{ display:'flex', flexDirection:'column' }}>
              <div className="flex-between" style={{ marginBottom:12 }}>
                <span className="badge badge-applied">{c.category}</span>
                {c.is_complete ? <span className="badge badge-active">✓ Complete</span>
                  : <span className="badge badge-company">{c.progress}%</span>}
              </div>
              <h3 style={{ marginBottom:4 }}>{c.title}</h3>
              <p style={{ fontSize:'0.8rem', marginBottom:12 }}>by {c.instructor}</p>
              <div className="progress-bar" style={{ marginBottom:6 }}>
                <div className="progress-fill" style={{ width:`${c.progress}%`, height:6 }}/>
              </div>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:16 }}>
                {c.completed_lessons}/{c.total_lessons} lessons
              </p>
              {c.certificate_uid && (
                <div className="alert alert-success" style={{ padding:'6px 10px', fontSize:'0.8rem', marginBottom:10 }}>
                  🏆 Certificate Earned
                </div>
              )}
              <button className="btn btn-primary btn-full btn-sm" style={{ marginTop:'auto' }}
                onClick={()=>navigate(`/student/course/${c.id}`)}>
                {c.is_complete ? '▶ Review' : '▶ Continue'}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

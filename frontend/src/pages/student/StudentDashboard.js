import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, learningAPI } from '../../services';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [profile, setProfile] = useState(null);
  const [apps,    setApps]    = useState([]);
  const [courses, setCourses] = useState([]);
  const [advice,  setAdvice]  = useState(null);
  const [points,  setPoints]  = useState(0);
  const [certs,   setCerts]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentAPI.getProfile(),
      studentAPI.getApplications(),
      learningAPI.getMyCourses(),
      learningAPI.getMyCerts(),
      studentAPI.getPoints(),
      studentAPI.getCareerAdvice(),
    ]).then(([p, a, c, cert, pts, adv]) => {
      setProfile(p.data.profile);
      setApps(a.data.applications);
      setCourses(c.data.courses);
      setCerts(cert.data.certificates?.length || 0);
      setPoints(pts.data.total_points || 0);
      setAdvice(adv.data.advice);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="loading-screen"><div className="spinner"/></div></DashboardLayout>;

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0];

  // Calculate profile completeness
  const fields = [profile?.full_name, profile?.university, profile?.major, profile?.skills, profile?.bio, profile?.cv_link];
  const pct    = Math.round((fields.filter(f => f?.toString().trim()).length / fields.length) * 100);

  const stats = [
    { icon:'💼', label:'Applications', val:apps.length,                            color:'var(--accent-primary)', to:'/student/applications' },
    { icon:'✅', label:'Hired',        val:apps.filter(a=>a.status==='hired').length, color:'var(--accent-green)',  to:'/student/applications' },
    { icon:'📋', label:'Pending',      val:apps.filter(a=>a.status==='applied').length,color:'var(--accent-amber)', to:'/student/applications' },
    { icon:'📚', label:'Courses',      val:courses.length,                         color:'var(--accent-primary)', to:'/student/my-courses' },
    { icon:'🏆', label:'Certificates', val:certs,                                  color:'var(--accent-amber)',  to:'/student/certificates' },
    { icon:'⚡', label:'Points',       val:points,                                 color:'var(--accent-green)',  to:'/student/badges' },
  ];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>Welcome back, {firstName}! 👋</h1>
            <p className="subtitle">Here's your career overview for today.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/student/jobs')}>Browse Jobs →</button>
        </div>
      </div>

      {/* Profile completion bar */}
      {pct < 80 && (
        <div className="card" style={{ marginBottom:20, borderColor:'rgba(245,166,35,0.3)' }}>
          <div className="flex-between" style={{ marginBottom:8 }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:600 }}>Complete your profile to attract companies</span>
            <span style={{ color:'var(--accent-amber)', fontWeight:700 }}>{pct}%</span>
          </div>
          <div className="progress-bar" style={{ marginBottom:10 }}>
            <div className="progress-fill" style={{ width:`${pct}%` }}/>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/profile')}>Update Profile →</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom:24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ cursor:'pointer', borderTop:`3px solid ${s.color}` }}
            onClick={() => navigate(s.to)}>
            <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color, fontSize:'1.8rem' }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap:20, marginBottom:20 }}>
        {/* Recent applications */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom:16 }}>
            <h3>Recent Applications</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/applications')}>View All</button>
          </div>
          {apps.length === 0
            ? <div className="empty-state"><p>No applications yet.</p><button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={() => navigate('/student/jobs')}>Browse Jobs</button></div>
            : apps.slice(0, 4).map(a => (
              <div key={a.id} className="flex-between" style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:'0.9rem', fontWeight:600 }}>{a.job_title}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{a.company_name}</div>
                </div>
                <span className={`badge badge-${a.status}`}>{a.status}</span>
              </div>
            ))
          }
        </div>

        {/* My courses */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom:16 }}>
            <h3>My Courses</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/learning')}>Browse More</button>
          </div>
          {courses.length === 0
            ? <div className="empty-state"><p>No courses enrolled yet.</p><button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={() => navigate('/student/learning')}>Explore Courses</button></div>
            : courses.slice(0, 3).map(c => (
              <div key={c.id} style={{ marginBottom:12 }}>
                <div className="flex-between" style={{ marginBottom:4 }}>
                  <span style={{ fontSize:'0.875rem', fontWeight:600 }}>{c.title}</span>
                  <span style={{ fontSize:'0.78rem', color:'var(--accent-primary)', fontWeight:700 }}>{c.progress}%</span>
                </div>
                <div className="progress-bar" style={{ height:5 }}>
                  <div className="progress-fill" style={{ width:`${c.progress}%`, height:5 }}/>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* AI Recommendations */}
      {advice?.recommendations?.length > 0 && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom:16 }}>
            <h3>🧠 AI Advisor Recommendations</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/ai-advisor')}>View All</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {advice.recommendations.slice(0, 3).map((r, i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:12, background:'var(--bg-surface)', borderRadius:'var(--radius-md)', border:'1px solid var(--border)' }}>
                <span style={{ fontSize:'1.3rem' }}>{r.icon}</span>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.9rem', marginBottom:2 }}>{r.title}</div>
                  <p style={{ fontSize:'0.82rem', lineHeight:1.5 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

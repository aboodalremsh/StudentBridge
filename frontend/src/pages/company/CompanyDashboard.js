import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { companyAPI } from '../../services';

export default function CompanyDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    companyAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="loading-screen"><div className="spinner"/></div></DashboardLayout>;

  const t = analytics?.totals || {};
  const jobs = analytics?.jobs || [];

  const stats = [
    { icon:'💼', label:'Total Jobs',      val:t.total_jobs||0,         color:'var(--accent-primary)' },
    { icon:'👥', label:'Applications',    val:t.total_applications||0, color:'var(--accent-amber)' },
    { icon:'🎉', label:'Hired',           val:t.total_hired||0,        color:'var(--accent-green)' },
    { icon:'📊', label:'Avg Match Score', val:`${Math.round(t.avg_match_score||0)}%`, color:'var(--accent-primary)' },
  ];

  return (
    <DashboardLayout>
      <div style={{ marginBottom:32 }}>
        <h1>Company Dashboard</h1>
        <p className="subtitle">Overview of your recruitment activity</p>
      </div>

      <div className="grid-4" style={{ marginBottom:28 }}>
        {stats.map((s,i) => (
          <div key={i} className="stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:'1.6rem',marginBottom:8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top jobs by applicants */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="flex-between" style={{ marginBottom:16 }}>
          <h3>Top Jobs by Applications</h3>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/company/jobs')}>Manage Jobs →</button>
        </div>
        {jobs.length === 0
          ? <p style={{ color:'var(--text-muted)' }}>No jobs posted yet. <button className="btn btn-primary btn-sm" onClick={()=>navigate('/company/jobs')}>Post a Job</button></p>
          : jobs.slice(0,5).map(j => (
            <div key={j.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight:600,marginBottom:2 }}>{j.title}</div>
                <div style={{ fontSize:'0.78rem',color:'var(--text-muted)' }}>{j.type} · Avg match: {Math.round(j.avg_match||0)}%</div>
              </div>
              <div style={{ display:'flex',gap:12,alignItems:'center' }}>
                <span style={{ fontFamily:'var(--font-display)',fontWeight:700,color:'var(--accent-primary)' }}>{j.total_applicants} applicants</span>
                <span style={{ fontFamily:'var(--font-display)',fontWeight:700,color:'var(--accent-green)' }}>{j.hired_count} hired</span>
                <span className={`badge ${j.is_active?'badge-active':'badge-inactive'}`}>{j.is_active?'Active':'Closed'}</span>
                <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/company/applicants',{state:{jobId:j.id}})}>View →</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 style={{ marginBottom:16 }}>Quick Actions</h3>
        <div style={{ display:'flex',flexWrap:'wrap',gap:10 }}>
          {[
            ['💼 Post a Job','/company/jobs'],
            ['👥 View Applicants','/company/applicants'],
            ['📊 Analytics','/company/analytics'],
            ['👤 Edit Profile','/company/profile'],
            ['🎓 Mentorship Programs','/company/mentorship'],
          ].map(([label,to])=>(
            <button key={to} className="btn btn-ghost" onClick={()=>navigate(to)}>{label}</button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { companyAPI } from '../../services';

export default function Analytics() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyAPI.getAnalytics().then(({data})=>setData(data)).finally(()=>setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="loading-screen"><div className="spinner"/></div></DashboardLayout>;

  const t = data?.totals || {};

  return (
    <DashboardLayout>
      <div className="page-header"><h1>📊 Analytics</h1><p className="subtitle">Recruitment performance and engagement metrics</p></div>

      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          ['💼','Total Jobs',t.total_jobs||0,'var(--accent-primary)'],
          ['👥','Total Applications',t.total_applications||0,'var(--accent-amber)'],
          ['🎉','Total Hired',t.total_hired||0,'var(--accent-green)'],
          ['📊','Avg Match %',`${Math.round(t.avg_match_score||0)}%`,'var(--accent-primary)'],
        ].map(([icon,label,val,color])=>(
          <div key={label} className="stat-card" style={{ borderTop:`3px solid ${color}` }}>
            <div style={{ fontSize:'1.5rem',marginBottom:8 }}>{icon}</div>
            <div className="stat-value" style={{ color }}>{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Job Title</th><th>Total</th><th>Applied</th><th>Interviewed</th><th>Hired</th><th>Rejected</th><th>Avg Match</th></tr></thead>
          <tbody>
            {data?.jobs?.map(j=>(
              <tr key={j.id}>
                <td>
                  <div style={{ fontWeight:600 }}>{j.title}</div>
                  <span className={`badge ${j.is_active?'badge-active':'badge-inactive'}`}>{j.is_active?'Active':'Closed'}</span>
                </td>
                <td style={{ fontWeight:700,color:'var(--accent-primary)' }}>{j.total_applicants}</td>
                <td>{j.applied_count}</td>
                <td>{j.interviewed_count}</td>
                <td style={{ color:'var(--accent-green)',fontWeight:700 }}>{j.hired_count}</td>
                <td style={{ color:'var(--accent-red)' }}>{j.rejected_count}</td>
                <td><span style={{ fontWeight:700,color:j.avg_match>=70?'var(--accent-green)':j.avg_match>=40?'var(--accent-amber)':'var(--accent-red)' }}>{Math.round(j.avg_match||0)}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminJobs() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAllJobs().then(({ data }) => setJobs(data.jobs)).finally(()=>setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header"><h1>All Jobs</h1><p className="subtitle">Every job posted across all companies</p></div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Applicants</th><th>Status</th><th>Posted</th></tr></thead>
            <tbody>
              {jobs.map(j=>(
                <tr key={j.id}>
                  <td style={{ fontWeight:600 }}>{j.title}</td>
                  <td>{j.company_name||'—'}</td>
                  <td><span className="badge badge-applied">{j.type}</span>{j.is_internship?<span className="badge badge-company" style={{ marginLeft:4 }}>Internship</span>:null}</td>
                  <td style={{ fontWeight:700,color:'var(--accent-primary)' }}>{j.applicant_count}</td>
                  <td><span className={`badge ${j.is_active?'badge-active':'badge-inactive'}`}>{j.is_active?'Active':'Closed'}</span></td>
                  <td style={{ color:'var(--text-muted)',fontSize:'0.78rem' }}>{new Date(j.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(true);

  async function load() {
    const { data } = await adminAPI.getCompanies();
    setCompanies(data.companies);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggleSuspend(id) { await adminAPI.toggleSuspend(id); load(); }
  async function deleteUser(id)    { if (!window.confirm('Delete this company?')) return; await adminAPI.deleteUser(id); load(); }

  return (
    <DashboardLayout>
      <div className="page-header"><h1>Companies</h1><p className="subtitle">All registered companies on the platform</p></div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Company</th><th>Industry</th><th>Jobs</th><th>Applications</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {companies.map(c=>(
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{c.company_name||'(unnamed)'}</div>
                    <div style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td>{c.industry||'—'}</td>
                  <td style={{ color:'var(--accent-primary)',fontWeight:700 }}>{c.job_count}</td>
                  <td>{c.application_count}</td>
                  <td><span className={`badge ${c.is_suspended?'badge-rejected':'badge-active'}`}>{c.is_suspended?'Suspended':'Active'}</span></td>
                  <td>
                    <div style={{ display:'flex',gap:6 }}>
                      <button className={`btn btn-sm ${c.is_suspended?'btn-success':'btn-ghost'}`} onClick={()=>toggleSuspend(c.user_id)}>
                        {c.is_suspended?'Unsuspend':'Suspend'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={()=>deleteUser(c.user_id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

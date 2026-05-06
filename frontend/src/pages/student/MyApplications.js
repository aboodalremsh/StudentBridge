import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

const STATUS_COLORS = {
  applied:     'badge-applied',
  interviewed: 'badge-interviewed',
  hired:       'badge-hired',
  rejected:    'badge-rejected',
};

export default function MyApplications() {
  const [apps,    setApps]    = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getApplications()
      .then(({ data }) => setApps(data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  const counts = { all: apps.length };
  ['applied','interviewed','hired','rejected'].forEach(s => {
    counts[s] = apps.filter(a => a.status === s).length;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>My Applications</h1>
        <p className="subtitle">Track the status of every job you've applied to</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="stat-card" style={{ cursor:'pointer', borderTop:`3px solid var(--accent-primary)` }}
            onClick={() => setFilter(k)}>
            <div className="stat-value" style={{ color:'var(--accent-primary)', fontSize:'1.8rem' }}>{v}</div>
            <div className="stat-label">{k === 'all' ? 'Total' : k.charAt(0).toUpperCase()+k.slice(1)}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {['all','applied','interviewed','hired','rejected'].map(s => (
          <button key={s} className={`btn btn-sm ${filter===s?'btn-primary':'btn-ghost'}`}
            onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase()+s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : filtered.length === 0 ? (
        <div className="empty-state card">
          <p style={{ fontSize:'2rem', marginBottom:12 }}>📋</p>
          <p>No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Job Title</th>
                <th>Type</th>
                <th>Match %</th>
                <th>Status</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{a.company_name || 'Unknown'}</div>
                  </td>
                  <td>{a.job_title}</td>
                  <td><span className="badge badge-applied">{a.type}</span></td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: a.match_score >= 70 ? 'var(--accent-green)' : a.match_score >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)',
                    }}>
                      {a.match_score}%
                    </span>
                  </td>
                  <td><span className={`badge ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                  <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
                    {new Date(a.applied_at).toLocaleDateString()}
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

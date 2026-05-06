import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

const STATUS_COLORS = {
  applied:     'badge-applied',
  interviewed: 'badge-interviewed',
  hired:       'badge-active',
  rejected:    'badge-rejected',
};

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');

  useEffect(() => {
    adminAPI.getApplications()
      .then(({ data }) => setApplications(data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  const counts = { all: applications.length };
  ['applied', 'interviewed', 'hired', 'rejected'].forEach(s => {
    counts[s] = applications.filter(a => a.status === s).length;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>📋 All Applications</h1>
        <p className="subtitle">Every job application across the platform</p>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          ['all',         'Total',       'var(--accent-primary)'],
          ['applied',     'Applied',     'var(--accent-primary)'],
          ['interviewed', 'Interviewed', 'var(--accent-amber)'],
          ['hired',       'Hired',       'var(--accent-green)'],
          ['rejected',    'Rejected',    'var(--accent-red)'],
        ].map(([key, label, color]) => (
          <div
            key={key}
            className="stat-card"
            style={{ cursor: 'pointer', borderTop: `3px solid ${color}`, opacity: filter === key ? 1 : 0.65 }}
            onClick={() => setFilter(key)}
          >
            <div className="stat-value" style={{ color, fontSize: '1.8rem' }}>{counts[key] || 0}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'applied', 'interviewed', 'hired', 'rejected'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {loading
        ? <div className="loading-screen" style={{ minHeight: '30vh' }}><div className="spinner"/></div>
        : filtered.length === 0
          ? <div className="empty-state card"><p>No applications found.</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Type</th>
                    <th>Match %</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.student_email}</td>
                      <td>{a.job_title}</td>
                      <td>{a.company_name || '—'}</td>
                      <td><span className="badge badge-applied">{a.type || '—'}</span></td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: a.match_score >= 70 ? 'var(--accent-green)'
                            : a.match_score >= 40 ? 'var(--accent-amber)'
                            : 'var(--accent-red)',
                        }}>
                          {a.match_score}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[a.status] || ''}`}>{a.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(a.applied_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </DashboardLayout>
  );
}

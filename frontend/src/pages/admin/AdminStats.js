import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  function downloadCSV() {
    if (!stats) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Users',         stats.total_users],
      ['Students',            stats.students],
      ['Companies',           stats.companies],
      ['Jobs Posted',         stats.jobs],
      ['Total Applications',  stats.applications],
      ['Courses',             stats.courses],
      ['Certificates Issued', stats.certificates],
      ['Enrollments',         stats.enrollments],
      ['Points Awarded',      stats.total_points],
      ['Chat Messages',       stats.chat_messages],
    ];
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'studentbridge_stats.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen"><div className="spinner" /></div>
    </DashboardLayout>
  );

  const studentPct     = stats.total_users  ? Math.round((stats.students      / stats.total_users)  * 100) : 0;
  const companyPct     = stats.total_users  ? Math.round((stats.companies     / stats.total_users)  * 100) : 0;
  const completionRate = stats.enrollments  ? Math.round((stats.certificates  / stats.enrollments)  * 100) : 0;
  const hireRate       = stats.applications ? Math.round((stats.certificates  / stats.applications) * 100) : 0;
  const avgPoints      = stats.students     ? Math.round((stats.total_points  / stats.students))           : 0;
  const appsPerJob     = stats.jobs         ? Math.round((stats.applications  / stats.jobs))               : 0;

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>📊 System Statistics</h1>
            <p className="subtitle">Detailed platform analytics and breakdowns</p>
          </div>
          <button className="btn btn-ghost" onClick={downloadCSV}>⬇️ Export CSV</button>
        </div>
      </div>

      {/* Section 1: User Breakdown */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>👥 User Breakdown</h3>
        <div className="grid-3">
          {[
            { label: 'Total Users', val: stats.total_users, color: 'var(--accent-primary)', pct: 100 },
            { label: 'Students',    val: stats.students,    color: 'var(--accent-green)',   pct: studentPct },
            { label: 'Companies',   val: stats.companies,   color: 'var(--accent-amber)',   pct: companyPct },
          ].map(({ label, val, color, pct }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color, marginBottom: 4 }}>{val || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{label}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, height: 6, background: color }} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{pct}% of total users</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Learning Funnel */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>📚 Learning Funnel</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          How students progress from enrollment to earning a certificate.
        </p>
        {[
          { step: '1', label: 'Available Courses',   val: stats.courses,      color: 'var(--accent-primary)' },
          { step: '2', label: 'Total Enrollments',   val: stats.enrollments,  color: 'var(--accent-amber)'   },
          { step: '3', label: 'Certificates Issued', val: stats.certificates, color: 'var(--accent-green)'   },
        ].map(({ step, label, val, color }) => {
          const maxVal = stats.courses || 1;
          const pct    = Math.min(Math.round(((val || 0) / maxVal) * 100), 100);
          return (
            <div key={step} style={{ marginBottom: 16 }}>
              <div className="flex-between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={{ color, fontFamily: 'var(--font-display)', fontWeight: 800, marginRight: 8 }}>Step {step}</span>
                  {label}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{val || 0}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, height: 10, background: color }} />
              </div>
            </div>
          );
        })}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
          {[
            { label: 'Enrollment → Certificate Rate', val: `${completionRate}%`, color: 'var(--accent-green)',   icon: '🏆' },
            { label: 'Avg Applications per Job',       val: appsPerJob,           color: 'var(--accent-primary)', icon: '📋' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.6rem' }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Engagement */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>⚡ Engagement & Gamification</h3>
        <div className="grid-3">
          {[
            { label: 'Total Points Awarded',   val: stats.total_points || 0, color: 'var(--accent-amber)',   icon: '⚡' },
            { label: 'Avg Points per Student', val: avgPoints,                color: 'var(--accent-primary)', icon: '📈' },
            { label: 'AI Chat Messages',       val: stats.chat_messages || 0, color: 'var(--accent-green)',  icon: '💬' },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Platform Health */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>🏥 Platform Health Indicators</h3>
        {[
          { label: 'Application → Certificate Rate', pct: hireRate,       color: 'var(--accent-green)',   desc: `${stats.certificates || 0} certs from ${stats.applications || 0} applications` },
          { label: 'Course Completion Rate',          pct: completionRate, color: 'var(--accent-primary)', desc: `${stats.certificates || 0} certs from ${stats.enrollments || 0} enrollments` },
          { label: 'Student Share of Users',          pct: studentPct,     color: 'var(--accent-amber)',   desc: `${stats.students || 0} students out of ${stats.total_users || 0} total users` },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: 20 }}>
            <div className="flex-between" style={{ marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{row.label}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.desc}</div>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: row.color, fontSize: '1.1rem' }}>{row.pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${row.pct}%`, height: 8, background: row.color }} />
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

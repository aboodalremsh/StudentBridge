import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminDashboard() {
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showPoints, setShowPoints] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="loading-screen"><div className="spinner" /></div>
    </DashboardLayout>
  );

  const cards = [
    { icon: '👥', label: 'Total Users',    val: stats.total_users,  color: 'var(--accent-primary)', onClick: () => navigate('/admin/users') },
    { icon: '🎓', label: 'Students',       val: stats.students,     color: 'var(--accent-green)',   onClick: () => navigate('/admin/users?role=student') },
    { icon: '🏢', label: 'Companies',      val: stats.companies,    color: 'var(--accent-amber)',   onClick: () => navigate('/admin/companies') },
    { icon: '💼', label: 'Jobs Posted',    val: stats.jobs,         color: 'var(--accent-primary)', onClick: () => navigate('/admin/jobs') },
    { icon: '📋', label: 'Applications',   val: stats.applications, color: 'var(--accent-primary)', onClick: () => navigate('/admin/applications') },
    { icon: '📚', label: 'Courses',        val: stats.courses,      color: 'var(--accent-amber)',   onClick: () => navigate('/admin/courses') },
    { icon: '🏆', label: 'Certificates',   val: stats.certificates, color: 'var(--accent-green)',   onClick: () => navigate('/admin/certificates') },
    { icon: '🎟️', label: 'Enrollments',   val: stats.enrollments,  color: 'var(--accent-primary)', onClick: () => navigate('/admin/enrollments') },
    { icon: '⚡', label: 'Points Awarded', val: stats.total_points, color: 'var(--accent-amber)',   onClick: () => setShowPoints(p => !p), isPoints: true },
  ];

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <h1>Admin Console</h1>
        <p className="subtitle">Full platform management and statistics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {cards.map(({ icon, label, val, color, onClick, isPoints }) => (
          <div key={label} className="stat-card"
            style={{ cursor: 'pointer', borderTop: `3px solid ${color}` }}
            onClick={onClick}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{icon}</div>
            <div className="stat-value" style={{ color, fontSize: '1.8rem' }}>{val || 0}</div>
            <div className="stat-label">{label}</div>
            {isPoints && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {showPoints ? '▲ Hide breakdown' : '▼ View breakdown'}
              </div>
            )}
          </div>
        ))}
      </div>

      {showPoints && (
        <div className="card" style={{ marginBottom: 24, borderTop: '3px solid var(--accent-amber)' }}>
          <h3 style={{ marginBottom: 16 }}>⚡ Points System Breakdown</h3>
          <div className="grid-3" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Points Awarded',   val: stats.total_points || 0,                                                              color: 'var(--accent-amber)'   },
              { label: 'Avg Points per Student', val: stats.students ? Math.round((stats.total_points || 0) / stats.students) : 0,         color: 'var(--accent-primary)' },
              { label: 'Enrolled Students',      val: stats.students || 0,                                                                   color: 'var(--accent-green)'   },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: 16, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color, marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
          <h4 style={{ marginBottom: 10 }}>Points Earning Actions</h4>
          {[
            ['Complete profile',       '+30 pts'],
            ['Pass an assessment',     '+25 pts'],
            ['Apply to a job',         '+15 pts'],
            ['Enroll in a course',     '+20 pts'],
            ['Complete a full course', '+100 pts'],
            ['Get hired',              '+50 pts'],
          ].map(([action, pts]) => (
            <div key={action} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{action}</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{pts}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Quick Management</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[
            ['/admin/users',        '👥 Users'],
            ['/admin/companies',    '🏢 Companies'],
            ['/admin/jobs',         '💼 Jobs'],
            ['/admin/applications', '📋 Applications'],
            ['/admin/enrollments',  '🎟️ Enrollments'],
            ['/admin/courses',      '📚 Courses'],
            ['/admin/assessments',  '🧠 Assessments'],
            ['/admin/certificates', '🏆 Certificates'],
            ['/admin/stats',        '📊 Full Stats'],
          ].map(([to, label]) => (
            <button key={to} className="btn btn-ghost" onClick={() => navigate(to)}>{label}</button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    adminAPI.getEnrollments()
      .then(({ data }) => setEnrollments(data.enrollments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? enrollments.filter(e =>
        e.student_email?.toLowerCase().includes(search.toLowerCase()) ||
        e.course_title?.toLowerCase().includes(search.toLowerCase())
      )
    : enrollments;

  const totalRevenue = enrollments.reduce((sum, e) => sum + (parseFloat(e.amount_paid) || 0), 0);
  const paid  = enrollments.filter(e => e.payment_status === 'paid').length;
  const free  = enrollments.filter(e => e.payment_status === 'free').length;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>🎟️ Course Enrollments</h1>
        <p className="subtitle">All student course enrollments across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderTop: '3px solid var(--accent-primary)' }}>
          <div className="stat-value" style={{ color: 'var(--accent-primary)', fontSize: '1.8rem' }}>{enrollments.length}</div>
          <div className="stat-label">Total Enrollments</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--accent-amber)' }}>
          <div className="stat-value" style={{ color: 'var(--accent-amber)', fontSize: '1.8rem' }}>${totalRevenue.toFixed(2)}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--accent-green)' }}>
          <div className="stat-value" style={{ color: 'var(--accent-green)', fontSize: '1.8rem' }}>{paid} / {free}</div>
          <div className="stat-label">Paid / Free</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="🔍 Search by student email or course…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      {loading
        ? <div className="loading-screen" style={{ minHeight: '30vh' }}><div className="spinner"/></div>
        : filtered.length === 0
          ? <div className="empty-state card"><p>No enrollments found.</p></div>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Amount Paid</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 600 }}>{e.student_email}</td>
                      <td>{e.course_title}</td>
                      <td><span className="badge badge-applied">{e.category || '—'}</span></td>
                      <td>
                        <span className={`badge ${e.payment_status === 'paid' ? 'badge-active' : 'badge-applied'}`}>
                          {e.payment_status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>
                        {e.amount_paid > 0 ? `$${parseFloat(e.amount_paid).toFixed(2)}` : 'Free'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(e.enrolled_at).toLocaleDateString()}
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

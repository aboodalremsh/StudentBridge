import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminCertificates() {
  const [certs, setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getCertificates().then(({ data }) => setCerts(data.certificates)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header"><h1>Certificates</h1><p className="subtitle">All certificates issued on the platform</p></div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div>
      : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Course</th><th>Certificate ID</th><th>Issued</th></tr></thead>
            <tbody>
              {certs.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.full_name || '(unnamed)'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td>{c.course_title}</td>
                  <td><code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.certificate_uid}</code></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.issued_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

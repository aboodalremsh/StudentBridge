import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { adminAPI } from '../../services';

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const [users,   setUsers]   = useState([]);
  const [filter,  setFilter]  = useState({ role: searchParams.get('role') || '', search: '' });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await adminAPI.getUsers(filter);
    setUsers(data.users);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter.role]);

  async function toggleSuspend(id) {
    await adminAPI.toggleSuspend(id);
    load();
  }

  async function deleteUser(id) {
    if (!window.confirm('Permanently delete this user and all their data?')) return;
    await adminAPI.deleteUser(id);
    load();
  }

  const roleLabel = filter.role === 'student' ? 'Students' : filter.role === 'company' ? 'Companies' : 'All Users';

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1>Manage {roleLabel}</h1>
        <p className="subtitle">Suspend, delete, and view platform users</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          placeholder="🔍 Search by email…"
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && load()}
          style={{ maxWidth: 280 }}
        />
        <select value={filter.role} onChange={e => setFilter(f => ({ ...f, role: e.target.value }))} style={{ maxWidth: 150 }}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="company">Companies</option>
          <option value="admin">Admins</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={load}>Search</button>
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: '30vh' }}><div className="spinner" /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.is_suspended ? 'badge-rejected' : 'badge-active'}`}>{u.is_suspended ? 'Suspended' : 'Active'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={`btn btn-sm ${u.is_suspended ? 'btn-success' : 'btn-ghost'}`} onClick={() => toggleSuspend(u.id)}>
                          {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button>
                      </div>
                    )}
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

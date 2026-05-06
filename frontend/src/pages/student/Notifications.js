import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data } = await studentAPI.getNotifications();

      console.log("NOTIFICATIONS RESPONSE:", data);

      // ✅ FIXED: supports all backend formats
      setNotifications(data?.notifications || data?.data || data || []);
    } catch (err) {
      console.error("Notifications error:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    try {
      await studentAPI.markNotifRead();
      load();
    } catch (err) {
      console.error(err);
    }
  }

  const unread = notifications.filter(n => !n.is_read).length;

  const TYPE_COLOR = {
    success: 'var(--accent-green)',
    error: 'var(--accent-red)',
    warning: 'var(--accent-amber)',
    info: 'var(--accent-primary)',
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1>🔔 Notifications</h1>
            <p className="subtitle">
              {unread > 0 ? `${unread} unread` : 'All caught up!'}
            </p>
          </div>

          {unread > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
              ✓ Mark All Read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state card">
          <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔕</p>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                borderLeft: `3px solid ${
                  TYPE_COLOR[n.type] || 'var(--accent-primary)'
                }`,
                opacity: n.is_read ? 0.65 : 1,
              }}
            >
              <div className="flex-between">
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {n.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!n.is_read && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {n.created_at
                      ? new Date(n.created_at).toLocaleDateString()
                      : ''}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem' }}>{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
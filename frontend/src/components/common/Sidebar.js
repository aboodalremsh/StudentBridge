// components/common/Sidebar.js
import React, { useEffect, useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI } from '../../services';
import { socket } from '../../socket';

// ================= ICON RENDER (FIXED SAFE SVG) =================
const Icon = ({ d }) => {
  if (!d) return null;

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        display: "block",
        minWidth: "20px",
        minHeight: "20px"
      }}
    >
      {d.split('|').map((path, i) => (
        <path key={i} d={path} />
      ))}
    </svg>
  );
};
// ================= ICONS (FULL SAFE SET) =================
const ICONS = {
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',

  user: 'M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z|M4 20a8 8 0 0 1 16 0',

  brief: 'M4 7h16v13H4z|M9 7V4h6v3',

  list: 'M4 6h16|M4 12h16|M4 18h16',

  map: 'M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z',

  book: 'M4 6h16v14H4z',

  star: 'M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',

  award: 'M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',

  chat: 'M21 15H7l-4 4V5h18z',

  file: 'M6 2h12v20H6z',

  brain: 'M12 2a7 7 0 0 1 0 14a7 7 0 0 1 0-14z',

  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z',

  zap: 'M13 2L3 14h9l-1 8 10-12h-9z',

  users: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M22 21v-2a3 3 0 0 0-3-3',

  chart: 'M4 20h16|M7 16V8|M12 20V4|M17 16v-6',

  build: 'M3 21h18|M6 7h12l-1-4H7z',

  layers: 'M12 2L2 7l10 5 10-5-10-5z|M2 17l10 5 10-5',

  logout: 'M10 17l5-5-5-5|M15 12H3'
};
// ================= NAV =================
const NAV = {
  student: [
    { label: 'Dashboard', to: '/student', icon: 'home', end: true },
    { label: 'My Profile', to: '/student/profile', icon: 'user' },
    { label: 'Browse Jobs', to: '/student/jobs', icon: 'brief' },
    { label: 'My Applications', to: '/student/applications', icon: 'list' },
    { label: 'Career Roadmap', to: '/student/roadmap', icon: 'map' },
    { label: 'Assessments', to: '/student/assessments', icon: 'layers' },
    { label: 'Learning Hub', to: '/student/learning', icon: 'book' },
    { label: 'My Courses', to: '/student/my-courses', icon: 'star' },
    { label: 'Certificates', to: '/student/certificates', icon: 'award' },
    { label: 'CV Analyzer', to: '/student/cv-analyzer', icon: 'file' },
    { label: 'AI Advisor', to: '/student/ai-advisor', icon: 'brain' },
    { label: 'AI Chat', to: '/student/chat', icon: 'chat' },
    { label: 'Notifications', to: '/student/notifications', icon: 'bell' },
    { label: 'Points & Badges', to: '/student/badges',      icon: 'zap'   },
    { label: 'Mentorship',      to: '/student/mentorship',  icon: 'users' },
  ],

  company: [
    { label: 'Dashboard',   to: '/company',             icon: 'home',  end: true },
    { label: 'My Profile',  to: '/company/profile',     icon: 'user'  },
    { label: 'Manage Jobs', to: '/company/jobs',        icon: 'brief' },
    { label: 'Applicants',  to: '/company/applicants',  icon: 'users' },
    { label: 'Analytics',   to: '/company/analytics',   icon: 'chart' },
    { label: 'Mentorship',  to: '/company/mentorship',  icon: 'layers' }, // ✅ FIX: was missing
  ],

  admin: [
    { label: 'Dashboard',    to: '/admin',               icon: 'home',  end: true },
    { label: 'Users',        to: '/admin/users',         icon: 'users' },
    { label: 'Companies',    to: '/admin/companies',     icon: 'build' },
    { label: 'Jobs',         to: '/admin/jobs',          icon: 'brief' },
    { label: 'Applications', to: '/admin/applications',  icon: 'list'  },  // ✅ NEW
    { label: 'Courses',      to: '/admin/courses',       icon: 'book'  },
    { label: 'Enrollments',  to: '/admin/enrollments',   icon: 'layers'},  // ✅ NEW
    { label: 'Assessments',  to: '/admin/assessments',   icon: 'star'  },
    { label: 'Certificates', to: '/admin/certificates',  icon: 'award' },
    { label: 'Statistics',   to: '/admin/stats',         icon: 'chart' },
  ],
};

// ================= ROLE =================
const ROLE_LABEL = {
  student: 'Student Portal',
  company: 'Company Portal',
  admin: 'Admin Console',
};

// ================= SIDEBAR =================
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unread, setUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      if (!user || user.role !== 'student') return;

      const { data } = await studentAPI.getNotifications();
      const count = (data.notifications || []).filter(n => !n.is_read).length;

      setUnread(count);
    } catch {
      setUnread(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    fetchUnread();

    socket.emit('join', user.id);

    const handler = () => fetchUnread();

    socket.on('new_notification', handler);

    const interval = setInterval(fetchUnread, 10000);

    return () => {
      socket.off('new_notification', handler);
      clearInterval(interval);
    };
  }, [user, fetchUnread]);

  const navItems = NAV[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">StudentBridge</div>
        <div className="logo-sub">{ROLE_LABEL[user?.role]}</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>

        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon d={ICONS[item.icon]} />
            {item.label}

            {item.to === '/student/notifications' && unread > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'red',
                color: 'white',
                borderRadius: 10,
                fontSize: '0.65rem',
                padding: '2px 6px'
              }}>
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
  <div>{user?.email}</div>

  <button
    className="logout-btn"
    onClick={() => {
      logout();
      navigate('/login');
    }}
  >
    Logout
  </button>
</div>
    </aside>
  );
}
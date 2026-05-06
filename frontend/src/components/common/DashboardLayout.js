// components/common/DashboardLayout.js
import React from 'react';
import Sidebar from './Sidebar';

// Wraps every authenticated page with the sidebar layout
export default function DashboardLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './AppShell.css';

const tabs = [
  { path: '/',        label: 'Home',      icon: '🏠' },
  { path: '/tank',    label: 'Tank',      icon: '🐟' },
  { path: '/community', label: 'Community', icon: '👥' },
  { path: '/notes',   label: 'Notes',     icon: '📝' },
];

export default function AppShell() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="top-bar">
        <button className="avatar-button" onClick={() => setDrawerOpen(true)}>👤</button>
        <div className="logo">FishSNAP</div>
        <button className="bell-button">🔔</button>
      </header>

      {/* Simple drawer */}
      {drawerOpen && (
        <div className="drawer">
          <button onClick={() => setDrawerOpen(false)}>Close</button>
          <ul>
            <li><Link to="/plans">Subscription Plan</Link></li>
            <li><Link to="/diagnostics">Diagnostics</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><button>Sign out</button></li>
          </ul>
        </div>
      )}

      {/* Main content */}
      <main className="content">
        <Outlet />
      </main>

      {/* Bottom bar */}
      <nav className="bottom-bar">
        {tabs.map(tab => (
          <Link
            key={tab.path}
            to={tab.path}
            className={location.pathname === tab.path ? 'active' : ''}
          >
            <span>{tab.icon}</span>
            <small>{tab.label}</small>
          </Link>
        ))}
        {/* Center mic */}
        <button className="mic-button">🎤</button>
      </nav>
    </div>
  );
}

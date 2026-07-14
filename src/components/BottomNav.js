import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

function BottomNav({ user }) {
  return (
    <nav className="bottom-nav" aria-label="Main Bottom Navigation">
      {/* 🏠 Home Tab */}
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon" role="img" aria-label="home">🏠</span>
        <span className="nav-label">Home</span>
      </NavLink>

      {/* ➕ Post Tab (Protected Flow: Redirects non-authenticated traffic cleanly) */}
      <NavLink 
        to={user ? "/new" : "/signin"} 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon" role="img" aria-label="post">➕</span>
        <span className="nav-label">Post</span>
      </NavLink>

      {/* 👤 Profile Tab (Protected Flow: Directs straight to session validation if logged out) */}
      <NavLink 
        to={user ? "/profile" : "/signin"} 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon" role="img" aria-label="profile">👤</span>
        <span className="nav-label">Profile</span>
      </NavLink>

      {/* 📈 Dashboard Tab (Protected Flow: Only accessible when logged in) */}
      <NavLink 
        to={user ? "/dashboard" : "/signin"} 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon" role="img" aria-label="dashboard">📈</span>
        <span className="nav-label">Dashboard</span>
      </NavLink>

      {/* 🔔 Notifications Tab */}
      <NavLink 
        to={user ? "/notifications" : "/signin"} 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon" role="img" aria-label="notifications">🔔</span>
        <span className="nav-label">Notifications</span>
      </NavLink>

      {/* ⚙️ Settings Tab */}
      <NavLink 
        to={user ? "/settings" : "/signin"} 
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
      >
        <span className="nav-icon" role="img" aria-label="settings">⚙️</span>
        <span className="nav-label">Settings</span>
      </NavLink>
    </nav>
  );
}

export default BottomNav;
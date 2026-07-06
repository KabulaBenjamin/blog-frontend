import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <button onClick={() => navigate('/')}>🏠 Home</button>
      <button onClick={() => navigate('/new')}>➕ Post</button>
      <button onClick={() => navigate('/profile')}>👤 Profile</button>
      <button onClick={() => navigate('/notifications')}>🔔 Notifications</button>
      <button onClick={() => navigate('/settings')}>⚙️ Settings</button>
    </nav>
  );
}

export default BottomNav;

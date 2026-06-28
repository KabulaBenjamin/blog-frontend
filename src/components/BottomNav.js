import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function BottomNav({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bottom-nav">
      <button
        className={isActive('/') ? 'active' : ''}
        onClick={() => navigate('/')}
      >
        🏠
      </button>
      <button
        className={isActive('/search') ? 'active' : ''}
        onClick={() => navigate('/search')}
      >
        🔍
      </button>
      <button
        className={isActive('/notifications') ? 'active' : ''}
        onClick={() => navigate('/notifications')}
      >
        🔔
      </button>
      <button
        className={isActive('/profile') ? 'active' : ''}
        onClick={() => navigate('/profile')}
      >
        👤
      </button>
      {user && (
        <button onClick={handleLogout}>🚪 Logout</button>
      )}
      <button
        className="fab"
        onClick={() => navigate(user ? '/new' : '/profile')}
      >
        ＋
      </button>
    </div>
  );
}

export default BottomNav;

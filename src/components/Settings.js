import React, { useState, useEffect } from 'react';

function Settings({ user }) {
  // Simple Dark Mode State management
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'left' }}>
      <h2>Settings</h2>
      <hr />

      {/* Preferences Section */}
      <div style={{ margin: '20px 0' }}>
        <h3>Preferences</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={() => setDarkMode(!darkMode)} 
          />
          Enable Dark Mode
        </label>
      </div>

      {/* Account Management Section */}
      <div style={{ margin: '30px 0' }}>
        <h3>Account Management</h3>
        {user ? (
          <div>
            <p>Logged in as: <strong>{user.username}</strong></p>
            <button 
              onClick={() => alert('Change password feature coming soon!')}
              style={{ padding: '8px 12px', marginRight: '10px', cursor: 'pointer' }}
            >
              Change Password
            </button>
            <button 
              onClick={() => alert('Account deletion requested.')}
              style={{ padding: '8px 12px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Delete Account
            </button>
          </div>
        ) : (
          <p style={{ color: '#888' }}>Please sign in to view account settings.</p>
        )}
      </div>

      <hr />
      <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Koikoi Blog App — Version 1.0.0 (2026)</p>
    </div>
  );
}

export default Settings;
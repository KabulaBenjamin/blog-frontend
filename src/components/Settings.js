import React, { useState, useEffect } from 'react';

function Settings({ user, onLogoutSuccess }) {
  // Simple Dark Mode State management
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "⚠️ CRITICAL WARNING:\n\nAre you completely sure you want to permanently delete your account? This will wipe out all of your profile details and blog posts. This action cannot be undone."
    );

    if (!confirmation) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${window.location.origin}/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Your account has been successfully deleted.");
        // Execute callback to flush user state on the frontend and kick back to home/auth view
        if (typeof onLogoutSuccess === 'function') {
          onLogoutSuccess();
        } else {
          window.location.href = '/';
        }
      } else {
        alert(`Deletion failed: ${data.error || 'Unknown error error occured.'}`);
      }
    } catch (err) {
      console.error("Account deletion communication error:", err);
      alert("Network error: Could not complete account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

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
              disabled={isDeleting}
              style={{ padding: '8px 12px', marginRight: '10px', cursor: 'pointer' }}
            >
              Change Password
            </button>
            <button 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              style={{ 
                padding: '8px 12px', 
                backgroundColor: isDeleting ? '#cca3a3' : '#ff4d4d', 
                color: '#fff', 
                border: 'none', 
                cursor: isDeleting ? 'not-allowed' : 'pointer' 
              }}
            >
              {isDeleting ? 'Deleting Account...' : 'Delete Account'}
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
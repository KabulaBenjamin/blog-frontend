import React, { useState, useEffect } from 'react';

function Settings({ user, onLogoutSuccess, onSignedIn }) {
  // Simple Dark Mode State management
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // States for updating password when logged in
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // States for updating username when logged in
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Centralized backend API URL target
  const BACKEND_URL = 'https://blog-2y55.onrender.com';

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // 1. Log Out Handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' 
      });

      if (response.ok) {
        alert("Logged out cleanly.");
        if (typeof onLogoutSuccess === 'function') {
          onLogoutSuccess(); 
        } else {
          window.location.href = '/';
        }
      } else {
        alert("Failed to log out correctly.");
      }
    } catch (err) {
      console.error("Logout network failure:", err);
      alert("Error reaching server to log out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // 2. Account Deletion Handler
  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "⚠️ CRITICAL WARNING:\n\nAre you completely sure you want to permanently delete your account? This will wipe out all of your profile details and blog posts. This action cannot be undone."
    );

    if (!confirmation) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${BACKEND_URL}/delete-account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Your account has been successfully deleted.");
        if (typeof onLogoutSuccess === 'function') {
          onLogoutSuccess();
        } else {
          window.location.href = '/';
        }
      } else {
        alert(`Deletion failed: ${data.error || 'Unknown error occurred.'}`);
      }
    } catch (err) {
      console.error("Account deletion communication error:", err);
      alert("Network error: Could not complete account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 3. Logged-in Password Update Handler
  const handleChangePasswordDirectly = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    setIsUpdatingPassword(true);

    try {
      const tokenRes = await fetch(`${BACKEND_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(tokenData.error || 'Failed to initialize password updates.');
      }

      const resetRes = await fetch(`${BACKEND_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenData.token, newPassword })
      });
      const resetData = await resetRes.json();

      if (resetRes.ok) {
        setPasswordMessage('Password updated successfully!');
        setNewPassword('');
        setTimeout(() => setShowPasswordForm(false), 2000);
      } else {
        setPasswordError(resetData.error || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError(err.message || 'Network error updating credentials.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 4. Logged-in Username Update Handler
  const handleChangeUsernameDirectly = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameMessage('');
    setIsUpdatingUsername(true);

    try {
      const response = await fetch(`${BACKEND_URL}/change-username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername }),
        credentials: 'include'
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setUsernameMessage('Username updated perfectly!');
        setNewUsername('');
        
        // Sync local storage state
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Push state notification callback to App component context layer
        if (typeof onSignedIn === 'function') {
          onSignedIn(data.user);
        }
        
        setTimeout(() => setShowUsernameForm(false), 2000);
      } else {
        setUsernameError(data.error || 'Failed to alter identity username.');
      }
    } catch (err) {
      setUsernameError('Network communication drop updating identity parameters.');
    } finally {
      setIsUpdatingUsername(false);
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
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              
              <button 
                onClick={() => { setShowUsernameForm(!showUsernameForm); setShowPasswordForm(false); }}
                disabled={isDeleting || isLoggingOut}
                style={{ padding: '8px 12px', cursor: 'pointer' }}
              >
                {showUsernameForm ? 'Cancel Identity Change' : 'Change Username'}
              </button>

              <button 
                onClick={() => { setShowPasswordForm(!showPasswordForm); setShowUsernameForm(false); }}
                disabled={isDeleting || isLoggingOut}
                style={{ padding: '8px 12px', cursor: 'pointer' }}
              >
                {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
              </button>
              
              <button 
                onClick={handleLogout}
                disabled={isDeleting || isLoggingOut}
                style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#f0f0f0', 
                  color: '#333', 
                  border: '1px solid #ccc', 
                  cursor: (isDeleting || isLoggingOut) ? 'not-allowed' : 'pointer' 
                }}
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>

              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting || isLoggingOut}
                style={{ 
                  padding: '8px 12px', 
                  backgroundColor: isDeleting ? '#cca3a3' : '#ff4d4d', 
                  color: '#fff', 
                  border: 'none', 
                  cursor: (isDeleting || isLoggingOut) ? 'not-allowed' : 'pointer' 
                }}
              >
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </button>
            </div>

            {/* Inline Username Change Panel */}
            {showUsernameForm && (
              <form onSubmit={handleChangeUsernameDirectly} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', maxWidth: '350px', marginBottom: '15px' }}>
                <h4>Change Username</h4>
                {usernameError && <p style={{ color: 'red', fontSize: '14px' }}>⚠️ {usernameError}</p>}
                {usernameMessage && <p style={{ color: 'green', fontSize: '14px' }}>✅ {usernameMessage}</p>}
                <input 
                  type="text"
                  placeholder="Enter unique new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={isUpdatingUsername} style={{ padding: '6px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {isUpdatingUsername ? 'Updating...' : 'Save Username'}
                </button>
              </form>
            )}

            {/* Inline Password Change Panel */}
            {showPasswordForm && (
              <form onSubmit={handleChangePasswordDirectly} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', maxWidth: '350px' }}>
                <h4>Update Your Password</h4>
                {passwordError && <p style={{ color: 'red', fontSize: '14px' }}>⚠️ {passwordError}</p>}
                {passwordMessage && <p style={{ color: 'green', fontSize: '14px' }}>✅ {passwordMessage}</p>}
                <input 
                  type="password"
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={isUpdatingPassword} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {isUpdatingPassword ? 'Updating...' : 'Save Password'}
                </button>
              </form>
            )}
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
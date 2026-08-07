import React, { useState, useEffect } from 'react';

function Settings({ user, onLogoutSuccess, onSignedIn }) {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // States for updating password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // States for updating username
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

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

  const getAuthToken = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || storedUser.token;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = getAuthToken();
    try {
      const response = await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include' 
      });

      if (response.ok) {
        localStorage.removeItem('user');
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

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "⚠️ CRITICAL WARNING:\n\nAre you completely sure you want to permanently delete your account? This will wipe out all of your profile details and blog posts. This action cannot be undone."
    );

    if (!confirmation) return;

    setIsDeleting(true);
    const token = getAuthToken();

    try {
      const response = await fetch(`${BACKEND_URL}/delete-account`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        credentials: 'include'
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        localStorage.removeItem('user');
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

  const handleChangePasswordDirectly = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    setIsUpdatingPassword(true);

    const token = getAuthToken();

    try {
      const response = await fetch(`${BACKEND_URL}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ newPassword }),
        credentials: 'include'
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setPasswordMessage('Password updated successfully!');
        setNewPassword('');
        setTimeout(() => setShowPasswordForm(false), 2000);
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error("Password update error:", err);
      setPasswordError('Network error updating password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleChangeUsernameDirectly = async (e) => {
    e.preventDefault();
    setUsernameError('');
    setUsernameMessage('');
    setIsUpdatingUsername(true);

    const token = getAuthToken();

    try {
      const response = await fetch(`${BACKEND_URL}/change-username`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ newUsername }),
        credentials: 'include'
      });
      
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        setUsernameMessage('Username updated perfectly!');
        setNewUsername('');
        
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (typeof onSignedIn === 'function') {
          onSignedIn(data.user);
        }
        
        setTimeout(() => setShowUsernameForm(false), 2000);
      } else {
        if (response.status === 401) {
          setUsernameError('Session expired. Please log out and log back in.');
        } else {
          setUsernameError(data.error || 'Failed to alter identity username.');
        }
      }
    } catch (err) {
      console.error("Username update error:", err);
      setUsernameError('Network communication error updating username.');
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  return (
    <div className="container settings-container">
      <h2>Settings</h2>
      <hr className="divider" />

      {/* Preferences Section */}
      <div className="settings-section">
        <h3>Preferences</h3>
        <label className="toggle-label">
          <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={() => setDarkMode(!darkMode)} 
          />
          Enable Dark Mode
        </label>
      </div>

      {/* Account Management Section */}
      <div className="settings-section">
        <h3>Account Management</h3>
        {user ? (
          <div>
            <p>Logged in as: <strong>{user.username}</strong></p>
            <div className="settings-actions">
              <button 
                onClick={() => { setShowUsernameForm(!showUsernameForm); setShowPasswordForm(false); }}
                disabled={isDeleting || isLoggingOut}
                className="btn btn-secondary"
              >
                {showUsernameForm ? 'Cancel Identity Change' : 'Change Username'}
              </button>

              <button 
                onClick={() => { setShowPasswordForm(!showPasswordForm); setShowUsernameForm(false); }}
                disabled={isDeleting || isLoggingOut}
                className="btn btn-secondary"
              >
                {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
              </button>
              
              <button 
                onClick={handleLogout}
                disabled={isDeleting || isLoggingOut}
                className="btn btn-outline"
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>

              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting || isLoggingOut}
                className="btn btn-danger"
              >
                {isDeleting ? 'Deleting Account...' : 'Delete Account'}
              </button>
            </div>

            {/* Inline Username Change Panel */}
            {showUsernameForm && (
              <form onSubmit={handleChangeUsernameDirectly} className="settings-form">
                <h4>Change Username</h4>
                {usernameError && <p className="status-message error">⚠️ {usernameError}</p>}
                {usernameMessage && <p className="status-message success">✅ {usernameMessage}</p>}
                <input 
                  type="text"
                  placeholder="Enter unique new username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  className="form-input"
                />
                <button type="submit" disabled={isUpdatingUsername} className="btn btn-success">
                  {isUpdatingUsername ? 'Updating...' : 'Save Username'}
                </button>
              </form>
            )}

            {/* Inline Password Change Panel */}
            {showPasswordForm && (
              <form onSubmit={handleChangePasswordDirectly} className="settings-form">
                <h4>Update Your Password</h4>
                {passwordError && <p className="status-message error">⚠️ {passwordError}</p>}
                {passwordMessage && <p className="status-message success">✅ {passwordMessage}</p>}
                <input 
                  type="password"
                  placeholder="Enter new strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-input"
                />
                <button type="submit" disabled={isUpdatingPassword} className="btn btn-primary">
                  {isUpdatingPassword ? 'Updating...' : 'Save Password'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <p className="muted-text">Please sign in to view account settings.</p>
        )}
      </div>

      <hr className="divider" />
      <p className="footer-credits">Koikoi Blog App — Version 1.0.0 (2026)</p>
    </div>
  );
}

export default Settings;
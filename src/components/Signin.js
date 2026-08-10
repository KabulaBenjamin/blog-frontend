import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Signin({ onSignedIn }) {
  const [view, setView] = useState('signin'); // Modes: 'signin' | 'forgot' | 'reset'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  
  // Custom tracking state to hold the server token inside the UI layer safely
  const [uiGeneratedToken, setUiGeneratedToken] = useState('');

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    let endpoint = view;
    let body = {};

    if (view === 'signin') {
      body = { username, password };
    } else if (view === 'forgot') {
      endpoint = 'forgot-password';
      body = { username };
    } else if (view === 'reset') {
      endpoint = 'reset-password';
      body = { token, newPassword: password };
    }

    try {
      const res = await fetch(`https://blog-2y55.onrender.com/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include' // 🛡️ CRITICAL: Standard session cookie retention
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Authentication stage failed.');
        return;
      }

      if (view === 'signin') {
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // ☕ RESET SESSION BANNER SUPPRESSION ON LOGIN
          sessionStorage.removeItem('support_banner_dismissed_session');
          sessionStorage.removeItem('support_banner_dismissed');
          
          onSignedIn(data.user);
          window.location.href = '/';
        }
      } else if (view === 'forgot') {
        // Cache the token to render safely inside the form framework banner
        setUiGeneratedToken(data.token);
        setView('reset');
        setPassword(''); // clear to repurpose input for new password
      } else if (view === 'reset') {
        alert('Password updated successfully! You can now sign in.');
        setView('signin');
        setPassword('');
        setToken('');
        setUiGeneratedToken('');
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      alert('Server connectivity issue, please try again.');
    }
  };

  return (
    <div className="signin" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>
        {view === 'signin' && 'Sign In'}
        {view === 'forgot' && 'Recover Password'}
        {view === 'reset' && 'Set New Password'}
      </h2>

      <form onSubmit={handleAuthSubmit}>
        {/* Token Alert Banner Panel (Shows up on the Reset screen to provide copy-paste assurance) */}
        {view === 'reset' && uiGeneratedToken && (
          <div style={{ 
            background: '#fff3cd', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '1rem', 
            border: '1px solid #ffeeba',
            color: '#856404',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>🔑 <strong>Temporary Reset Token:</strong></p>
            <h3 style={{ margin: '0 0 4px 0', letterSpacing: '2px', fontSize: '1.4rem' }}>{uiGeneratedToken}</h3>
            <small style={{ fontSize: '0.8rem' }}>Copy this validation key code and paste it below.</small>
          </div>
        )}

        {/* Username Row Context */}
        {(view === 'signin' || view === 'forgot') && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        )}

        {/* Token Validation Row Context */}
        {view === 'reset' && (
          <input
            type="text"
            placeholder="Enter Reset Token"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        )}

        {/* Password Entry Row Context */}
        {(view === 'signin' || view === 'reset') && (
          <input
            type="password"
            placeholder={view === 'reset' ? 'Enter New Password' : 'Password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        )}

        <button type="submit" style={{ width: '100%', padding: '0.5rem', cursor: 'pointer' }}>
          {view === 'signin' && 'Sign In'}
          {view === 'forgot' && 'Request Reset'}
          {view === 'reset' && 'Update Password'}
        </button>
      </form>

      {/* Alternative Auth Option Navigation Anchors */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
        {view === 'signin' ? (
          <span style={{ color: '#0070f3', cursor: 'pointer' }} onClick={() => setView('forgot')}>
            Forgot Password?
          </span>
        ) : (
          <span style={{ color: '#666', cursor: 'pointer' }} onClick={() => { setView('signin'); setPassword(''); setUiGeneratedToken(''); }}>
            ← Back to Sign In
          </span>
        )}
      </div>

      {view === 'signin' && (
        <div className="auth-redirect" style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Don't have an account yet?</p>
          <Link to="/signup">
            <button style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: 'none', border: '1px solid #ccc', borderRadius: '4px' }}>
              Create Account
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Signin;
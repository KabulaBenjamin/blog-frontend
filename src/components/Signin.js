import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Signin({ onSignedIn }) {
  const [view, setView] = useState('signin'); // Context modes: 'signin' | 'forgot' | 'reset'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

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
        credentials: 'include' // 🛡️ CRITICAL: Standard session token allowance
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Authentication stage failed.');
        return;
      }

      if (view === 'signin') {
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.user));
          onSignedIn(data.user);
          window.location.href = '/';
        }
      } else if (view === 'forgot') {
        alert(`Token generated: ${data.token}\n\nCopy this token to complete validation step.`);
        setView('reset');
        setPassword(''); // clear to repurpose input for new password
      } else if (view === 'reset') {
        alert('Password updated successfully! You can now sign in.');
        setView('signin');
        setPassword('');
        setToken('');
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
        {/* Username Row Context */}
        {(view === 'signin' || view === 'forgot') && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
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
            style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
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
            style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
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
          <span style={{ color: '#666', cursor: 'pointer' }} onClick={() => { setView('signin'); setPassword(''); }}>
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
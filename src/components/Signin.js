import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Signin({ onSignedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://blog-2y55.onrender.com/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onSignedIn(data.user);
        window.location.href = '/';
      } else {
        alert(data.error || 'Signin failed');
      }
    } catch (err) {
      console.error('Signin error:', err);
      alert('Server error, please try again.');
    }
  };

  return (
    <div className="signin" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <button type="submit" style={{ width: '100%', padding: '0.5rem', cursor: 'pointer' }}>Sign In</button>
      </form>

      {/* Account Creation Onboarding Trigger */}
      <div className="auth-redirect" style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Don't have an account yet?</p>
        <Link to="/signup">
          <button style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: 'none', border: '1px solid #ccc', borderRadius: '4px' }}>
            Create Account
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Signin;
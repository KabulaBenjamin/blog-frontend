import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Signup({ onSignedUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://blog-2y55.onrender.com/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.id) {
        localStorage.setItem('user', JSON.stringify(data));
        onSignedUp(data);
        window.location.href = '/';
      } else {
        alert(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Server error, please try again.');
    }
  };

  return (
    <div className="signup" style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Sign Up</h2>
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
        <button type="submit" style={{ width: '100%', padding: '0.5rem', cursor: 'pointer' }}>Sign Up</button>
      </form>

      {/* Alternative Login Action Route Link */}
      <div className="auth-redirect" style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Already have an account?</p>
        <Link to="/signin">
          <button style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: 'none', border: '1px solid #ccc', borderRadius: '4px' }}>
            Sign In Instead
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Signup;
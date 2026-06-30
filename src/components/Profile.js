import React, { useState, useEffect } from 'react';

function Profile({ user, setUser }) {
  const [mode, setMode] = useState(null); // "signin" or "signup"
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Auto-fetch user details if logged in
  useEffect(() => {
    if (user) {
      fetch(`https://blog-2y55.onrender.com/me/${user.id}`)
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => console.error('Fetch /me error:', err));
    }
  }, [user, setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === 'signin' ? '/signin' : '/signup';
      const res = await fetch(`https://blog-2y55.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success || data.id) {
        const loggedUser = data.user || data;
        setUser(loggedUser);
        window.location.href = '/new';
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Profile error:', err);
      alert('Server error, please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (user) {
    return (
      <div className="profile">
        <h2>Welcome, {user.username}</h2>
        <p>User ID: {user.id}</p>
        <button onClick={() => window.location.href = '/new'}>Create a Post</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="profile">
      <h2>Profile</h2>

      {!mode && (
        <div className="profile-options">
          <button onClick={() => setMode('signin')}>Sign In</button>
          <button onClick={() => setMode('signup')}>Create Account</button>
        </div>
      )}

      {mode && (
        <form onSubmit={handleSubmit}>
          <h3>{mode === 'signin' ? 'Sign In' : 'Create Account'}</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Continue</button>
          <button type="button" onClick={() => setMode(null)}>Back</button>
        </form>
      )}
    </div>
  );
}

export default Profile;

import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';

function Profile({ user }) {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total_likes: 0, total_comments: 0, total_posts: 0 });

  useEffect(() => {
    if (!user) return;

    // Fetch user's posts
    fetch(`https://blog-2y55.onrender.com/users/${user.id}/posts`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Failed to fetch user posts:', err));

    // Fetch user's stats
    fetch(`https://blog-2y55.onrender.com/users/${user.id}/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch user stats:', err));
  }, [user]);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    try {
      const res = await fetch('https://blog-2y55.onrender.com/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        alert('Logout parsing failed.');
      }
    } catch (err) {
      console.error('Logout error:', err);
      alert('Error communicating with logout engine.');
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm('⚠️ WARNING: Are you absolutely sure you want to delete your account? This will permanently erase your profile and all your posts.');
    if (!firstConfirm) return;

    const secondConfirm = window.confirm('🔴 FINAL WARNING: This action CANNOT be undone. Proceed with permanent deletion?');
    if (!secondConfirm) return;

    try {
      const res = await fetch('https://blog-2y55.onrender.com/delete-account', {
        method: 'DELETE',
        credentials: 'include' // 🛡️ Necessary to pass validation cookie details to backend context
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('Your account has been permanently removed.');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirect home as guest
      } else {
        alert(data.error || 'Failed to delete account.');
      }
    } catch (err) {
      console.error('Account deletion error:', err);
      alert('Error communicating with the server.');
    }
  };

  if (!user) return <p style={{ padding: '1rem', textAlign: 'center' }}>Please log in to view your profile.</p>;

  return (
    <div className="profile" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2>{user.username}'s Profile</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleLogout} 
            style={{ background: '#666', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Log Out
          </button>
          <button 
            onClick={handleDeleteAccount} 
            style={{ background: '#ff0000', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Delete Account
          </button>
        </div>
      </div>

      <div className="stats" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
        <p>Total Posts: {stats.total_posts}</p>
        <p>Total Likes: {stats.total_likes}</p>
        <p>Total Comments: {stats.total_comments}</p>
      </div>

      <div className="user-posts">
        <h3>Your Published Content</h3>
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onUpdated={(updated) => setPosts(posts.map(p => p.id === updated.id ? updated : p))}
              onDeleted={(id) => setPosts(posts.filter(p => p.id !== id))}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Profile;
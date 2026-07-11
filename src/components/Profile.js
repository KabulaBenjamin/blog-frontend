import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';

function Profile({ user, setActiveTab }) {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total_likes: 0, total_comments: 0, total_posts: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Fetch user's posts securely
    fetch(`https://blog-2y55.onrender.com/users/${user.id}/posts`, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          // If 404 or empty account record, return fallback array instead of crashing
          return [];
        }
        return res.json();
      })
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(err => {
        console.warn('Handling empty post profile fallback:', err);
        setPosts([]);
      });

    // Fetch user's stats securely
    fetch(`https://blog-2y55.onrender.com/users/${user.id}/stats`, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          // Default data profile if backend route doesn't exist yet
          return { total_likes: 0, total_comments: 0, total_posts: 0 };
        }
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => {
        console.warn('Handling empty stats profile fallback:', err);
        setStats({ total_likes: 0, total_comments: 0, total_posts: 0 });
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  // Fallback state if no user session is detected
  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#666', marginBottom: '10px' }}>Please log in to view your profile dashboard.</p>
        <button 
          onClick={() => {
            if (typeof setActiveTab === 'function') {
              setActiveTab('signin');
            } else {
              window.location.href = '/login';
            }
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Sign In Page
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading metrics...</div>;
  }

  return (
    <div className="profile" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{user.username}'s Profile</h2>
      </div>

      {/* Analytics Dashboard Matrix */}
      <div className="stats" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '6px', margin: '1rem 0', color: '#333' }}>
        <p>Total Posts: <strong>{stats.total_posts || 0}</strong></p>
        <p>Total Likes: <strong>{stats.total_likes || 0}</strong></p>
        <p>Total Comments: <strong>{stats.total_comments || 0}</strong></p>
      </div>

      <div className="user-posts">
        <h3>Your Published Content</h3>
        {posts.length === 0 ? (
          <p style={{ color: '#888' }}>No posts published yet. Go ahead and write your first blog post!</p>
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
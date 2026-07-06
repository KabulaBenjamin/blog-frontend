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

  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="profile">
      <h2>{user.username}'s Profile</h2>
      <div className="stats">
        <p>Total Posts: {stats.total_posts}</p>
        <p>Total Likes: {stats.total_likes}</p>
        <p>Total Comments: {stats.total_comments}</p>
      </div>
      <div className="user-posts">
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

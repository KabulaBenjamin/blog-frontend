import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';

function Home() {
  const [posts, setPosts] = useState([]);

  // Always fetch posts fresh from backend
  const refreshPosts = async () => {
    try {
      const res = await fetch('https://blog-2y55.onrender.com/posts');
      const data = await res.json();
      setPosts(data);
      // Clear any stale local cache
      localStorage.removeItem('posts');
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Refresh from backend to avoid phantom posts
        refreshPosts();
      } else {
        console.error('Delete failed:', await res.json());
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="home">
      <h2>Latest Posts</h2>
      {posts.map(post => (
        <div key={post.id} className="post">
          <h3>{post.title}</h3>
          <p><strong>By:</strong> {post.username}</p>
          {/* Render Quill content beautifully in read-only mode */}
          <ReactQuill value={post.content} readOnly={true} theme="bubble" />
          <button onClick={() => handleDelete(post.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Home;

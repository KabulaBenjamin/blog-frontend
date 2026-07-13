import React, { useEffect, useState } from 'react';
import PostCard from './PostCard';

function Home({ user }) {
  const [posts, setPosts] = useState([]);

  const refreshPosts = async () => {
    try {
      const res = await fetch('https://blog-2y55.onrender.com/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const handleUpdated = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleDeleted = (id) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="home">
      <h2>Latest Posts</h2>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          user={user}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          isFeedMode={true} /* 💡 Tell the card it's sitting inside the main feed list */
        />
      ))}
    </div>
  );
}

export default Home;
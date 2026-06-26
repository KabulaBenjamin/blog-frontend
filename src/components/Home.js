import React from 'react';
import PostCard from './PostCard';

function Home({ posts, onUpdated, onDeleted }) {
  return (
    <main>
      {posts.length === 0 ? (
        <p>Loading posts...</p>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        ))
      )}
    </main>
  );
}

export default Home;

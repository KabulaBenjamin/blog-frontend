import React, { useEffect, useState } from 'react';
import './App.css';
import PostCard from './components/PostCard';
import NewPost from './components/NewPost';
import Signup from './components/Signup';
import Signin from './components/Signin';

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('https://blog-2y55.onrender.com/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts(posts.filter(p => p.id !== deletedId));
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Koikoi Blog</h1>
      </header>
      <main>
        {!user ? (
          <div className="auth-section">
            <Signup onSignup={setUser} />
            <Signin onSignin={setUser} />
          </div>
        ) : (
          <NewPost onPostCreated={handlePostCreated} user={user} />
        )}

        <section className="feed">
          {posts.length === 0 ? (
            <p>No posts yet. Be the first to share!</p>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                onUpdated={handlePostUpdated}
                onDeleted={handlePostDeleted}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

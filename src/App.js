import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Profile from './components/Profile';
import NewPost from './components/NewPost';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    fetch('https://blog-2y55.onrender.com/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Fetch posts error:', err));
  }, []);

  const handleCreated = (post) => {
    setPosts([post, ...posts]);
  };

  const handleDeleted = async (id) => {
    try {
      await fetch(`https://blog-2y55.onrender.com/posts/${id}`, { method: 'DELETE' });
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  const handleUpdated = async (post) => {
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      const data = await res.json();
      setPosts(posts.map(p => p.id === post.id ? data : p));
    } catch (err) {
      console.error('Update post error:', err);
    }
  };

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home posts={posts} onDeleted={handleDeleted} onUpdated={handleUpdated} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="/new" element={<NewPost user={user} onCreated={handleCreated} />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;

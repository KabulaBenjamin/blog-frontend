import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Search from './components/Search';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import NewPost from './components/NewPost';
import BottomNav from './components/BottomNav';

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('https://blog-2y55.onrender.com/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

  const handleUpdated = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleDeleted = (id) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>My Blog</h1>
        </header>

        <Routes>
          <Route path="/" element={<Home posts={posts} onUpdated={handleUpdated} onDeleted={handleDeleted} />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/new" element={<NewPost user={{id: 1}} onCreated={handleCreated} />} />
        </Routes>

        {/* Bottom navigation bar */}
        <BottomNav />

        {/* Floating action button for New Post */}
        <button className="fab" onClick={() => window.location.href = '/new'}>＋</button>
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import './App.css';
import PostCard from './components/PostCard';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Profile from './components/Profile';
import QuillEditor from './components/QuillEditor';
import Loader from './components/Loader';

// Dynamic components directory routes
import Signin from './components/Signin';
import Signup from './components/Signup';
import Search from './components/Search';
import Notifications from './components/Notifications';
import About from './components/About';
import Contact from './components/Contact';
import Terms from './components/Terms';
import PrivacyPolicy from './components/PrivacyPolicy';

import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';

function EditWrapper({ user, onSaved }) {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://blog-2y55.onrender.com/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch post:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Loader />;
  if (!post) return <p>Post not found.</p>;

  return <QuillEditor post={post} user={user} onSaved={onSaved} />;
}

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);

  // Core synchronous updating hooks
  const handleUpdated = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handleDeleted = (id) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
  };

  const handleSaved = (savedPost) => {
    setPosts(prevPosts => {
      const exists = prevPosts.find(p => p.id === savedPost.id);
      if (exists) {
        return prevPosts.map(p => p.id === savedPost.id ? savedPost : p);
      } else {
        return [savedPost, ...prevPosts];
      }
    });
  };

  useEffect(() => {
    // 1. Core HTTP Feed Hydration
    fetch('https://blog-2y55.onrender.com/posts')
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setPosts([]);
      });

    // 2. Auth state hydration
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 3. Fixed WebSocket connection without /ws route parameter for stable Render proxying
    const ws = new WebSocket('wss://blog-2y55.onrender.com');

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.action) {
          case 'CREATE':
            setPosts(prev => [message.post, ...prev]);
            break;
          case 'UPDATE':
            setPosts(prev => prev.map(p => p.id === message.post.id ? message.post : p));
            break;
          case 'DELETE':
            setPosts(prev => prev.filter(p => p.id !== message.id));
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('WebSocket parsing error:', err);
      }
    };

    ws.onerror = (error) => console.error('WebSocket Error:', error);
    
    return () => {
      ws.close();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <header className="header">
          <h1>Koikoi Blog</h1>
        </header>
        
        <main>
          <Routes>
            {/* Core Feed Route */}
            <Route
              path="/"
              element={
                <div>
                  {Array.isArray(posts) && posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      onUpdated={handleUpdated}
                      onDeleted={handleDeleted}
                    />
                  ))}
                </div>
              }
            />

            {/* Application Views */}
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications user={user} />} />
            
            {/* Post Modifiers */}
            <Route path="/new" element={<QuillEditor user={user} onSaved={handleSaved} />} />
            <Route path="/edit/:id" element={<EditWrapper user={user} onSaved={handleSaved} />} />

            {/* Authentication Routing */}
            <Route path="/signin" element={<Signin setUser={setUser} />} />
            <Route path="/signup" element={<Signup setUser={setUser} />} />

            {/* Legal Footers */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        
        <BottomNav user={user} />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
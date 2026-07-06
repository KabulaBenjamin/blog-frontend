import React, { useEffect, useState, useRef } from 'react';
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
  
  // Track active connection state across React Dev re-renders
  const wsRef = useRef(null);

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
    // 1. Initial HTTP Fetch for Posts
    fetch('https://blog-2y55.onrender.com/posts')
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err);
        setPosts([]);
      });

    // 2. Hydrate Auth State
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 3. Resilient Singleton WebSocket Loop
    let reconnectTimeout;

    const connectWebSocket = () => {
      // Avoid spinning up duplicate sockets if one is already connecting/connected
      if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
        return;
      }

      const ws = new WebSocket('wss://blog-2y55.onrender.com');
      wsRef.current = ws;

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

      ws.onclose = (e) => {
        // Clean up tracking reference
        wsRef.current = null;
        console.log(`🔌 WebSocket connection dropped (${e.reason || 'No reason specified'}). Retrying in 5s...`);
        
        reconnectTimeout = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error registered:', error);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        // Prevent reconnect loops from firing during unmount
        wsRef.current.onclose = null; 
        wsRef.current.close();
        wsRef.current = null;
      }
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

            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications user={user} />} />
            
            <Route path="/new" element={<QuillEditor user={user} onSaved={handleSaved} />} />
            <Route path="/edit/:id" element={<EditWrapper user={user} onSaved={handleSaved} />} />

            <Route path="/signin" element={<Signin setUser={setUser} />} />
            <Route path="/signup" element={<Signup setUser={setUser} />} />

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
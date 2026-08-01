import React, { useEffect, useState, useRef } from 'react';
import './App.css';

// 🎨 Import logo directly so Webpack bundles it cleanly
import logo from './logo.png';

import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Profile from './components/Profile';
import QuillEditor from './components/QuillEditor';
import Loader from './components/Loader';
import BackendLoader from './components/BackendLoader'; 
import ErrorBoundary from './components/ErrorBoundary';

// Global Consent Layer
import CookieConsent from './components/CookieConsent'; 

// Dynamic components directory routes
import Signin from './components/Signin';
import Signup from './components/Signup';
import Search from './components/Search';
import Notifications from './components/Notifications';
import About from './components/About';
import Contact from './components/Contact';
import Terms from './components/Terms';
import PrivacyPolicy from './components/PrivacyPolicy';
import Settings from './components/Settings';

// New Feature Views
import Home from './pages/Home';              // 🏠 New structured Home layout
import Dashboard from './pages/Dashboard';    // 📊 New publisher analytics dashboard
import AdminDashboard from './pages/AdminDashboard'; // 👑 Superuser control center
import PostDetail from './pages/PostDetail';  // 📝 Dedicated single post details page

// Added Navigate here to protect client-side routes gracefully
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';

// Wrapper to handle pulling single posts safely for the text editor lifecycle
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
  
  // ⏳ New initial loading states for cold starts
  const [loading, setLoading] = useState(true);
  const [isColdStart, setIsColdStart] = useState(false);

  // Persistent reference to track a singular active WebSocket instance across re-renders
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

  // Explicit helper to handle custom logging out wipes cleanly
  const handleLogoutSuccess = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    // ⏲️ If backend fetch takes more than 3.5s, trigger the cold start wake-up state
    const coldStartTimer = setTimeout(() => {
      setIsColdStart(true);
    }, 3500);

    // 1. Initial HTTP Fetch for Core Posts Feed
    fetch('https://blog-2y55.onrender.com/posts')
      .then(res => res.json())
      .then(data => {
        clearTimeout(coldStartTimer);
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        clearTimeout(coldStartTimer);
        console.error('Initial feed load failure:', err);
        setPosts([]);
        setLoading(false);
      });

    // 2. Local Authentication Hydration
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 3. Resilient WebSocket Handshake Lifecycle Loop
    let reconnectTimeout;

    const connectWebSocket = () => {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
        return;
      }

      try {
        const ws = new WebSocket('wss://blog-2y55.onrender.com/websocket');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('✅ Connected to WebSocket server');
        };

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
          wsRef.current = null;
          console.warn(`🔌 WebSocket sleeping or disconnected (${e.reason || 'Server cold start'}). Retrying in 15s...`);
          
          reconnectTimeout = setTimeout(() => {
            connectWebSocket();
          }, 15000);
        };

        ws.onerror = () => {
          if (ws.readyState !== WebSocket.CLOSED) {
            ws.close();
          }
        };
      } catch (err) {
        console.warn('WebSocket connection attempt failed (backend may be sleeping).');
      }
    };

    connectWebSocket();

    return () => {
      clearTimeout(coldStartTimer);
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null; 
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <Router>
      <ErrorBoundary> 
        <div className="App">
          {/* 🖼️ Clean, imported logo in header */}
          <header className="header">
            <div className="header-brand">
              <img 
                src={logo} 
                alt="Koikoi Blog Logo" 
                className="header-logo" 
              />
              <h1>Koikoi Blog</h1>
            </div>
          </header>
          
          <main>
            {/* 🌟 Handle cold starts and initial fetch smoothly */}
            {loading ? (
              <BackendLoader isColdStart={isColdStart} />
            ) : (
              <Routes>
                {/* Core Feed Route */}
                <Route path="/" element={<Home user={user} posts={posts} />} />

                {/* 📝 Dedicated Single Post Details View Route */}
                <Route path="/posts/:id" element={<PostDetail user={user} />} />

                {/* 📊 Publisher Analytics Workstation Dashboard Route */}
                <Route 
                  path="/dashboard" 
                  element={
                    user ? (
                      <Dashboard user={user} />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  } 
                />

                {/* 👑 Superuser Control Dashboard Route (Protected) */}
                <Route 
                  path="/admin" 
                  element={
                    user && (user.username === 'Blog_Admin' || user.role === 'admin') ? (
                      <AdminDashboard user={user} />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  } 
                />

                {/* Application Feature Routes */}
                <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
                <Route path="/notifications" element={<Notifications user={user} />} />
                
                {/* 🛠️ Identity Updates and State synchronization */}
                <Route 
                  path="/settings" 
                  element={
                    <Settings 
                      user={user} 
                      onLogoutSuccess={handleLogoutSuccess} 
                      onSignedIn={setUser} 
                    />
                  } 
                />
                
                {/* High-Efficiency Search matching structural prop criteria */}
                <Route 
                  path="/search" 
                  element={
                    <Search 
                      user={user} 
                      onUpdated={handleUpdated} 
                      onDeleted={handleDeleted} 
                    />
                  } 
                />
                
                {/* Editor Content Pipelines */}
                <Route 
                  path="/new" 
                  element={
                    user ? (
                      <QuillEditor user={user} onSaved={handleSaved} />
                    ) : (
                      <Navigate to="/signin" replace />
                    )
                  } 
                />
                <Route path="/edit/:id" element={<EditWrapper user={user} onSaved={handleSaved} />} />

                {/* Authentication Nodes */}
                <Route path="/signin" element={<Signin onSignedIn={setUser} />} />
                <Route path="/signup" element={<Signup onSignedUp={setUser} />} />

                {/* Static Legal Disclosures & App Context Pages */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
              </Routes>
            )}
          </main>
          
          {/* Navigational Anchors */}
          <BottomNav user={user} />
          <Footer />
          
          {/* Global Modal/Banner Overlays */}
          <CookieConsent /> 
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
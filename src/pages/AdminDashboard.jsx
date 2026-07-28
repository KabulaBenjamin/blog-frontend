// File Location: src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';

export default function AdminDashboard({ user }) {
  const [data, setData] = useState({ summary: {}, users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    
    // Retrieve token from localStorage if present
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.token) {
          headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      } catch (e) {}
    }
    return headers;
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch('https://blog-2y55.onrender.com/api/admin/dashboard', {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Access denied: You must be logged in as Blog_Admin to view this dashboard.');
        }
        throw new Error(`Failed to load superuser panel (HTTP ${res.status})`);
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Admin Panel Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}" and all their posts?`)) return;
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (res.ok) fetchAdminData();
      else alert('Failed to delete user.');
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/api/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (res.ok) fetchAdminData();
      else alert('Failed to delete post.');
    } catch (err) {
      alert('Error deleting post');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>👑 Authenticating Superuser Rights...</h2>
        <p style={{ color: '#718096' }}>Loading aggregate metrics and account lists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#e53e3e', fontFamily: 'sans-serif' }}>
        <h2>Access Restricted</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#1a202c', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        👑 Superuser Command Dashboard
      </h1>

      {/* Global Platform Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', margin: '20px 0' }}>
        <div style={{ background: '#ebf8ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3182ce' }}>
          <h3 style={{ margin: 0, color: '#2b6cb0', fontSize: '14px' }}>Total Registered Users</h3>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>{data.summary.total_users || 0}</h2>
        </div>
        <div style={{ background: '#f0fff4', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #38a169' }}>
          <h3 style={{ margin: 0, color: '#276749', fontSize: '14px' }}>Total Platform Articles</h3>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>{data.summary.total_posts || 0}</h2>
        </div>
        <div style={{ background: '#faf5ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #805ad5' }}>
          <h3 style={{ margin: 0, color: '#553c9a', fontSize: '14px' }}>Total Platform Views</h3>
          <h2 style={{ margin: '8px 0 0 0', fontSize: '2rem' }}>{parseInt(data.summary.total_views || 0, 10).toLocaleString()}</h2>
        </div>
      </div>

      {/* User Management Section */}
      <h2 style={{ marginTop: '40px', color: '#2d3748' }}>👥 Platform Accounts Management</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', marginTop: '10px', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Username</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>Posts</th>
              <th style={{ padding: '12px' }}>Total Views</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data.users || []).map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.username}</td>
                <td style={{ padding: '12px' }}>{u.email || 'N/A'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    background: u.role === 'admin' || u.username === 'Blog_Admin' ? '#feebc8' : '#e2e8f0',
                    color: u.role === 'admin' || u.username === 'Blog_Admin' ? '#744210' : '#4a5568',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {u.username === 'Blog_Admin' ? 'SUPERUSER' : (u.role || 'user')}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{u.post_count || 0}</td>
                <td style={{ padding: '12px' }}>{parseInt(u.total_views || 0, 10).toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {u.username !== 'Blog_Admin' && (
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete Account
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Post Moderation Section */}
      <h2 style={{ marginTop: '40px', color: '#2d3748' }}>📝 Global Content Moderation</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', marginTop: '10px', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Title</th>
              <th style={{ padding: '12px' }}>Author</th>
              <th style={{ padding: '12px' }}>Views</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data.posts || []).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{p.title}</td>
                <td style={{ padding: '12px', color: '#4a5568' }}>{p.author || 'Unknown'}</td>
                <td style={{ padding: '12px' }}>{(parseInt(p.views, 10) || 0).toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDeletePost(p.id)}
                    style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Post
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
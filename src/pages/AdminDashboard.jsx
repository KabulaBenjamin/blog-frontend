// File Location: src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [data, setData] = useState({ summary: {}, users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('https://blog-2y55.onrender.com/api/admin/dashboard', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Unauthorized or failed to load superuser panel');
      const result = await res.json();
      setData(result);
    } catch (err) {
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
        credentials: 'include'
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/api/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchAdminData();
    } catch (err) {
      alert('Error deleting post');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Superuser Control Center...</div>;
  if (error) return <div style={{ padding: '40px', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#1a202c', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        👑 Superuser Command Dashboard
      </h1>

      {/* Global Platform Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', margin: '20px 0' }}>
        <div style={{ background: '#ebf8ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3182ce' }}>
          <h3>Total Users</h3>
          <h2>{data.summary.total_users || 0}</h2>
        </div>
        <div style={{ background: '#f0fff4', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #38a169' }}>
          <h3>Total Posts</h3>
          <h2>{data.summary.total_posts || 0}</h2>
        </div>
        <div style={{ background: '#faf5ff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #805ad5' }}>
          <h3>Total Platform Views</h3>
          <h2>{parseInt(data.summary.total_views || 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* User Management Section */}
      <h2 style={{ marginTop: '40px' }}>👥 Platform Accounts Management</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', marginTop: '10px' }}>
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
          {data.users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.username}</td>
              <td style={{ padding: '12px' }}>{u.email || 'N/A'}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  background: u.role === 'admin' ? '#feebc8' : '#e2e8f0',
                  color: u.role === 'admin' ? '#744210' : '#4a5568',
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px' 
                }}>
                  {u.role || 'user'}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{u.post_count}</td>
              <td style={{ padding: '12px' }}>{parseInt(u.total_views).toLocaleString()}</td>
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

      {/* Post Moderation Section */}
      <h2 style={{ marginTop: '40px' }}>📝 Global Content Moderation</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', marginTop: '10px' }}>
        <thead>
          <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Title</th>
            <th style={{ padding: '12px' }}>Author</th>
            <th style={{ padding: '12px' }}>Views</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.posts.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>{p.title}</td>
              <td style={{ padding: '12px' }}>{p.author || 'Unknown'}</td>
              <td style={{ padding: '12px' }}>{p.views}</td>
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
  );
}
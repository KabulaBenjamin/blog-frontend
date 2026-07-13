// File Location: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import AnalyticsChart from '../components/AnalyticsChart';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ summary: { totalViews: 0, totalPosts: 0 }, timeline: [], posts: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://blog-2y55.onrender.com/api/analytics/dashboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } // fits fallback state models
    })
      .then(res => res.json())
      .then(data => { if (!data.error) setMetrics(data); })
      .catch(err => console.error('Metrics fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><h3>Compiling data summary layers...</h3></div>;

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px' }}>Publisher Workstation Dashboard</h2>
      
      {/* Overview Analytics Row widgets cards metrics blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '14px', color: '#718096', fontWeight: '500' }}>TOTAL VIEWS</span>
          <h1 style={{ margin: '8px 0 0 0', color: '#007bff', fontSize: '2.5rem' }}>{metrics.summary.totalViews.toLocaleString()}</h1>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '14px', color: '#718096', fontWeight: '500' }}>PUBLISHED CONTENT</span>
          <h1 style={{ margin: '8px 0 0 0', color: '#2d3748', fontSize: '2.5rem' }}>{metrics.summary.totalPosts}</h1>
        </div>
      </div>

      {/* Traffic analytics timeline chart display component */}
      <AnalyticsChart data={metrics.timeline} />

      {/* Individual list metrics table module management */}
      <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Content Breakdown Performance</h3>
      <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', color: '#4a5568' }}>Article Title</th>
              <th style={{ padding: '12px 16px', color: '#4a5568' }}>Published Date</th>
              <th style={{ padding: '12px 16px', color: '#4a5568', textAlign: 'right' }}>Unique Views</th>
            </tr>
          </thead>
          <tbody>
            {metrics.posts.length === 0 ? (
              <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#a0aec0' }}>No articles published yet.</td></tr>
            ) : (
              metrics.posts.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1a202c' }}>{post.title}</td>
                  <td style={{ padding: '12px 16px', color: '#718096' }}>{new Date(post.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#007bff', textAlign: 'right' }}>{post.views}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

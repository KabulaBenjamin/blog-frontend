// File Location: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import AnalyticsChart from '../components/AnalyticsChart';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ 
    summary: { totalViews: 0, totalPosts: 0 }, 
    timeline: [], 
    posts: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches aggregate data from your live backend using cookie credentials
    fetch('https://blog-2y55.onrender.com/api/analytics/dashboard', {
      method: 'GET',
      credentials: 'include', // Ensures HttpOnly cookie auth session is included
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => { 
        if (data && !data.error) {
          setMetrics({
            summary: {
              totalViews: data.summary?.totalViews || 0,
              totalPosts: data.summary?.totalPosts || 0
            },
            timeline: data.timeline || [],
            posts: data.posts || []
          });
        } 
      })
      .catch(err => console.error('Metrics fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h3>Compiling data summary layers...</h3>
      </div>
    );
  }

  // Safe destructuring fallbacks
  const totalViews = metrics.summary?.totalViews || 0;
  const totalPosts = metrics.summary?.totalPosts || 0;
  const postsList = metrics.posts || [];

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.8rem', color: '#1a202c' }}>
        Publisher Workstation Dashboard
      </h2>
      
      {/* Overview Stats Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        {/* Card 1: Total Unique Views */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
        }}>
          <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            TOTAL UNIQUE VIEWS
          </span>
          <h1 style={{ margin: '8px 0 0 0', color: '#007bff', fontSize: '2.5rem', fontWeight: '800' }}>
            {totalViews.toLocaleString()}
          </h1>
        </div>

        {/* Card 2: Total Posts Written */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
        }}>
          <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'bold', letterSpacing: '0.05em' }}>
            PUBLISHED CONTENT
          </span>
          <h1 style={{ margin: '8px 0 0 0', color: '#2d3748', fontSize: '2.5rem', fontWeight: '800' }}>
            {totalPosts}
          </h1>
        </div>
      </div>

      {/* Traffic analytics timeline line/bar chart component */}
      <AnalyticsChart data={metrics.timeline || []} />

      {/* Content performance details breakdown */}
      <h3 style={{ marginTop: '30px', marginBottom: '15px', fontSize: '1.3rem', color: '#2d3748' }}>
        Content Breakdown Performance
      </h3>
      
      <div style={{ 
        overflowX: 'auto', 
        background: 'white', 
        borderRadius: '8px', 
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', color: '#4a5568', fontWeight: '600' }}>Article Title</th>
              <th style={{ padding: '12px 16px', color: '#4a5568', fontWeight: '600' }}>Published Date</th>
              <th style={{ padding: '12px 16px', color: '#4a5568', fontWeight: '600', textAlign: 'right' }}>Unique Views</th>
            </tr>
          </thead>
          <tbody>
            {postsList.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#a0aec0' }}>
                  No articles published yet. Write something to see your metrics!
                </td>
              </tr>
            ) : (
              postsList.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '500', color: '#1a202c' }}>
                    {post.title}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#718096' }}>
                    {post.created_at ? new Date(post.created_at).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </td>
                  <td style={{ 
                    padding: '14px 16px', 
                    fontWeight: 'bold', 
                    color: '#007bff', 
                    textAlign: 'right',
                    fontSize: '16px' 
                  }}>
                    {(parseInt(post.views) || 0).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
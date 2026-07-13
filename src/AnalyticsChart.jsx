// File Location: src/components/AnalyticsChart.jsx
import React from 'react';

export default function AnalyticsChart({ data }) {
  if (!data || data.length === 0) return null;
  
  const maxViews = Math.max(...data.map(d => d.views), 5); // caps bottom frame layout range

  return (
    <div style={{ background: 'var(--card-bg, white)', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Traffic Velocity (Last 7 Days)</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}>
        {data.map((item, index) => {
          const heightPercentage = (item.views / maxViews) * 100;
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568', marginBottom: '4px' }}>{item.views}</span>
              <div style={{ width: '100%', height: `${heightPercentage}%`, background: '#007bff', borderRadius: '4px 4px 0 0', minHeight: '4px', transition: 'height 0.3s ease' }}></div>
              <span style={{ fontSize: '11px', color: '#718096', marginTop: '8px', transform: 'rotate(-30deg)', whiteSpace: 'nowrap' }}>{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
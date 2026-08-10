import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReadingTracker({ userId, postId }) {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // Color coding logic based on progress percentage
  const getProgressColor = (pct) => {
    if (pct < 35) return '#f59e0b'; // Amber / Starting
    if (pct < 80) return '#2563eb'; // Blue / In progress
    return '#16a34a';             // Green / Near completion
  };

  useEffect(() => {
    if (!postId) return;

    // 1. Restore scroll position on mount
    if (userId) {
      fetch(`https://blog-2y55.onrender.com/api/user/reading-progress/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.postId === postId && data.scrollPercentage) {
            const scrollTarget = (document.documentElement.scrollHeight - window.innerHeight) * (data.scrollPercentage / 100);
            window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          }
        })
        .catch(err => console.error('Failed to load scroll position:', err));
    }

    // 2. Track scroll state live & send batch update on unload
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(100);
        return;
      }
      const scrollPercentage = Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100)));
      setProgress(scrollPercentage);
    };

    const saveProgressOnUnload = () => {
      if (!userId) return;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const scrollPercentage = Math.round((window.scrollY / totalHeight) * 100);

      fetch('https://blog-2y55.onrender.com/api/user/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, postId, scrollPercentage })
      }).catch(() => {});
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', saveProgressOnUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveProgressOnUnload);
    };
  }, [userId, postId]);

  const activeColor = getProgressColor(progress);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 999,
      background: '#0f172a',
      color: '#ffffff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
    }}>
      {/* Top Banner Control Row */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '8px 16px',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: activeColor,
            transition: 'background-color 0.3s ease'
          }} />
          <span><strong>{progress}%</strong> Read</span>
        </div>

        <button 
          onClick={() => navigate('/donate')}
          style={{
            background: activeColor,
            color: '#ffffff',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          ☕ Donate
        </button>
      </div>

      {/* Dynamic Color-Coded Progress Bar Line */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: activeColor,
          transition: 'width 0.1s linear, background-color 0.3s ease'
        }} />
      </div>
    </div>
  );
}
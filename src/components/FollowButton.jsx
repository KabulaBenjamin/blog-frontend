import React, { useState, useEffect } from 'react';

export default function FollowButton({ currentUserId, authorId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId) return;

    // Fetch follow status & count
    fetch(`https://blog-2y55.onrender.com/api/authors/${authorId}/followers?currentUserId=${currentUserId || ''}`)
      .then(res => res.json())
      .then(data => {
        setIsFollowing(data.isFollowing || false);
        setFollowerCount(data.count || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Follow fetch error:', err);
        setLoading(false);
      });
  }, [authorId, currentUserId]);

  const handleToggleFollow = async () => {
    if (!currentUserId) {
      alert('Please log in to follow authors.');
      return;
    }

    if (String(currentUserId) === String(authorId)) {
      alert('You cannot follow yourself.');
      return;
    }

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowerCount(prev => (nextState ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`https://blog-2y55.onrender.com/api/authors/${authorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUserId })
      });

      if (!res.ok) {
        // Rollback state if server fails
        setIsFollowing(!nextState);
        setFollowerCount(prev => (nextState ? prev - 1 : prev + 1));
      }
    } catch (err) {
      console.error('Toggle follow failed:', err);
      setIsFollowing(!nextState);
      setFollowerCount(prev => (nextState ? prev - 1 : prev + 1));
    }
  };

  if (loading) return <span style={{ fontSize: '12px', color: '#94a3b8' }}>...</span>;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={handleToggleFollow}
        style={{
          padding: '6px 16px',
          borderRadius: '20px',
          border: isFollowing ? '1px solid #cbd5e1' : 'none',
          background: isFollowing ? '#f1f5f9' : '#2563eb',
          color: isFollowing ? '#334155' : '#ffffff',
          fontWeight: '600',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        {isFollowing ? '✓ Following' : '+ Follow'}
      </button>
      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
        {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
      </span>
    </div>
  );
}

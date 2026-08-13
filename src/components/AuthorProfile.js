// File Location: src/components/AuthorProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import FollowButton from './FollowButton';

export default function AuthorProfile({ currentUser }) {
  const { authorId } = useParams();
  const navigate = useNavigate();

  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authorId) return;

    setLoading(true);

    // 1. Fetch Author Details & Posts
    Promise.all([
      fetch(`https://blog-2y55.onrender.com/users/${authorId}`).then(res => res.json()),
      fetch(`https://blog-2y55.onrender.com/posts?user_id=${authorId}`).then(res => res.json())
    ])
      .then(([authorData, postsData]) => {
        setAuthor(authorData);
        setPosts(Array.isArray(postsData) ? postsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load author profile:', err);
        setError('Failed to load author details.');
        setLoading(false);
      });
  }, [authorId]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading author profile...
      </div>
    );
  }

  if (error || !author) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Author Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const isOwner = currentUser && String(currentUser.id) === String(authorId);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
      {/* 👤 Author Header Card */}
      <div 
        style={{ 
          background: '#ffffff', 
          borderRadius: '12px', 
          padding: '32px', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
          marginBottom: '32px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              background: '#2563eb', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '32px', 
              fontWeight: '700' 
            }}
          >
            {(author.username || author.name || 'A')[0].toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#0f172a' }}>
              {author.username || author.name || 'Unknown Author'}
            </h1>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '15px' }}>
              {author.bio || 'No bio available for this author.'}
            </p>

            {/* Follow Button & Stats Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {!isOwner && (
                <FollowButton 
                  currentUserId={currentUser?.id} 
                  authorId={authorId} 
                />
              )}
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                📝 {posts.length} {posts.length === 1 ? 'Post' : 'Posts'} Published
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📚 Author's Posts Feed */}
      <h2 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '20px' }}>
        Published Articles
      </h2>

      {posts.length === 0 ? (
        <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
          This author hasn't published any posts yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              user={currentUser} 
              isFeedMode={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
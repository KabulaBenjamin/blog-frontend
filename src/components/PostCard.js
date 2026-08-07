// File Location: src/components/PostCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import he from 'he'; // HTML entity decoder

// CSS Imports
import 'katex/dist/katex.min.css';
import './PostCard.css';

function PostCard({ post, user, onUpdated, onDeleted, isFeedMode = false }) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = user && String(user.id) === String(post?.user_id);

  // Category Theme Helper Map
  const categoryTheme = {
    tech: { bg: '#e3f2fd', color: '#0d47a1', label: '💻 Tech' },
    education: { bg: '#e8f5e9', color: '#1b5e20', label: '📐 Education' },
    'ai-research': { bg: '#f3e5f5', color: '#4a148c', label: '🤖 AI Research' },
    faith: { bg: '#fff3e0', color: '#e65100', label: '🌱 Faith' }
  };

  const theme = categoryTheme[post?.category] || categoryTheme.tech;
  const hasLiked = post?.liked_by_users?.includes(user?.id);

  const handleLike = async () => {
    if (isLiking || !user) return;
    setIsLiking(true);

    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}/like`, { 
        method: 'POST',
        credentials: 'include'
      });
      const updated = await res.json();
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error('Like failed:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText, username: user?.username || 'Anonymous' }),
        credentials: 'include'
      });
      const updated = await res.json();
      if (onUpdated) onUpdated(updated);
      setCommentText('');
      setShowCommentBox(false);
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok && onDeleted) onDeleted(post.id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: postUrl
      }).catch(err => console.log('Share canceled:', err));
    } else {
      navigator.clipboard.writeText(postUrl).then(() => alert('Link copied!'));
    }
  };

  // 1. Decode HTML entities (&lt;p&gt; -> <p>)
  const decodedContent = he.decode(post?.content || '');

  // 2. Truncate clean string for Feed Mode
  const contentToRender = isFeedMode && decodedContent.length > 300 
    ? decodedContent.substring(0, 300) + '...' 
    : decodedContent;

  // 3. Sanitize HTML
  const cleanHtml = DOMPurify.sanitize(contentToRender);

  const commentsCount = Array.isArray(post?.comments) ? post.comments.length : (post?.comments || 0);

  return (
    <div className="post-card">
      
      {/* 1. EDITORIAL DARK HERO HEADER */}
      <div className="post-card-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {/* Category Badge */}
          <span className="pill-category" style={{ background: theme.bg, color: theme.color, padding: '4px 10px', borderRadius: '12px' }}>
            {theme.label}
          </span>

          {/* Subcategory Tags */}
          {post?.tags && post.tags.trim() !== "" && post.tags.split(',').map((tag, idx) => (
            <span key={idx} style={{ 
              fontSize: '11px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              color: '#cbd5e1', 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              #{tag.trim()}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 style={{ cursor: 'pointer' }} onClick={() => navigate(`/posts/${post.id}`)}>
          {post?.title}
        </h2>

        {/* Hero Meta Bar */}
        <div className="hero-meta">
          <span>BY: {post?.username || 'UNKNOWN'}</span>
          <span>👍 {post?.likes || 0} LIKES</span>
          <span>💬 {commentsCount} COMMENTS</span>
        </div>
      </div>

      {/* 2. RENDERED CONTENT BODY (PARSED TO REACT NODES) */}
      <div className="blog-rendered-content ql-editor">
        {parse(cleanHtml)}
      </div>

      {post?.live_link && (
        <div style={{ padding: '0 32px 16px 32px', backgroundColor: '#0f0f11' }}>
          🔗 <a href={post.live_link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Live Project Link</a>
        </div>
      )}

      {/* 3. CARD FOOTER & ACTIONS */}
      <div className="post-card-footer">
        <div className="actions">
          {isFeedMode ? (
            <button onClick={() => navigate(`/posts/${post.id}`)} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
              Read Full Post
            </button>
          ) : (
            <>
              <button 
                onClick={handleLike} 
                disabled={isLiking || !user}
                style={{ 
                  background: hasLiked ? '#cbd5e1' : '#e2e8f0', 
                  color: hasLiked ? '#0f172a' : '#334155', 
                  border: 'none', 
                  padding: '8px 16px', 
                  borderRadius: '4px', 
                  cursor: isLiking || !user ? 'not-allowed' : 'pointer', 
                  fontWeight: '600' 
                }}
              >
                {isLiking ? 'Saving...' : hasLiked ? '❤️ Liked' : '👍 Like'}
              </button>
              <button onClick={() => setShowCommentBox(!showCommentBox)} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                Comment
              </button>
            </>
          )}
          <button onClick={handleShare} style={{ background: '#e2e8f0', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
            Share
          </button>
          {isOwner && (
            <>
              <button onClick={() => navigate(`/edit/${post.id}`)} style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                Edit
              </button>
              <button onClick={handleDelete} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {showCommentBox && !isFeedMode && (
        <form onSubmit={handleCommentSubmit} style={{ padding: '0 28px 20px 28px', display: 'flex', gap: '8px', backgroundColor: '#0b131e' }}>
          <input 
            type="text" 
            placeholder="Write a comment..." 
            value={commentText} 
            onChange={(e) => setCommentText(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#1e293b', color: '#fff' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Post
          </button>
        </form>
      )}

    </div>
  );
}

export default PostCard;
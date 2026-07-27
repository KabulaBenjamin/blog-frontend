// File Location: src/components/PostCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';

// Required for LaTeX math formula rendering
import 'katex/dist/katex.min.css';

function PostCard({ post, user, onUpdated, onDeleted, isFeedMode = false }) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isLiking, setIsLiking] = useState(false); // Prevents rapid spam clicking

  const isOwner = user && String(user.id) === String(post.user_id);

  // Category Theme Helper Map
  const categoryTheme = {
    tech: { bg: '#e3f2fd', color: '#0d47a1', label: '💻 Tech' },
    education: { bg: '#e8f5e9', color: '#1b5e20', label: '📐 Education' },
    'ai-research': { bg: '#f3e5f5', color: '#4a148c', label: '🤖 AI Research' },
    faith: { bg: '#fff3e0', color: '#e65100', label: '🌱 Faith' }
  };

  const theme = categoryTheme[post.category] || categoryTheme.tech;

  // Check if current user has already liked this post.
  const hasLiked = post.liked_by_users?.includes(user?.id);

  const handleLike = async () => {
    if (isLiking || !user) return; // Prevent clicking if request is pending or user is anonymous
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
      setIsLiking(false); // Re-enable the button once request completes
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

  // Truncate text cleanly for Feed Mode
  const rawContent = post.content || '';
  const displayContent = isFeedMode && rawContent.length > 300 
    ? rawContent.substring(0, 300) + '...' 
    : rawContent;

  return (
    <div className="post-card" style={{ marginBottom: '20px', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      
      {/* Category Pillar Badge */}
      <div style={{ marginBottom: '10px' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          textTransform: 'uppercase', 
          padding: '4px 10px', 
          borderRadius: '12px',
          background: theme.bg,
          color: theme.color,
          letterSpacing: '0.03em'
        }}>
          {theme.label}
        </span>
      </div>

      {/* Title */}
      <h2 style={{ cursor: 'pointer', color: '#1a202c', marginTop: '5px', marginBottom: '12px', fontSize: '1.5rem', fontWeight: '700' }} onClick={() => navigate(`/posts/${post.id}`)}>
        {post.title}
      </h2>

      {/* Subcategory Tag List */}
      {post.tags && post.tags.trim() !== "" && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' }}>
          {post.tags.split(',').map((tag, idx) => (
            <span key={idx} style={{ 
              fontSize: '11px', 
              background: '#f1f5f9', 
              color: '#64748b', 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}
      
      {/* Content Area with Markdown & LaTeX Support */}
      <div style={{ color: '#4a5568', lineHeight: '1.7', fontSize: '1.05rem' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {displayContent}
        </ReactMarkdown>
      </div>

      {post.live_link && (
        <p style={{ marginTop: '15px' }}>
          🔗 <a href={post.live_link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', fontWeight: '500', textDecoration: 'none' }}>Live Project Link</a>
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', fontSize: '0.9rem', color: '#64748b' }}>
        <p style={{ margin: 0 }}><strong>By:</strong> {post.username || 'Unknown'}</p>
        <p style={{ margin: 0 }}>👍 {post.likes || 0} | 💬 {Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)}</p>
      </div>

      <div className="actions" style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
        {isFeedMode ? (
          <button onClick={() => navigate(`/posts/${post.id}`)} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Read Full Post</button>
        ) : (
          <>
            <button 
              onClick={handleLike} 
              disabled={isLiking || !user}
              style={{ 
                background: hasLiked ? '#e2e8f0' : '#f1f5f9', 
                color: hasLiked ? '#1e293b' : '#4a5568', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px', 
                cursor: isLiking || !user ? 'not-allowed' : 'pointer', 
                fontWeight: '600' 
              }}
            >
              {isLiking ? 'Saving...' : hasLiked ? '❤️ Liked' : '👍 Like'}
            </button>
            <button onClick={() => setShowCommentBox(!showCommentBox)} style={{ background: '#f1f5f9', color: '#4a5568', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Comment</button>
          </>
        )}
        <button onClick={handleShare} style={{ background: '#f1f5f9', color: '#4a5568', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Share</button>
        {isOwner && (
          <>
            <button onClick={() => navigate(`/edit/${post.id}`)} style={{ background: '#fff', color: '#4a5568', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Edit</button>
            <button onClick={handleDelete} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
          </>
        )}
      </div>

      {showCommentBox && !isFeedMode && (
        <form onSubmit={handleCommentSubmit} style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Write a comment..." 
            value={commentText} 
            onChange={(e) => setCommentText(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Post</button>
        </form>
      )}
    </div>
  );
}

export default PostCard;
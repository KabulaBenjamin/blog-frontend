// File Location: src/components/PostCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PostCard({ post, user, onUpdated, onDeleted, isFeedMode = false }) {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const isOwner = user && String(user.id) === String(post.user_id);

  const handleLike = async () => {
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}/like`, { 
        method: 'POST',
        credentials: 'include'
      });
      const updated = await res.json();
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error('Like failed:', err);
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

  return (
    <div className="post-card" style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '6px', background: '#fff' }}>
      {/* 💡 Clicking the title routes to the dedicated single-view details page */}
      <h2 style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => navigate(`/posts/${post.id}`)}>
        {post.title}
      </h2>
      
      {/* Truncates text on homepage feed so users have an incentive to click into the unique post page */}
      <div 
        dangerouslySetInnerHTML={{ 
          __html: isFeedMode && post.content?.length > 300 
            ? post.content.substring(0, 300) + '...' 
            : post.content 
        }} 
      />

      {post.live_link && (
        <p><a href={post.live_link} target="_blank" rel="noopener noreferrer">Live Link</a></p>
      )}
      <p><strong>By:</strong> {post.username || 'Unknown'}</p>
      <p>👍 {post.likes || 0} | 💬 {Array.isArray(post.comments) ? post.comments.length : (post.comments || 0)}</p>

      <div className="actions" style={{ display: 'flex', gap: '8px' }}>
        {isFeedMode ? (
          <button onClick={() => navigate(`/posts/${post.id}`)} style={{ background: '#28a745', color: '#fff' }}>Read Full Post</button>
        ) : (
          <>
            <button onClick={handleLike}>Like</button>
            <button onClick={() => setShowCommentBox(!showCommentBox)}>Comment</button>
          </>
        )}
        <button onClick={handleShare}>Share</button>
        {isOwner && (
          <>
            <button onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
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
          <button type="submit">Post</button>
        </form>
      )}
    </div>
  );
}

export default PostCard;
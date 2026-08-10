// File Location: src/components/PostCard.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import he from 'he';

// CSS Imports
import 'katex/dist/katex.min.css';
import './PostCard.css';

function PostCard({ post, user, onUpdated, onDeleted, isFeedMode = false }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(isFeedMode ? 450 : 800);

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

  // Decode HTML entities (&lt;p&gt; -> <p>)
  const decodedContent = he.decode(post?.content || '');

  // Detect if the content is a full/custom HTML document layout
  const isRawHtmlPost = 
    decodedContent.includes('<header') || 
    decodedContent.includes('class="hero"') || 
    decodedContent.includes('sanctuary-post-root') ||
    decodedContent.includes('<!DOCTYPE html>') ||
    decodedContent.includes('<style>');

  // Auto-adjust iframe height to match internal document content seamlessly
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const bodyHeight = iframeRef.current.contentWindow.document.body.scrollHeight;
        if (bodyHeight > 0 && !isFeedMode) {
          setIframeHeight(bodyHeight + 20);
        }
      } catch (err) {
        console.log('Cross-origin/Iframe height auto-fit skipped:', err);
      }
    }
  };

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
      navigator.share({ title: post.title, url: postUrl }).catch(err => console.log('Share canceled:', err));
    } else {
      navigator.clipboard.writeText(postUrl).then(() => alert('Link copied!'));
    }
  };

  const commentsCount = Array.isArray(post?.comments) ? post.comments.length : (post?.comments || 0);

  // Inject standard CSS resets into the iframe head to fix browser margins
  const fullDocumentSource = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, sans-serif;
          }
        </style>
      </head>
      <body>
        ${decodedContent}
      </body>
    </html>
  `;

  // =========================================================================
  // 1. RAW HTML IFRAME MODE (100% Localhost Identical)
  // =========================================================================
  if (isRawHtmlPost) {
    return (
      <div className="raw-html-post-wrapper">
        <div className={`iframe-container ${isFeedMode ? 'feed-preview-frame' : ''}`}>
          <iframe
            ref={iframeRef}
            srcDoc={fullDocumentSource}
            title={post?.title || "Custom HTML Post"}
            onLoad={handleIframeLoad}
            style={{
              width: '100%',
              height: isFeedMode ? '450px' : `${iframeHeight}px`,
              border: 'none',
              display: 'block'
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Action Controls Footer */}
        <div className="post-card-footer raw-footer">
          <div className="actions">
            {isFeedMode ? (
              <button onClick={() => navigate(`/posts/${post.id}`)} className="btn-primary">
                Read Full Post
              </button>
            ) : (
              <>
                <button onClick={handleLike} disabled={isLiking || !user} className="btn-secondary">
                  {isLiking ? 'Saving...' : hasLiked ? '❤️ Liked' : '👍 Like'}
                </button>
                <button onClick={() => setShowCommentBox(!showCommentBox)} className="btn-secondary">
                  Comment
                </button>
              </>
            )}
            <button onClick={handleShare} className="btn-secondary">Share</button>
            {isOwner && (
              <>
                <button onClick={() => navigate(`/edit/${post.id}`)} className="btn-outline">Edit</button>
                <button onClick={handleDelete} className="btn-danger">Delete</button>
              </>
            )}
          </div>
        </div>

        {showCommentBox && !isFeedMode && (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={commentText} 
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn-primary">Post</button>
          </form>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. STANDARD CARD MODE (For simple formatted text)
  // =========================================================================
  const cleanHtml = DOMPurify.sanitize(decodedContent);

  return (
    <div className="post-card">
      <div className="post-card-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span className="pill-category" style={{ background: theme.bg, color: theme.color, padding: '4px 10px', borderRadius: '12px' }}>
            {theme.label}
          </span>
          {post?.tags && post.tags.trim() !== "" && post.tags.split(',').map((tag, idx) => (
            <span key={idx} style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
              #{tag.trim()}
            </span>
          ))}
        </div>

        <h2 style={{ cursor: 'pointer' }} onClick={() => navigate(`/posts/${post.id}`)}>
          {post?.title}
        </h2>

        <div className="hero-meta">
          <span>BY: {post?.username || 'UNKNOWN'}</span>
          <span>👍 {post?.likes || 0} LIKES</span>
          <span>💬 {commentsCount} COMMENTS</span>
        </div>
      </div>

      <div className={`blog-rendered-content ql-editor ${isFeedMode ? 'feed-mode-preview' : ''}`}>
        {parse(cleanHtml)}
      </div>

      <div className="post-card-footer">
        <div className="actions">
          {isFeedMode ? (
            <button onClick={() => navigate(`/posts/${post.id}`)} className="btn-primary">Read Full Post</button>
          ) : (
            <>
              <button onClick={handleLike} disabled={isLiking || !user} className="btn-secondary">
                {isLiking ? 'Saving...' : hasLiked ? '❤️ Liked' : '👍 Like'}
              </button>
              <button onClick={() => setShowCommentBox(!showCommentBox)} className="btn-secondary">Comment</button>
            </>
          )}
          <button onClick={handleShare} className="btn-secondary">Share</button>
          {isOwner && (
            <>
              <button onClick={() => navigate(`/edit/${post.id}`)} className="btn-outline">Edit</button>
              <button onClick={handleDelete} className="btn-danger">Delete</button>
            </>
          )}
        </div>
      </div>

      {showCommentBox && !isFeedMode && (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <input 
            type="text" 
            placeholder="Write a comment..." 
            value={commentText} 
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="btn-primary">Post</button>
        </form>
      )}
    </div>
  );
}

export default PostCard;
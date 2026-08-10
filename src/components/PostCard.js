// File Location: src/components/PostCard.js
import React, { useState, useRef } from 'react';
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

  // Detect if content is a custom HTML document layout
  const isRawHtmlPost = 
    decodedContent.includes('<header') || 
    decodedContent.includes('class="hero"') || 
    decodedContent.includes('sanctuary-post-root') ||
    decodedContent.includes('<!DOCTYPE html>') ||
    decodedContent.includes('<style>');

  // Auto-adjust iframe height
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

  // Bottom Navigation
  const handleGoHome = () => navigate('/');
  const handlePrevPost = () => post?.id && navigate(`/posts/${Number(post.id) - 1}`);
  const handleNextPost = () => post?.id && navigate(`/posts/${Number(post.id) + 1}`);

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
          img, svg, iframe, video {
            max-width: 100% !important;
            height: auto !important;
          }
        </style>
      </head>
      <body>
        ${decodedContent}
      </body>
    </html>
  `;

  // Standard Sanitized HTML Mode
  const cleanHtml = DOMPurify.sanitize(decodedContent, {
    ADD_TAGS: ['style', 'details', 'summary', 'header', 'nav', 'article', 'section', 'main', 'aside', 'svg', 'path', 'g'],
    ADD_ATTR: ['class', 'id', 'style', 'open', 'aria-label', 'target', 'rel', 'colspan', 'rowspan', 'xmlns', 'viewBox', 'd', 'fill'],
    FORCE_BODY: false
  });

  return (
    <div className={`post-card ${!isFeedMode ? 'full-screen-mode' : 'feed-mode-card'}`}>
      
      {/* 1. HERO HEADER AREA */}
      <div className="post-card-hero">
        <div className="hero-top-bar">
          <span className="pill-category" style={{ background: theme.bg, color: theme.color }}>
            {theme.label}
          </span>
          {post?.tags && post.tags.trim() !== "" && post.tags.split(',').map((tag, idx) => (
            <span key={idx} className="post-tag">
              #{tag.trim()}
            </span>
          ))}
        </div>

        <h1 className="hero-title" onClick={() => navigate(`/posts/${post.id}`)}>
          {post?.title}
        </h1>

        <div className="hero-meta">
          <span>BY: {post?.username || 'UNKNOWN'}</span>
          <span>👍 {post?.likes || 0} LIKES</span>
          <span>💬 {commentsCount} COMMENTS</span>
        </div>
      </div>

      {/* 2. CONTENT AREA (IFRAME OR RENDERED HTML) */}
      {isRawHtmlPost ? (
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
      ) : (
        <div className={`blog-rendered-content ql-editor ${isFeedMode ? 'feed-mode-preview' : ''}`}>
          {parse(cleanHtml)}
        </div>
      )}

      {/* 3. POST INTERACTION BUTTONS */}
      <div className="post-card-footer">
        <div className="actions">
          {isFeedMode ? (
            <button onClick={() => navigate(`/posts/${post.id}`)} className="btn-primary">
              Read Full Post
            </button>
          ) : (
            <>
              <button onClick={handleLike} disabled={isLiking || !user} className={`btn-secondary ${hasLiked ? 'liked' : ''}`}>
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

      {/* COMMENT BOX */}
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

      {/* 4. BOTTOM POST NAVIGATION BAR */}
      {!isFeedMode && (
        <div className="post-nav-bar">
          <button onClick={handlePrevPost} className="btn-nav">
            ← Previous
          </button>
          <button onClick={handleGoHome} className="btn-nav btn-home">
            🏠 Home
          </button>
          <button onClick={handleNextPost} className="btn-nav">
            Next →
          </button>
        </div>
      )}

    </div>
  );
}

export default PostCard;
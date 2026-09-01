// File Location: src/components/PostCard.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import he from 'he';
import FollowButton from './FollowButton'; // 👥 Import Follow Button

// CSS Imports
import 'katex/dist/katex.min.css';
import './PostCard.css';

function PostCard({ post, user, onUpdated, onDeleted, isFeedMode = false }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [commentText, setCommentText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(isFeedMode ? 350 : 800);

  const authorId = post?.user_id || post?.author_id;
  const isOwner = user && String(user.id) === String(authorId);

  // Dynamic Identifier (Slug preferred for SEO, falls back to numeric ID)
  const postIdentifier = post?.slug || post?.id;

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
    const postUrl = `${window.location.origin}/posts/${postIdentifier}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url: postUrl }).catch(err => console.log('Share canceled:', err));
    } else {
      navigator.clipboard.writeText(postUrl).then(() => alert('Link copied!'));
    }
  };

  const commentsCount = Array.isArray(post?.comments) ? post.comments.length : (post?.comments || 0);

  // Safe Bottom Navigation
  const handleGoHome = () => navigate('/');
  const handlePrevPost = () => {
    if (post?.prevSlug || post?.prevPostId) {
      navigate(`/posts/${post.prevSlug || post.prevPostId}`);
    } else if (post?.id && Number(post.id) > 1) {
      navigate(`/posts/${Number(post.id) - 1}`);
    } else {
      navigate('/');
    }
  };
  const handleNextPost = () => {
    if (post?.nextSlug || post?.nextPostId) {
      navigate(`/posts/${post.nextSlug || post.nextPostId}`);
    } else if (post?.id) {
      navigate(`/posts/${Number(post.id) + 1}`);
    } else {
      navigate('/');
    }
  };

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

  // Truncate non-iframe content cleanly for feed mode previews
  const getDisplayContent = () => {
    if (!isFeedMode) return cleanHtml;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    const rawText = tempDiv.textContent || tempDiv.innerText || '';

    return rawText.length > 200 
      ? `<p>${rawText.slice(0, 200)}...</p>` 
      : cleanHtml;
  };

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

        <h1 className="hero-title" onClick={() => navigate(`/posts/${postIdentifier}`)}>
          {post?.title}
        </h1>

        <div className="hero-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* 👤 Clickable Author Name */}
          <span 
            onClick={() => authorId && navigate(`/authors/${authorId}`)} 
            style={{ cursor: authorId ? 'pointer' : 'default', textDecoration: authorId ? 'underline' : 'none', fontWeight: 'bold' }}
            title={authorId ? "View author profile" : ""}
          >
            BY: {post?.username || 'UNKNOWN'}
          </span>
          
          {/* 👥 Follow Button Component (Hidden if viewer is the author) */}
          {!isOwner && authorId && (
            <FollowButton 
              currentUserId={user?.id} 
              authorId={authorId} 
            />
          )}

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
              height: isFeedMode ? '350px' : `${iframeHeight}px`,
              border: 'none',
              display: 'block'
            }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className={`blog-rendered-content ql-editor ${isFeedMode ? 'feed-mode-preview' : ''}`}>
          {parse(getDisplayContent())}
        </div>
      )}

      {/* 3. POST INTERACTION BUTTONS */}
      <div className="post-card-footer">
        <div className="actions">
          {isFeedMode ? (
            <button onClick={() => navigate(`/posts/${postIdentifier}`)} className="btn-primary">
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
import React from 'react';
import './PostCard.css';

function PostCard({ title, author, content, likes, comments }) {
  return (
    <div className="post-card">
      <h2>{title}</h2>
      <p className="meta">by {author}</p>
      <p className="preview">{content}</p>
      <div className="actions">
        <span>👍 {likes}</span>
        <span>💬 {comments}</span>
        <span>↗ Share</span>
      </div>
    </div>
  );
}

export default PostCard;

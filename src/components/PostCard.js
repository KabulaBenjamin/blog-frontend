import React from 'react';
import { useNavigate } from 'react-router-dom';

function PostCard({ post, user, onUpdated, onDeleted }) {
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}/like`, { method: 'POST' });
      const updated = await res.json();
      onUpdated(updated);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleComment = async () => {
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}/comment`, { method: 'POST' });
      const updated = await res.json();
      onUpdated(updated);
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        onDeleted(post.id);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.replace(/<[^>]+>/g, '').slice(0, 100) + '...',
        url: window.location.href
      });
    } else {
      alert('Sharing not supported in this browser.');
    }
  };

  return (
    <div className="post-card">
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      {post.live_link && (
        <p>
          <a href={post.live_link} target="_blank" rel="noopener noreferrer">Live Link</a>
        </p>
      )}
      <p><strong>By:</strong> {post.username}</p>
      <p>👍 {post.likes || 0} | 💬 {post.comments || 0}</p>

      <div className="actions">
        <button onClick={handleLike}>Like</button>
        <button onClick={handleComment}>Comment</button>
        <button onClick={handleShare}>Share</button>
        {user && (user.id === post.user_id) && (
          <>
            <button onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

export default PostCard;

import React, { useState } from 'react';
import './PostCard.css';

function PostCard({ post, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [file, setFile] = useState(null);
  const [liveLink, setLiveLink] = useState(post.live_link || '');

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (file) formData.append('file', file);
      if (liveLink) formData.append('live_link', liveLink);

      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}`, {
        method: 'PUT',
        body: formData
      });
      const updated = await res.json();
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`https://blog-2y55.onrender.com/posts/${post.id}`, { method: 'DELETE' });
      onDeleted(post.id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="post-card">
      {editing ? (
        <>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <textarea value={content} onChange={e => setContent(e.target.value)} />
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <input 
            type="text" 
            placeholder="Live link" 
            value={liveLink} 
            onChange={e => setLiveLink(e.target.value)} 
          />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h3 className="title">{post.title}</h3>
          <p className="meta">by {post.username} • {new Date(post.created_at).toLocaleString()}</p>
          {post.media_url && post.media_url.endsWith('.mp4') ? (
            <video controls src={post.media_url} className="post-media"></video>
          ) : post.media_url ? (
            <img src={post.media_url} alt={post.title} className="post-media" />
          ) : null}
          {post.live_link && <a href={post.live_link} target="_blank" rel="noopener noreferrer">Watch Live</a>}
          <p className="preview">{post.content}</p>
          <div className="actions">
            <span>❤️ {post.likes || 0}</span>
            <span>💬 {post.comments || 0}</span>
            <span>↗ Share</span>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default PostCard;

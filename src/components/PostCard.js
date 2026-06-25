import React, { useState } from 'react';

function PostCard({ post, user, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
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

  // Debugging logs (optional)
  console.log("Post:", post, "User:", user);

  return (
    <div className="post-card">
      {editing ? (
        <>
          <input value={title} onChange={e => setTitle(e.target.value)} />
          <textarea value={content} onChange={e => setContent(e.target.value)} />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h3>{post.title}</h3>
          <p><strong>{post.username || `User ${post.user_id}`}</strong></p>
          <p>{post.content}</p>
          {user && (user.id === post.user_id || user.user_id === post.user_id) && (
            <div className="actions">
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PostCard;

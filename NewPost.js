import './NewPost.css';
import React, { useState } from 'react';

function NewPost({ onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://blog-2y55.onrender.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1, // temporary hardcoded user
          title,
          content
        })
      });
      const newPost = await res.json();
      onPostCreated(newPost);

      // Clear form fields
      setTitle('');
      setContent('');
      setMessage('✅ Post created successfully!');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to create post.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="new-post">
      <h2>Create New Post</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">Post</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default NewPost;

import React, { useState } from 'react';

function NewPost({ user, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [liveLink, setLiveLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('title', title);
      formData.append('content', content);
      if (file) formData.append('file', file);
      if (liveLink) formData.append('live_link', liveLink);

      const res = await fetch('https://blog-2y55.onrender.com/posts', {
        method: 'POST',
        body: formData
      });
      const newPost = await res.json();
      onCreated(newPost);
      setTitle('');
      setContent('');
      setFile(null);
      setLiveLink('');
    } catch (err) {
      console.error('Create post failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="new-post">
      <input 
        type="text" 
        placeholder="Title" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        required 
      />
      <textarea 
        placeholder="Content" 
        value={content} 
        onChange={e => setContent(e.target.value)} 
        required 
      />
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <input 
        type="text" 
        placeholder="Live link (optional)" 
        value={liveLink} 
        onChange={e => setLiveLink(e.target.value)} 
      />
      <button type="submit">Post</button>
    </form>
  );
}

export default NewPost;

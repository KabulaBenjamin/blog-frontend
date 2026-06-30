import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function NewPost({ user, onCreated, existingPost }) {
  const [title, setTitle] = useState(existingPost ? existingPost.title : '');
  const [content, setContent] = useState(existingPost ? existingPost.content : '');

  const imageHandler = function() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('media', file);
      formData.append('user_id', user.id);
      formData.append('title', title || 'temp');
      formData.append('content', content || 'temp');
      formData.append('editor_type', 'quill');

      try {
        const res = await fetch('https://blog-2y55.onrender.com/posts', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.media_url) {
          const quill = this.quill;
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', data.media_url);
        } else {
          alert('Image upload failed.');
        }
      } catch (err) {
        console.error('Image upload error:', err);
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'image'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
      ],
      handlers: { image: imageHandler }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to create or edit a post.');
      return;
    }

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('title', title);
    formData.append('content', content);
    formData.append('editor_type', 'quill');

    try {
      const url = existingPost
        ? `https://blog-2y55.onrender.com/posts/${existingPost.id}`
        : 'https://blog-2y55.onrender.com/posts';
      const method = existingPost ? 'PUT' : 'POST';

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        onCreated(data);
        setTitle('');
        setContent('');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Post error:', err);
      alert('Server error, please try again.');
    }
  };

  return (
    <div className="new-post">
      <h2>{existingPost ? 'Edit Post' : 'Create New Post'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="Write your content here..."
        />
        <div className="post-actions">
          <button type="submit">{existingPost ? 'Update' : 'Publish'}</button>
          <button type="button" onClick={() => window.location.href = '/'}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default NewPost;

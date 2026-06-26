import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './NewPost.css';

function NewPost({ user, onCreated }) {
  const [title, setTitle] = useState('');
  const [editorType, setEditorType] = useState('quill'); // quill | markdown | html | normal
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
      formData.append('editor_type', editorType); // save editor type
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
      setEditorType('quill');
    } catch (err) {
      console.error('Create post failed:', err);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ]
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

      <select value={editorType} onChange={e => setEditorType(e.target.value)}>
        <option value="quill">Rich Text (Quill)</option>
        <option value="markdown">Markdown</option>
        <option value="html">HTML</option>
        <option value="normal">Plain Text</option>
      </select>

      {editorType === 'quill' && (
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="Write your post here..."
        />
      )}
      {editorType !== 'quill' && (
        <textarea
          placeholder={`Write your ${editorType} post here...`}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      )}

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

import React, { useState, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function QuillEditor({ post, user, onSaved }) {
  const [title, setTitle] = useState(post ? post.title || '' : '');
  const [content, setContent] = useState(post ? post.content || '' : '');
  const [liveLink, setLiveLink] = useState(post ? post.live_link || '' : '');

  const quillRef = useRef(null);

  // 1. Memoized modules to guarantee no re-render focus crashes while typing
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['link', 'image'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
      ],
      handlers: {
        image: function () {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          
          input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('media', file); // Matches upload.single('media') on backend

            try {
              // Direct upload route to avoid polluting standard posts logic
              const res = await fetch('https://blog-2y55.onrender.com/upload-image', {
                method: 'POST',
                body: formData
              });
              
              if (res.ok) {
                const data = await res.json();
                // 2. Safe instance selection retrieval using the wrapper ref
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true); 
                
                // Construct the full image URL returned from your backend uploads directory
                const completeImageUrl = `https://blog-2y55.onrender.com${data.url}`;
                quill.insertEmbed(range.index, 'image', completeImageUrl);
                quill.setSelection(range.index + 1); // Move selection cursor forward past image
              } else {
                alert('Image upload failed.');
              }
            } catch (err) {
              console.error('Image upload error:', err);
            }
          };
        }
      }
    }
  }), []);

  const handleSave = async () => {
    if (!user) {
      alert('You must be logged in to save posts.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content || '');
      formData.append('editor_type', 'quill');
      if (liveLink) formData.append('live_link', liveLink);

      let url = 'https://blog-2y55.onrender.com/posts';
      let method = 'POST';

      if (post) {
        url = `https://blog-2y55.onrender.com/posts/${post.id}`;
        method = 'PUT';
      } else {
        formData.append('user_id', user.id);
      }

      const res = await fetch(url, { method, body: formData });
      const saved = await res.json();
      if (onSaved) onSaved(saved);
      alert('Post saved successfully!');
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <div className="quill-editor">
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <ReactQuill
        ref={quillRef} // Binds the React instance safely to look up current selections
        theme="snow"
        value={content || ''}
        onChange={setContent}
        modules={modules}
        placeholder="Write your content here..."
      />
      <input
        type="text"
        placeholder="Live link"
        value={liveLink}
        onChange={e => setLiveLink(e.target.value)}
      />
      <button onClick={handleSave}>{post ? 'Update Post' : 'Create Post'}</button>
    </div>
  );
}

export default QuillEditor;
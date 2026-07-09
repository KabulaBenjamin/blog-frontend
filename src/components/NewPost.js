import React, { useState, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ⚡ Browser-native ultra-fast image compression engine
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Optimal resolution threshold for modern displays
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas image to an optimized binary JPEG Blob block at 75% quality
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.75);
      };
    };
  });
};

function NewPost({ user, onCreated, existingPost }) {
  const [title, setTitle] = useState(existingPost ? existingPost.title : '');
  const [content, setContent] = useState(existingPost ? existingPost.content : '');
  
  // Ref hook to cleanly communicate with the editor API across cycles
  const quillRef = useRef(null);

  // 🛡️ useMemo guarantees modules are locked down, preventing cursor focus drop while typing
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

            try {
              // 1. Compress the file in client-side memory
              const optimizedFile = await compressImage(file);

              const formData = new FormData();
              formData.append('media', optimizedFile); // Matches upload.single('media') on backend

              // 2. Direct clean upload isolation route (avoids duplicate phantom posts)
              const res = await fetch('https://blog-2y55.onrender.com/upload-image', {
                method: 'POST',
                body: formData
              });
              
              if (res.ok) {
                const data = await res.json();
                
                // Safe lookup using the instance wrapper ref
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true); 
                
                const completeImageUrl = data.url.startsWith('http') 
                  ? data.url 
                  : `https://blog-2y55.onrender.com${data.url}`;

                quill.insertEmbed(range.index, 'image', completeImageUrl);
                quill.setSelection(range.index + 1); 
              } else {
                alert('Image upload failed.');
              }
            } catch (err) {
              console.error('Image upload error segment:', err);
            }
          };
        }
      }
    }
  }), []);

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
        if (onCreated) onCreated(data);
        setTitle('');
        setContent('');
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Post processing framework error:', err);
      alert('Server encountered an issue. Please attempt publishing again.');
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
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          placeholder="Write your content here..."
        />
        <div className="post-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button type="submit">{existingPost ? 'Update' : 'Publish'}</button>
          <button type="button" onClick={() => window.location.href = '/'} style={{ background: '#6c757d' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default NewPost;
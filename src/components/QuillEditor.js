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
        const MAX_WIDTH = 1200; // Optimal resolution threshold for web/mobile displays
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

        // Convert canvas image to an optimized binary Blob block
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.75); // 75% compression preserves perfect visual balance
      };
    };
  });
};

function QuillEditor({ post, user, onSaved }) {
  const [title, setTitle] = useState(post ? post.title || '' : '');
  const [content, setContent] = useState(post ? post.content || '' : '');
  const [liveLink, setLiveLink] = useState(post ? post.live_link || '' : '');

  const quillRef = useRef(null);

  // Memoized modules configuration to prevent focus drops during active key input states
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
              // 1. Compress the raw user file in client-side memory
              const optimizedFile = await compressImage(file);

              const formData = new FormData();
              formData.append('media', optimizedFile); // Matches upload.single('media') on backend

              // 2. Transmit the highly compressed, lightweight media file
              const res = await fetch('https://blog-2y55.onrender.com/upload-image', {
                method: 'POST',
                body: formData
              });
              
              if (res.ok) {
                const data = await res.json();
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true); 
                
                // If backend returns a fully validated URL string directly, fallback checks clean it up
                const completeImageUrl = data.url.startsWith('http') 
                  ? data.url 
                  : `https://blog-2y55.onrender.com${data.url}`;

                quill.insertEmbed(range.index, 'image', completeImageUrl);
                quill.setSelection(range.index + 1); 
              } else {
                alert('Image upload failed.');
              }
            } catch (err) {
              console.error('Image upload optimization error chain:', err);
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

      const res = await fetch(url, { 
        method, 
        body: formData
      });
      
      const saved = await res.json();
      if (onSaved) onSaved(saved);
      alert('Post saved successfully!');
    } catch (err) {
      console.error('Save pipeline exception recorded:', err);
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
        ref={quillRef} 
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
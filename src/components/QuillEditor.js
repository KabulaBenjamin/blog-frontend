import React, { useState, useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ==========================================
// 1. REGISTER CUSTOM FONTS INTO QUILL REGISTRY
// ==========================================
const Font = Quill.import('formats/font');
// The array names must match the exact CSS classes we define below
Font.whitelist = ['serif', 'monospace', 'sans-serif', 'times-new-roman', 'arial', 'georgia'];
Quill.register(Font, true);

// ⚡ Browser-native image compression engine
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
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

function QuillEditor({ post, user, onSaved }) {
  const [title, setTitle] = useState(post ? post.title || '' : '');
  const [content, setContent] = useState(post ? post.content || '' : '');
  const [liveLink, setLiveLink] = useState(post ? post.live_link || '' : '');

  const quillRef = useRef(null);

  // ==========================================
  // 2. RAW HTML PASTE HYDRATION HANDLER
  // ==========================================
  const pasteRawHtmlDirectly = () => {
    const rawHtml = prompt("Paste your raw HTML data here:");
    if (!rawHtml) return;

    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);

    // Using dangerouslyPasteHTML accurately parses strings into Deltas dynamically
    quill.clipboard.dangerouslyPasteHTML(range.index, rawHtml);
  };

  // Memoized modules configuration including custom fonts
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'font': ['serif', 'monospace', 'sans-serif', 'times-new-roman', 'arial', 'georgia'] }],
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
              const optimizedFile = await compressImage(file);
              const formData = new FormData();
              formData.append('media', optimizedFile);

              const res = await fetch('https://blog-2y55.onrender.com/upload-image', {
                method: 'POST',
                body: formData
              });
              
              if (res.ok) {
                const data = await res.json();
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
      {/* Dynamic CSS Styling Injector for Font Mappings */}
      <style>{`
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before {
          content: 'Times New Roman';
          font-family: 'Times New Roman', Times, serif;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before {
          content: 'Arial';
          font-family: Arial, sans-serif;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="georgia"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="georgia"]::before {
          content: 'Georgia';
          font-family: Georgia, serif;
        }

        /* Set the actual inline runtime fonts inside the text area container */
        .ql-font-times-new-roman { font-family: 'Times New Roman', Times, serif; }
        .ql-font-arial { font-family: Arial, sans-serif; }
        .ql-font-georgia { font-family: Georgia, serif; }

        .html-paste-btn {
          background: #333; color: #fff; border: none; padding: 6px 12px;
          margin-bottom: 8px; border-radius: 4px; cursor: pointer; font-size: 0.85rem;
        }
        .html-paste-btn:hover { background: #555; }
      `}</style>

      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" class="html-paste-btn" onClick={pasteRawHtmlDirectly}>
          📋 Paste Raw HTML Snippet
        </button>
      </div>

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
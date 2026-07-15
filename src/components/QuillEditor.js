import React, { useState, useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ==========================================
// 1. REGISTER CUSTOM FONTS INTO QUILL REGISTRY
// ==========================================
const Font = Quill.import('formats/font');
Font.whitelist = ['serif', 'monospace', 'sans-serif', 'times-new-roman', 'arial', 'georgia'];
Quill.register(Font, true);

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
  
  // Two-tiered Taxonomy States
  const [category, setCategory] = useState(post ? post.category || 'tech' : 'tech');
  const [tags, setTags] = useState(post ? post.tags || '' : '');

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

  // Memoized modules configuration to prevent focus drops during active key input states
  const modules = useMemo(() => ({
    // 🛠️ RELAXED CLIPBOARD CONFIGURATION TO ALLOW COMPLEX HTML/DIVS
    clipboard: {
      matchVisual: false, // Stop Quill from aggressively re-calculating visual layouts
      matchers: [
        // Ensure complex standard DIV wrappers are preserved instead of stripped
        ['DIV', (node, delta) => {
          return delta;
        }]
      ]
    },
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
              // 1. Compress the raw user file in client-side memory
              const optimizedFile = await compressImage(file);

              // 2. Construct multi-part body for direct Cloudinary ingestion
              const formData = new FormData();
              formData.append('file', optimizedFile);
              formData.append('upload_preset', 'ml_default'); 

              // 3. Transmit directly to Cloudinary pipeline using your verified Cloud Name
              const res = await fetch('https://api.cloudinary.com/v1_1/sy3yp1q8/image/upload', {
                method: 'POST',
                body: formData
              });
              
              if (res.ok) {
                const data = await res.json();
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true); 
                
                // Extract clean, highly performant CDN link
                const completeImageUrl = data.secure_url;

                quill.insertEmbed(range.index, 'image', completeImageUrl);
                quill.setSelection(range.index + 1); 
              } else {
                const errData = await res.json();
                console.error('Cloudinary API Response rejection:', errData);
                alert(`Cloudinary Error: ${errData.error?.message || 'Check upload preset settings'}`);
              }
            } catch (err) {
              console.error('Image upload optimization error chain:', err);
              alert('Network error communicating with the asset optimization system.');
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

    // Clean, lowercase, and slugify tag tokens (e.g. "Web Dev" -> "web-dev")
    const cleanTags = tags
      .toLowerCase()
      .split(',')
      .map(t => t.trim().replace(/\s+/g, '-'))
      .filter(Boolean)
      .join(', ');

    try {
      // 🛠️ Construct payload
      const postData = {
        title: title,
        content: content || '',
        editor_type: 'quill',
        live_link: liveLink || '',
        category: category,
        tags: cleanTags
      };

      let url = 'https://blog-2y55.onrender.com/posts';
      let method = 'POST';

      if (post) {
        url = `https://blog-2y55.onrender.com/posts/${post.id}`;
        method = 'PUT';
      } else {
        postData.user_id = user.id;
      }

      // ⚡ Transmit payload with accurate serialization headers and cookies included
      const res = await fetch(url, { 
        method, 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData),
        credentials: 'include' 
      });
      
      const saved = await res.json();
      if (res.ok) {
        if (onSaved) onSaved(saved);
        alert('Post saved successfully!');
      } else {
        alert(`Failed to save post: ${saved.message || 'Server encountered an issue saving your data.'}`);
      }
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
        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
      />

      {/* Category Dropdown Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#4a5568' }}>
          Select Core Content Pillar:
        </label>
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', background: '#fff' }}
        >
          <option value="tech">💻 Tech (Software & Engineering)</option>
          <option value="education">📐 Education (High School Math & Science)</option>
          <option value="ai-research">🤖 AI Research (ML & Neural Networks)</option>
          <option value="faith">🌱 Faith (Reflections & Theology)</option>
        </select>
      </div>

      {/* Subcategories (Tags) Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#4a5568' }}>
          Subcategories / Tags (Comma-separated):
        </label>
        <input 
          type="text" 
          placeholder="e.g. javascript, calculus, thermodynamics, christianity" 
          value={tags} 
          onChange={e => setTags(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
        <button type="button" className="html-paste-btn" onClick={pasteRawHtmlDirectly}>
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
        style={{ width: '100%', padding: '10px', marginTop: '15px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
      />
      <button onClick={handleSave} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
        {post ? 'Update Post' : 'Create Post'}
      </button>
    </div>
  );
}

export default QuillEditor;
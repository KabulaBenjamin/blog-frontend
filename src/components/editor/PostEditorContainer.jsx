import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';
import RawHtmlEditor from './RawHtmlEditor';
import MarkdownEditor from './MarkdownEditor';

export default function PostEditorContainer({ post, user, onSaved, onDelete }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(post ? post.title || '' : '');
  const [content, setContent] = useState(post ? post.content || post.body || '' : '');
  const [editorType, setEditorType] = useState(post ? post.editor_type || 'quill' : 'quill');
  const [status, setStatus] = useState(post ? post.status || 'published' : 'published');
  const [scheduledAt, setScheduledAt] = useState(post ? post.scheduled_at || '' : '');
  const [liveLink, setLiveLink] = useState(post ? post.live_link || '' : '');
  
  // 🏷️ Category State Matrix
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(post ? post.category_id || '' : '');
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [tags, setTags] = useState(post ? post.tags || '' : '');
  const [isDeleting, setIsDeleting] = useState(false);

  const quillRef = useRef(null);

  // 1. Fetch categories from Supabase-backed API endpoint
  useEffect(() => {
    fetch('https://blog-2y55.onrender.com/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          // Pre-select first category if creating a new post without selection
          if (!post && data.length > 0) {
            setSelectedCategoryId(data[0].id);
          }
        }
        setLoadingCategories(false);
      })
      .catch((err) => {
        console.error('Error fetching categories from backend:', err);
        setLoadingCategories(false);
      });
  }, [post]);

  const handleModeChange = (newMode) => {
    if (newMode === editorType) return;
    
    // Sync current Quill string when stepping out of Rich Text mode
    if (editorType === 'quill' && quillRef.current) {
      const currentQuillHtml = quillRef.current.getEditor().root.innerHTML;
      setContent(currentQuillHtml);
    }
    setEditorType(newMode);
  };

  const handleInsertDivider = () => {
    if (editorType === 'quill' && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.clipboard.dangerouslyPasteHTML(range.index, '<hr><p><br></p>');
    } else {
      setContent(prev => prev + '\n<hr>\n');
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('You must be logged in to save posts.');
      return;
    }

    let finalContent = content;
    if (editorType === 'quill' && quillRef.current) {
      finalContent = quillRef.current.getEditor().root.innerHTML;
    }

    const cleanTags = tags
      .toLowerCase()
      .split(',')
      .map(t => t.trim().replace(/\s+/g, '-'))
      .filter(Boolean)
      .join(', ');

    // Match selected category object to maintain backwards compatibility for 'category' text
    const activeCategoryObj = categories.find(c => String(c.id) === String(selectedCategoryId));

    try {
      const postData = {
        title,
        content: finalContent || '',
        editor_type: editorType,
        status,
        scheduled_at: status === 'scheduled' ? scheduledAt : null,
        live_link: liveLink || '',
        category: activeCategoryObj ? activeCategoryObj.name : 'Technology',
        category_id: selectedCategoryId ? Number(selectedCategoryId) : null,
        tags: cleanTags
      };

      let url = 'https://blog-2y55.onrender.com/posts';
      let method = 'POST';

      if (post && post.id) {
        url = `https://blog-2y55.onrender.com/posts/${post.id}`;
        method = 'PUT';
      } else {
        postData.user_id = user.id;
      }

      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
        credentials: 'include' 
      });
      
      const saved = await res.json();
      if (res.ok) {
        if (onSaved) onSaved(saved);
        alert(`Post ${post ? 'updated' : 'saved'} successfully!`);
        
        // Redirect home immediately after saving
        navigate('/');
      } else {
        alert(`Failed to save post: ${saved.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('An error occurred while saving the post.');
    }
  };

  const handleDelete = async () => {
    if (!post || !post.id) return;

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`https://blog-2y55.onrender.com/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (res.ok) {
        alert('Post deleted successfully!');
        if (onDelete) {
          onDelete(post.id);
        } else if (onSaved) {
          onSaved(null);
        }
        
        navigate('/');
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to delete post: ${errorData.message || 'Server error'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting the post.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Title */}
      <input
        type="text"
        placeholder="Post Title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ width: '100%', padding: '12px 16px', fontSize: '18px', fontWeight: '600', marginBottom: '20px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
      />

      {/* Category and Tags */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Category</label>
          <select 
            value={selectedCategoryId} 
            onChange={e => setSelectedCategoryId(e.target.value)}
            disabled={loadingCategories}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
          >
            {loadingCategories ? (
              <option value="">Loading categories...</option>
            ) : (
              categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#475569' }}>Subcategories / Tags</label>
          <input 
            type="text" 
            placeholder="javascript, calculus, thermodynamics" 
            value={tags} 
            onChange={e => setTags(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Mode Navigation Bar */}
      <div style={{ display: 'flex', gap: '6px', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px 6px 0 0', border: '1px solid #cbd5e1', borderBottom: 'none' }}>
        {[
          { id: 'quill', label: 'Rich Text (Quill)' },
          { id: 'html', label: 'Raw HTML Editor' },
          { id: 'markdown', label: 'Markdown Mode' }
        ].map(mode => (
          <button
            key={mode.id}
            type="button"
            onClick={() => handleModeChange(mode.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              background: editorType === mode.id ? '#2563eb' : '#e2e8f0',
              color: editorType === mode.id ? '#ffffff' : '#334155'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Sub-Editor Rendering */}
      {editorType === 'quill' && (
        <RichTextEditor 
          ref={quillRef} 
          content={content} 
          onChange={setContent} 
        />
      )}

      {editorType === 'html' && (
        <RawHtmlEditor 
          content={content} 
          onChange={setContent} 
          onInsertDivider={handleInsertDivider} 
        />
      )}

      {editorType === 'markdown' && (
        <MarkdownEditor 
          content={content} 
          onChange={setContent} 
          onInsertDivider={handleInsertDivider} 
        />
      )}

      {/* Footer Link */}
      <input
        type="text"
        placeholder="Optional Live Project Link (https://...)"
        value={liveLink}
        onChange={e => setLiveLink(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', marginTop: '20px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
      />

      {/* Posting Mode & Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontWeight: '600', fontSize: '13px', color: '#475569' }}>Posting Status:</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: '500' }}
          >
            <option value="published">🚀 Publish Now</option>
            <option value="draft">📝 Save as Draft</option>
            <option value="scheduled">⏰ Schedule for Later</option>
          </select>

          {status === 'scheduled' && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {post && post.id && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                padding: '12px 20px',
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '15px'
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Post'}
            </button>
          )}

          <button 
            type="button"
            onClick={handleSave} 
            style={{ padding: '12px 28px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}
          >
            {post ? 'Update Post' : status === 'draft' ? 'Save Draft' : status === 'scheduled' ? 'Schedule Post' : 'Publish Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
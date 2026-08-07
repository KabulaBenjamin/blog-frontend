// src/components/editor/RawHtmlEditor.jsx
import React, { useState } from 'react';
import './RawHtmlEditor.css';

export default function RawHtmlEditor({ content, onChange, onInsertDivider }) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="raw-html-editor-container">
      <div className="html-toolbar">
        <button 
          type="button" 
          onClick={() => setShowPreview(!showPreview)} 
          className="btn-toggle-preview"
        >
          {showPreview ? '✏️ Back to Code View' : '👁️ Toggle Live Preview'}
        </button>
        <button type="button" onClick={onInsertDivider} className="btn-divider">
          ⭕ Section Divider
        </button>
      </div>

      {showPreview ? (
        <div 
          className="html-preview-panel ql-editor"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      ) : (
        <textarea
          className="html-code-area"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<h1>Paste or write unfiltered HTML here...</h1>&#10;<div style='color: red;'>Custom styles preserved</div>"
        />
      )}
    </div>
  );
}
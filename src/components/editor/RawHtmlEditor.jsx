// src/components/editor/RawHtmlEditor.jsx
import React from 'react';
import './RawHtmlEditor.css';

export default function RawHtmlEditor({ content, onChange, onInsertDivider }) {
  return (
    <div className="raw-html-editor-container">
      <div className="raw-html-toolbar">
        <button 
          type="button" 
          onClick={onInsertDivider} 
          className="raw-html-divider-btn"
        >
          ➕ Insert Section Divider (&lt;hr&gt;)
        </button>
      </div>

      <textarea
        className="raw-html-textarea"
        placeholder="Paste or write raw HTML code here..."
        value={content}
        onChange={e => onChange(e.target.value)}
        spellCheck="false"
      />
    </div>
  );
}

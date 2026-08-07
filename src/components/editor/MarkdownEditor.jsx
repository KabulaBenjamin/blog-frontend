// src/components/editor/MarkdownEditor.jsx
import React from 'react';
import './MarkdownEditor.css';

export default function MarkdownEditor({ content, onChange, onInsertDivider }) {
  return (
    <div className="markdown-editor-container">
      <div className="markdown-toolbar">
        <span className="markdown-badge">Markdown Syntax</span>
        <button type="button" onClick={onInsertDivider} className="btn-divider">
          ⭕ Section Divider
        </button>
      </div>
      <textarea
        className="markdown-textarea"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="# Header 1&#10;&#10;Write Markdown text... Standard math supported: $E=mc^2$"
      />
    </div>
  );
}
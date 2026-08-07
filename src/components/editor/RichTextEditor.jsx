// src/components/editor/RichTextEditor.jsx
import React, { useMemo, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css';

const Font = Quill.import('formats/font');
Font.whitelist = ['serif', 'monospace', 'sans-serif', 'times-new-roman', 'arial', 'georgia'];
Quill.register(Font, true);

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

const RichTextEditor = forwardRef(({ content, onChange }, ref) => {
  const modules = useMemo(() => ({
    clipboard: {
      matchVisual: false,
      matchers: [['DIV', (node, delta) => delta]]
    },
    toolbar: {
      container: [
        [{ 'font': ['serif', 'monospace', 'sans-serif', 'times-new-roman', 'arial', 'georgia'] }],
        [{ 'header': [1, 2, 3, 4, false] }],
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
              formData.append('file', optimizedFile);
              formData.append('upload_preset', 'ml_default'); 

              const res = await fetch('https://api.cloudinary.com/v1_1/sy3yp1q8/image/upload', {
                method: 'POST',
                body: formData
              });
              
              if (res.ok) {
                const data = await res.json();
                const completeImageUrl = data.secure_url;

                if (ref && ref.current) {
                  const quill = ref.current.getEditor();
                  const range = quill.getSelection(true); 
                  quill.insertEmbed(range.index, 'image', completeImageUrl);
                  quill.setSelection(range.index + 1);
                }
              } else {
                const errData = await res.json();
                alert(`Cloudinary Error: ${errData.error?.message || 'Check upload preset'}`);
              }
            } catch (err) {
              alert('Network error during image upload.');
            }
          };
        }
      }
    }
  }), [ref]);

  return (
    <div className="rich-text-editor-container">
      <ReactQuill
        ref={ref} 
        theme="snow"
        value={content || ''}
        onChange={onChange}
        modules={modules}
        placeholder="Write rich text content here..."
      />
    </div>
  );
});

export default RichTextEditor;
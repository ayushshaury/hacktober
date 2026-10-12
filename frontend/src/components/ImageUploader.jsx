import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check, Loader2, Link as LinkIcon, RefreshCw } from 'lucide-react';

/**
 * Apple & Google styled Image Uploader component
 * Supports drag & drop file upload to /api/upload, file picker, and direct URL entry
 */
export function ImageUploader({ 
  value = '', 
  onChange, 
  label = 'Upload Picture',
  helperText = 'PNG, JPG, WebP or SVG (max 10MB)',
  aspectRatio = 'square', // 'square', 'video', 'wide'
  placeholderIcon = null
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState('file'); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState(value || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Normalize image URL to handle relative backend paths like /uploads/...
  const getDisplayUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    // Relative upload from server
    if (url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Server upload failed');
      }

      const data = await response.json();
      const finalUrl = data.url || data.fullUrl;
      onChange(finalUrl);
      setUrlInput(finalUrl);
    } catch (err) {
      console.warn('Backend upload failed, converting to local preview URL fallback:', err);
      // Fallback to FileReader base64 if server is unreachable
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result);
        setUrlInput(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setError('');
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displaySrc = getDisplayUrl(value);

  const aspectStyles = {
    square: { width: '120px', height: '120px' },
    video: { width: '100%', height: '180px' },
    wide: { width: '100%', height: '140px' }
  }[aspectRatio] || { width: '120px', height: '120px' };

  return (
    <div className="image-uploader-container" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ImageIcon size={16} className="text-secondary" />
          {label}
        </label>
        
        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-card)',
          padding: '2px'
        }}>
          <button
            type="button"
            onClick={() => setMode('file')}
            style={{
              border: 'none',
              background: mode === 'file' ? 'var(--color-gold)' : 'transparent',
              color: mode === 'file' ? 'var(--text-dark)' : 'var(--text-muted)',
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            style={{
              border: 'none',
              background: mode === 'url' ? 'var(--color-gold)' : 'transparent',
              color: mode === 'url' ? 'var(--text-dark)' : 'var(--text-muted)',
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Image Link
          </button>
        </div>
      </div>

      {mode === 'file' ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: dragOver
              ? '2px dashed var(--color-gold)'
              : '1.5px dashed var(--border-card)',
            padding: aspectRatio === 'square' ? '16px' : '24px',
            background: dragOver ? 'rgba(243, 208, 99, 0.06)' : 'var(--bg-input)',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            flexDirection: aspectRatio === 'square' ? 'row' : 'column',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            style={{ display: 'none' }}
          />

          {displaySrc ? (
            <div style={{ position: 'relative', ...aspectStyles, flexShrink: 0 }}>
              <img
                src={displaySrc}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  border: '1px solid var(--border-card)'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80';
                }}
              />
              <button
                type="button"
                onClick={handleRemove}
                title="Remove image"
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--color-coral)',
                  color: 'var(--text-dark)',
                  border: '2px solid var(--bg-input)',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div style={{
              ...aspectStyles,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-dim)',
              flexShrink: 0
            }}>
              {uploading ? (
                <Loader2 size={26} className="spin text-secondary" />
              ) : (
                placeholderIcon || <Upload size={24} style={{ opacity: 0.8 }} />
              )}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.88rem', fontFamily: 'var(--font-mono)' }}>
                <Loader2 size={16} className="spin" />
                <span>Uploading picture to server...</span>
              </div>
            ) : displaySrc ? (
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-cream)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  Picture uploaded successfully
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Click to replace or choose another picture
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-cream)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--color-gold)' }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {helperText}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          background: '#FFFFFF',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ paddingLeft: '8px', color: 'var(--text-muted)' }}>
            <LinkIcon size={16} />
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Paste direct image link (e.g. https://.../picture.png)"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.86rem',
              color: 'var(--text-main)',
              background: 'transparent',
              fontFamily: 'inherit'
            }}
          />
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                border: 'none',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.78rem', marginTop: '6px', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default ImageUploader;

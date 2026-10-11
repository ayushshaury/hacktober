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
      return `${url}`;
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

      const response = await fetch('/api/upload', {
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
        
        {/* Apple style toggle buttons */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(241, 245, 249, 0.9)', 
          borderRadius: '999px', 
          padding: '2px',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}>
          <button
            type="button"
            onClick={() => setMode('file')}
            style={{
              border: 'none',
              background: mode === 'file' ? '#FFFFFF' : 'transparent',
              color: mode === 'file' ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow: mode === 'file' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              borderRadius: '999px',
              padding: '3px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            style={{
              border: 'none',
              background: mode === 'url' ? '#FFFFFF' : 'transparent',
              color: mode === 'url' ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow: mode === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              borderRadius: '999px',
              padding: '3px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
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
              ? '2px dashed var(--color-secondary)' 
              : '1.5px dashed rgba(203, 213, 225, 0.9)',
            borderRadius: '16px',
            padding: aspectRatio === 'square' ? '16px' : '24px',
            background: dragOver ? 'rgba(239, 246, 255, 0.6)' : 'rgba(248, 250, 252, 0.6)',
            backdropFilter: 'blur(8px)',
            cursor: uploading ? 'wait' : 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: aspectRatio === 'square' ? 'row' : 'column',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="apple-box-hover"
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
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(226, 232, 240, 0.8)'
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
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  transition: 'transform 0.2s ease'
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
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              color: 'var(--color-secondary)',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                <Loader2 size={16} className="spin" />
                <span>Uploading picture to server...</span>
              </div>
            ) : displaySrc ? (
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                  Picture uploaded successfully
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Click to replace or choose another picture
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--color-secondary)' }}>Click to upload</span> or drag and drop
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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

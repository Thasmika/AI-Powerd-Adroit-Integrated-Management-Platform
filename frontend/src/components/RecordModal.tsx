import React, { useState, useRef } from 'react';
import styles from './RecordModal.module.css';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  mode: 'add' | 'view';
  onAddSuccess?: () => void;
}

export function RecordModal({ isOpen, onClose, category, mode, onAddSuccess }: RecordModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mockFiles, setMockFiles] = useState([
    { name: `${category}_Document_01.pdf`, date: '2023-10-12' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      // Simulate an upload delay
      setTimeout(() => {
        setMockFiles(prev => [
          ...prev, 
          { name: e.target.files![0].name, date: new Date().toISOString().split('T')[0] }
        ]);
        setIsUploading(false);
        if (onAddSuccess) onAddSuccess();
      }, 1500);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{mode === 'add' ? `Upload New ${category} Record` : `${category} Records`}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          {mode === 'add' ? (
            <div className={styles.emptyState}>
              <div className={styles.uploadIcon}>📁</div>
              <h3>Select a file to upload</h3>
              <p>Supported formats: PDF, JPG, PNG (Max 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              <button 
                className={styles.uploadButton} 
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Browse Files'}
              </button>
            </div>
          ) : (
            <div className={styles.mockFileList}>
              {mockFiles.map((file, idx) => (
                <div key={idx} className={styles.mockFileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileDate}>Uploaded on {file.date}</span>
                  </div>
                  <button className={styles.viewBtn}>Preview</button>
                </div>
              ))}
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  className={styles.uploadButton} 
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  onClick={handleUploadClick}
                >
                  + Add Another
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className={styles.fileInput}
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

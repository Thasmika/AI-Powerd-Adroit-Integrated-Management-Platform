"use client";

import React, { useState } from 'react';
import styles from './page.module.css';

interface RenewModalProps {
  assetId: number;
  docId: number;
  docType: string;
  currentNumber: string;
  onClose: () => void;
  onRenewSuccess: (newDoc: any) => void;
}

export default function RenewModal({ assetId, docId, docType, currentNumber, onClose, onRenewSuccess }: RenewModalProps) {
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    try {
      // 1. Create the renewal record
      const renewPayload = {
        document_number: docNumber,
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        notes: notes || null
      };

      const renewRes = await fetch(`${API_BASE}/assets/${assetId}/documents/${docId}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(renewPayload)
      });

      if (!renewRes.ok) {
        const errorData = await renewRes.json();
        throw new Error(errorData.detail || 'Renewal failed');
      }

      const newDoc = await renewRes.json();

      // 2. If there's a file, upload it to the newly created document
      if (file) {
        const fileData = new FormData();
        fileData.append('file', file);
        
        await fetch(`${API_BASE}/assets/${assetId}/documents/${newDoc.id}/upload`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: fileData
        });
      }

      onRenewSuccess(newDoc);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Renew {docType}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Current Document:</p>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentNumber || 'N/A'}</p>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--accent-solid)', color: '#fff', borderRadius: '4px' }}>Step 5: Renew</span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '4px' }}>Step 6: Update History</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>New Document Number</label>
              <input type="text" className={styles.inputField} required value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="e.g. REG-1234-NEW" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Issue Date</label>
                <input type="date" className={styles.inputField} value={issueDate} onChange={e => setIssueDate(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input type="date" className={styles.inputField} required value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Upload Scanned Copy (Optional)</label>
              <div 
                className={styles.fileUploadArea}
                onClick={() => document.getElementById('renewFileInput')?.click()}
              >
                <input 
                  type="file" 
                  id="renewFileInput" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
                <p>{file ? file.name : "Click to attach new document scan"}</p>
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className={styles.primaryButton} disabled={loading}>
              {loading ? 'Processing...' : 'Complete Renewal 🔄'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

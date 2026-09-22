"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';

interface HistoryDrawerProps {
  assetId: number;
  docId: number;
  docType: string;
  onClose: () => void;
}

export default function HistoryDrawer({ assetId, docId, docType, onClose }: HistoryDrawerProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const res = await fetch(`${API_BASE}/assets/${assetId}/documents/${docId}/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch history');
        
        const data = await res.json();
        setHistory(data.versions || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [assetId, docId]);

  return (
    <div className={styles.drawerOverlay} onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'flex-end'
    }}>
      <div className={styles.drawerContent} onClick={e => e.stopPropagation()} style={{
        width: '450px', background: 'var(--bg-default)', height: '100%',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <div className={styles.drawerHeader} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Document History</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>
        
        <div className={styles.drawerBody} style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{docType} Timeline</h3>
          
          {loading ? (
            <p>Loading history...</p>
          ) : error ? (
            <p style={{ color: '#ef4444' }}>{error}</p>
          ) : history.length === 0 ? (
            <p>No history found.</p>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-subtle)' }}>
              {history.map((doc, idx) => (
                <div key={doc.id} style={{ position: 'relative', marginBottom: '2rem' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute', left: '-1.5rem', transform: 'translateX(-50%)',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: doc.is_current ? '#10b981' : 'var(--border-subtle)',
                    border: '2px solid var(--bg-default)'
                  }} />
                  
                  <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: doc.is_current ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: doc.is_current ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {doc.document_number || 'Unnamed Doc'}
                      </span>
                      {doc.is_current && (
                        <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px' }}>
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div><span style={{ opacity: 0.7 }}>Issued:</span> {doc.issue_date || 'N/A'}</div>
                      <div><span style={{ opacity: 0.7 }}>Expires:</span> {doc.expiry_date || 'N/A'}</div>
                      <div style={{ gridColumn: '1 / -1' }}><span style={{ opacity: 0.7 }}>Status:</span> {doc.status}</div>
                      {doc.notes && <div style={{ gridColumn: '1 / -1' }}><span style={{ opacity: 0.7 }}>Notes:</span> {doc.notes}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </div>
  );
}

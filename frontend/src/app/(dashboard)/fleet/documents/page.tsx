"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RenewModal from './RenewModal';
import HistoryDrawer from './HistoryDrawer';
import styles from './page.module.css';

const API_BASE = 'http://localhost:8000/api/v1';

type AssetDoc = {
  id: number;
  asset_id: number;
  fleet_number?: string;
  document_type_id: number;
  document_number: string;
  expiry_date: string | null;
  issue_date: string | null;
  status: string;
  is_current: boolean;
};

const DOC_TYPE_LABELS: Record<number, string> = {
  1: 'Vehicle Registration',
  2: 'Motor Insurance',
  3: 'Safety Certificate',
  4: 'Inspection Permit',
  5: 'Heavy Vehicle Permit',
};

export default function FleetDocumentCentrePage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [allDocs, setAllDocs] = useState<(AssetDoc & { fleet_number: string })[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [renewDoc, setRenewDoc] = useState<any>(null);
  const [historyDoc, setHistoryDoc] = useState<any>(null);
  const [selectedDocTracker, setSelectedDocTracker] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const fetchDocuments = async (fetchHistory = false) => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const assetRes = await fetch(`${API_BASE}/assets/?limit=200`, { headers });
      if (!assetRes.ok) throw new Error("Failed to fetch assets");
      const assetList = await assetRes.json();
      
      if (!Array.isArray(assetList)) return;
      setAssets(assetList);

      // Fetch documents for each asset in parallel
      const docResults = await Promise.all(
        assetList.map(async (a) => {
          try {
            const endpoint = `${API_BASE}/assets/${a.id}/documents${fetchHistory ? '?history=true' : ''}`;
            const r = await fetch(endpoint, { headers });
            if (!r.ok) return [];
            const docs: AssetDoc[] = await r.json();
            return docs.map((d) => ({ ...d, fleet_number: a.fleet_number }));
          } catch { return []; }
        })
      );

      setAllDocs(docResults.flat().sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(showHistoryOnly);
  }, [showHistoryOnly]);

  const statusStyle = (s: string): React.CSSProperties => {
    switch (s) {
      case 'VALID':       return { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' };
      case 'URGENT':      return { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' };
      case 'RENEWAL DUE': return { background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.25)' };
      case 'EXPIRED':     return { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' };
      default:            return { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' };
    }
  };

  const filtered = allDocs
    .filter((d) => {
      const label = DOC_TYPE_LABELS[d.document_type_id] || `Type ${d.document_type_id}`;
      const matchSearch = d.fleet_number.toLowerCase().includes(search.toLowerCase())
        || (d.document_number && d.document_number.toLowerCase().includes(search.toLowerCase()))
        || label.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'All' || label === typeFilter;
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });

  const stats = [
    { label: 'Total Documents', value: allDocs.filter(d => d.is_current).length, icon: '📄' },
    { label: 'Valid', value: allDocs.filter(d => d.is_current && d.status === 'VALID').length, icon: '✅' },
    { label: 'Urgent / Due', value: allDocs.filter(d => d.is_current && (d.status === 'URGENT' || d.status === 'RENEWAL DUE')).length, icon: '⚠️' },
    { label: 'Expired', value: allDocs.filter(d => d.is_current && d.status === 'EXPIRED').length, icon: '🚨' },
  ];

  const handleSaveDoc = async () => {
    const assetSelect = document.getElementById('assetInput') as HTMLSelectElement;
    const typeSelect = document.getElementById('docTypeInput') as HTMLSelectElement;
    const assetIdValue = assetSelect?.value;
    const typeValue = typeSelect?.value || '1';
    const number = (document.getElementById('docNumberInput') as HTMLInputElement)?.value || '';
    const expiry = (document.getElementById('docExpiryInput') as HTMLInputElement)?.value || '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;

    if (!assetIdValue) {
      alert("Please select a vehicle");
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const formData = new FormData();
    formData.append('document_type_id', typeValue === 'Vehicle Registration' ? '1' : typeValue === 'Motor Insurance' ? '2' : '3');
    formData.append('document_number', number);
    if (expiry) formData.append('expiry_date', expiry);
    
    if (fileInput.files && fileInput.files.length > 0) {
      formData.append('file', fileInput.files[0]);
    }

    const res = await fetch(`${API_BASE}/assets/${assetIdValue}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    if (res.ok) {
      setShowUploadModal(false);
      setSelectedFileName(null);
      fetchDocuments(showHistoryOnly);
    } else {
      alert("Failed to save document.");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', animation: 'fadeInSlide 0.5s ease' }}>
      


      {/* Header & Stats */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Digital Document Centre</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage registrations, insurances, and safety compliance.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {stats.map((s, i) => (
             <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '1rem', minWidth: '130px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</span>
                  <span>{s.icon}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{loading ? '–' : s.value}</div>
             </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
          <input
            type="text" placeholder="Search fleet no., doc number..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ padding: '0.65rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}>
          <option value="All">All Types</option>
          {Object.values(DOC_TYPE_LABELS).map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.65rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}>
          <option value="All">All Statuses</option>
          {['VALID', 'URGENT', 'RENEWAL DUE', 'EXPIRED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <input type="checkbox" checked={showHistoryOnly} onChange={(e) => setShowHistoryOnly(e.target.checked)} />
          Include Archived History
        </label>
        
        <button 
          className={styles.primaryButton}
          style={{ marginLeft: 'auto', padding: '0.65rem 1.25rem', borderRadius: '8px' }}
          onClick={() => setShowUploadModal(true)}
        >
          + Upload Document
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ASSET</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>DOCUMENT TYPE</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>NUMBER & DATES</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATE</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>Loading documents...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>No documents found.</td></tr>
            ) : (
              filtered.map((d) => (
                <tr 
                  key={d.id} 
                  onClick={() => setSelectedDocTracker(d)}
                  style={{ 
                    borderBottom: '1px solid var(--border-subtle)', 
                    opacity: d.is_current ? 1 : 0.6,
                    cursor: 'pointer',
                    background: selectedDocTracker?.id === d.id ? 'rgba(14,165,233,0.05)' : 'transparent',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/assets/${d.asset_id}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 600, color: 'var(--accent-solid)', textDecoration: 'none' }}>
                      {d.fleet_number}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    {DOC_TYPE_LABELS[d.document_type_id] || `Type ${d.document_type_id}`}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontFamily: 'monospace', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{d.document_number || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Exp: <span style={{ color: d.status === 'EXPIRED' ? '#ef4444' : 'inherit' }}>{d.expiry_date || 'N/A'}</span></div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                      {d.is_current ? (
                         <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>CURRENT</span>
                      ) : (
                         <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>ARCHIVED</span>
                      )}
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600, ...statusStyle(d.status) }}>
                        {d.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {d.is_current && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setRenewDoc(d); }}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'var(--accent-solid)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          🔄 Renew
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setHistoryDoc(d); }}
                        style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        🕒 History
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {renewDoc && (
        <RenewModal 
          assetId={renewDoc.asset_id}
          docId={renewDoc.id}
          docType={DOC_TYPE_LABELS[renewDoc.document_type_id] || `Document`}
          currentNumber={renewDoc.document_number}
          onClose={() => setRenewDoc(null)}
          onRenewSuccess={() => {
            setRenewDoc(null);
            fetchDocuments(showHistoryOnly);
          }}
        />
      )}

      {historyDoc && (
        <HistoryDrawer 
          assetId={historyDoc.asset_id}
          docId={historyDoc.id}
          docType={DOC_TYPE_LABELS[historyDoc.document_type_id] || `Document`}
          onClose={() => setHistoryDoc(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowUploadModal(false); setSelectedFileName(null); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Upload Document</h2>
              <button className={styles.closeButton} onClick={() => { setShowUploadModal(false); setSelectedFileName(null); }}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Vehicle (Asset)</label>
                <select id="assetInput" className={styles.inputField} defaultValue="">
                  <option value="" disabled>Select Vehicle</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.fleet_number} - {a.make_model || a.registration_number}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Document Type</label>
                <select id="docTypeInput" className={styles.inputField} defaultValue="Vehicle Registration">
                  <option value="" disabled>Select Type</option>
                  <option value="Vehicle Registration">Vehicle Registration</option>
                  <option value="Motor Insurance">Motor Insurance</option>
                  <option value="Safety Certificate">Safety Certificate</option>
                  <option value="Inspection Permit">Inspection Permit</option>
                  <option value="Heavy Vehicle Permit">Heavy Vehicle Permit</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Document Number</label>
                <input id="docNumberInput" type="text" className={styles.inputField} placeholder="e.g. REG-1234" />
              </div>
              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input id="docExpiryInput" type="date" className={styles.inputField} />
              </div>
              <div className={styles.formGroup}>
                <label>Upload File</label>
                <div 
                  className={styles.fileUploadArea}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input 
                    type="file" 
                    id="fileInput" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <p>{selectedFileName || "Drag and drop or click to browse"}</p>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => { setShowUploadModal(false); setSelectedFileName(null); }}>Cancel</button>
              <button className={styles.primaryButton} onClick={handleSaveDoc}>Upload</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

"use client";

import React, { useState, useEffect, use } from 'react';
import styles from './page.module.css';
import RenewModal from '../../fleet/documents/RenewModal';
import HistoryDrawer from '../../fleet/documents/HistoryDrawer';

export default function AssetProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assetId } = use(params);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<any>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [renewDoc, setRenewDoc] = useState<any>(null);
  const [historyDoc, setHistoryDoc] = useState<any>(null);
  const [showHistoryOnly, setShowHistoryOnly] = useState(false);

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [viewingMaintenance, setViewingMaintenance] = useState<any>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<any>(null);
  const [selectedMaintenanceFileName, setSelectedMaintenanceFileName] = useState<string | null>(null);

  const [asset, setAsset] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'documents', label: 'Documents & Expiry' },
    { id: 'maintenance', label: 'Maintenance History' }
  ];

  const API_BASE = 'http://localhost:8000/api/v1';

  const DOC_TYPE_LABELS: Record<number, string> = {
    1: 'Vehicle Registration',
    2: 'Motor Insurance',
    3: 'Safety Certificate',
    4: 'Inspection Permit',
    5: 'Heavy Vehicle Permit',
  };

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const headers = { 'Authorization': `Bearer ${token}` };

      const [assetRes, docsRes, maintRes] = await Promise.all([
        fetch(`${API_BASE}/assets/${assetId}`, { headers }),
        fetch(`${API_BASE}/assets/${assetId}/documents${showHistoryOnly ? '?history=true' : ''}`, { headers }),
        fetch(`${API_BASE}/assets/${assetId}/maintenance`, { headers })
      ]);

      if (assetRes.ok) setAsset(await assetRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (maintRes.ok) setMaintenanceHistory(await maintRes.json());
    } catch (err) {
      setError('Failed to load asset data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, [assetId, showHistoryOnly]);

  const handleDeleteDoc = async (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE}/assets/${id}/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    }
  };

  const handleSaveDoc = async () => {
    const typeSelect = document.getElementById('docTypeInput') as HTMLSelectElement;
    const typeValue = typeSelect?.value || '1';
    const number = (document.getElementById('docNumberInput') as HTMLInputElement)?.value || '';
    const expiry = (document.getElementById('docExpiryInput') as HTMLInputElement)?.value || '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    // For now we don't handle file uploads fully in the frontend to avoid complex FormData for edits
    // Just sending basic JSON for PUT, or FormData for POST based on how the API was built
    // The API for POST accepts Form data.
    
    if (editingDoc) {
      // The API doesn't have a specific document PUT right now, only DELETE/POST. 
      // If we need to edit, we can delete and recreate or just simulate it for now.
      alert('Edit document not fully implemented in API. Delete and recreate instead.');
    } else {
      const formData = new FormData();
      formData.append('document_type_id', typeValue === 'Vehicle Registration' ? '1' : typeValue === 'Motor Insurance' ? '2' : '3');
      formData.append('document_number', number);
      if (expiry) formData.append('expiry_date', expiry);
      
      if (fileInput.files && fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
      }

      const res = await fetch(`${API_BASE}/assets/${assetId}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments([...documents, newDoc]);
      }
    }
    
    setShowUploadModal(false);
    setSelectedFileName(null);
    setEditingDoc(null);
  };

  const handleDeleteMaintenance = async (id: number) => {
    if (confirm("Are you sure you want to delete this maintenance log?")) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_BASE}/assets/${id}/maintenance/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMaintenanceHistory(maintenanceHistory.filter(log => log.id !== id));
      }
    }
  };

  const handleSaveMaintenance = async () => {
    const service = (document.getElementById('maintServiceInput') as HTMLInputElement)?.value || '';
    const provider = (document.getElementById('maintProviderInput') as HTMLInputElement)?.value || '';
    const date = (document.getElementById('maintDateInput') as HTMLInputElement)?.value || '';
    const cost = (document.getElementById('maintCostInput') as HTMLInputElement)?.value || '0';
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    const payload = {
      service,
      provider,
      date: date || new Date().toISOString().split('T')[0],
      cost: parseFloat(cost.replace(/[^0-9.-]+/g,"")) || 0,
      status: 'Completed'
    };

    if (editingMaintenance) {
      const res = await fetch(`${API_BASE}/assets/${assetId}/maintenance/${editingMaintenance.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setMaintenanceHistory(maintenanceHistory.map(log => log.id === updated.id ? updated : log));
      }
    } else {
      const res = await fetch(`${API_BASE}/assets/${assetId}/maintenance`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newLog = await res.json();
        setMaintenanceHistory([...maintenanceHistory, newLog]);
      }
    }

    setShowMaintenanceModal(false);
    setEditingMaintenance(null);
    setSelectedMaintenanceFileName(null);
  };

  if (loading) return <div className={styles.container}><p>Loading asset details...</p></div>;
  if (error || !asset) return <div className={styles.container}><p>{error || "Asset not found"}</p></div>;

  return (
    <>
      <div className={styles.container}>
        <div style={{marginBottom: '2rem'}}>
          <h1>{asset.fleet_number} - {asset.make_model || 'Unnamed Asset'}</h1>
          <p style={{color: 'var(--text-secondary)'}}>Registration: {asset.registration_number || 'N/A'}</p>
        </div>

        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'documents' && (
              <div className={styles.documentControl}>
                <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Compliance Documents</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={showHistoryOnly} onChange={(e) => setShowHistoryOnly(e.target.checked)} />
                      Show History
                    </label>
                    <button className={styles.primaryButton} onClick={() => { setEditingDoc(null); setShowUploadModal(true); }}>+ New Record</button>
                  </div>
                </div>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>Number & Dates</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc, idx) => (
                      <tr key={idx} style={{ opacity: doc.is_current ? 1 : 0.6 }}>
                        <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{DOC_TYPE_LABELS[doc.document_type_id] || `Type ${doc.document_type_id}`}</td>
                        <td>
                          <div style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{doc.document_number || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Exp: {doc.expiry_date || 'N/A'}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                            {doc.is_current ? (
                              <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>CURRENT</span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', borderRadius: '4px', background: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>ARCHIVED</span>
                            )}
                            <span className={`${styles.statusBadge} ${
                              doc.status === 'VALID' ? styles.statusValid : styles.statusUrgent
                            }`}>
                              {doc.status || 'VALID'}
                            </span>
                          </div>
                        </td>
                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className={styles.actionButton} onClick={() => setViewingDoc(doc)}>View</button>
                          {doc.is_current && (
                            <button className={styles.actionButton} onClick={() => setRenewDoc(doc)}>Renew</button>
                          )}
                          <button className={styles.actionButton} onClick={() => setHistoryDoc(doc)}>History</button>
                          <button className={`${styles.actionButton} ${styles.dangerButton}`} onClick={() => handleDeleteDoc(doc.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {documents.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{textAlign: 'center', padding: '2rem'}}>No documents found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'overview' && (
               <div className={styles.overviewGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>⏱️</div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricLabel}>Total Mileage</span>
                      <span className={styles.metricValue}>
                        {asset.total_mileage != null
                          ? asset.total_mileage.toLocaleString()
                          : 'N/A'}
                        {asset.total_mileage != null && <small> km</small>}
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>⛽</div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricLabel}>Fuel Efficiency</span>
                      <span className={styles.metricValue}>
                        {asset.fuel_efficiency != null
                          ? asset.fuel_efficiency.toFixed(1)
                          : 'N/A'}
                        {asset.fuel_efficiency != null && <small> L/100km</small>}
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>🔧</div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricLabel}>Next Service</span>
                      <span className={styles.metricValue}>
                        {asset.next_service_mileage != null
                          ? asset.next_service_mileage.toLocaleString()
                          : 'N/A'}
                        {asset.next_service_mileage != null && <small> km</small>}
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.metricIcon}>⚡</div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricLabel}>Engine Hours</span>
                      <span className={styles.metricValue}>
                        {asset.engine_hours != null
                          ? asset.engine_hours.toLocaleString()
                          : 'N/A'}
                        {asset.engine_hours != null && <small> hrs</small>}
                      </span>
                    </div>
                  </div>
               </div>
            )}
            {activeTab === 'maintenance' && (
               <div className={styles.documentControl}>
                  <div className={styles.sectionHeader}>
                    <h2>Service & Repair Logs</h2>
                    <button className={styles.primaryButton} onClick={() => { setEditingMaintenance(null); setShowMaintenanceModal(true); }}>+ Log Maintenance</button>
                  </div>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Service Details</th>
                        <th>Service Provider</th>
                        <th>Cost</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceHistory.map((log, idx) => (
                        <tr key={idx}>
                          <td style={{color: 'var(--text-secondary)'}}>{log.date}</td>
                          <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{log.service}</td>
                          <td>{log.provider}</td>
                          <td>${log.cost}</td>
                          <td>
                            <span className={styles.statusBadge} style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-valid)', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                              {log.status}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className={styles.actionButton} onClick={() => setViewingMaintenance(log)}>View</button>
                            <button className={styles.actionButton} onClick={() => { setEditingMaintenance(log); setShowMaintenanceModal(true); }}>Edit</button>
                            <button className={`${styles.actionButton} ${styles.dangerButton}`} onClick={() => handleDeleteMaintenance(log.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                      {maintenanceHistory.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>No maintenance logs found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowUploadModal(false); setSelectedFileName(null); setEditingDoc(null); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Upload Document</h2>
              <button className={styles.closeButton} onClick={() => { setShowUploadModal(false); setSelectedFileName(null); setEditingDoc(null); }}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Document Type</label>
                <select id="docTypeInput" className={styles.inputField} defaultValue="Vehicle Registration">
                  <option value="" disabled>Select Type</option>
                  <option value="Vehicle Registration">Vehicle Registration</option>
                  <option value="Motor Insurance">Motor Insurance</option>
                  <option value="Safety Certificate">Safety Certificate</option>
                  <option value="Other">Other</option>
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
              <button className={styles.cancelButton} onClick={() => { setShowUploadModal(false); setSelectedFileName(null); setEditingDoc(null); }}>Cancel</button>
              <button className={styles.primaryButton} onClick={handleSaveDoc}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingDoc && (
        <div className={styles.modalOverlay} onClick={() => setViewingDoc(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Document Details</h2>
              <button className={styles.closeButton} onClick={() => setViewingDoc(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.docDetailGrid}>
                <div className={styles.docDetailItem}>
                  <label>Type ID</label>
                  <p>{viewingDoc.document_type_id}</p>
                </div>
                <div className={styles.docDetailItem}>
                  <label>Number</label>
                  <p>{viewingDoc.document_number}</p>
                </div>
                <div className={styles.docDetailItem}>
                  <label>Expiry Date</label>
                  <p>{viewingDoc.expiry_date}</p>
                </div>
                <div className={styles.docDetailItem}>
                  <label>Status</label>
                  <span className={`${styles.statusBadge} ${
                    viewingDoc.status === 'VALID' ? styles.statusValid : styles.statusUrgent
                  }`}>
                    {viewingDoc.status || 'VALID'}
                  </span>
                </div>
              </div>
              <div className={styles.docPreviewArea}>
                <p>Document Preview Not Available</p>
                <button className={styles.actionButton}>Download File</button>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.primaryButton} onClick={() => setViewingDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Upload/Edit Modal */}
      {showMaintenanceModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowMaintenanceModal(false); setEditingMaintenance(null); setSelectedMaintenanceFileName(null); }}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingMaintenance ? 'Edit Maintenance Log' : 'Log Maintenance'}</h2>
              <button className={styles.closeButton} onClick={() => { setShowMaintenanceModal(false); setEditingMaintenance(null); setSelectedMaintenanceFileName(null); }}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Service Details</label>
                <input id="maintServiceInput" type="text" className={styles.inputField} placeholder="e.g. Oil Change" defaultValue={editingMaintenance?.service || ""} />
              </div>
              <div className={styles.formGroup}>
                <label>Service Provider</label>
                <input id="maintProviderInput" type="text" className={styles.inputField} placeholder="e.g. Toyota Center" defaultValue={editingMaintenance?.provider || ""} />
              </div>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input id="maintDateInput" type="date" className={styles.inputField} defaultValue={editingMaintenance?.date || ""} />
              </div>
              <div className={styles.formGroup}>
                <label>Cost</label>
                <input id="maintCostInput" type="text" className={styles.inputField} placeholder="0.00" defaultValue={editingMaintenance?.cost || ""} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => { setShowMaintenanceModal(false); setEditingMaintenance(null); setSelectedMaintenanceFileName(null); }}>Cancel</button>
              <button className={styles.primaryButton} onClick={handleSaveMaintenance}>
                {editingMaintenance ? 'Save Changes' : 'Log Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Maintenance Modal */}
      {viewingMaintenance && (
        <div className={styles.modalOverlay} onClick={() => setViewingMaintenance(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Maintenance Details</h2>
              <button className={styles.closeButton} onClick={() => setViewingMaintenance(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.docDetailGrid}>
                <div className={styles.docDetailItem}>
                  <label>Service</label>
                  <p>{viewingMaintenance.service}</p>
                </div>
                <div className={styles.docDetailItem}>
                  <label>Provider</label>
                  <p>{viewingMaintenance.provider}</p>
                </div>
                <div className={styles.docDetailItem}>
                  <label>Date</label>
                  <p>{viewingMaintenance.date}</p>
                </div>
                <div className={styles.docDetailItem}>
                  <label>Cost</label>
                  <p>${viewingMaintenance.cost}</p>
                </div>
                <div className={styles.docDetailItem}>
                  <label>Status</label>
                  <span className={styles.statusBadge} style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-valid)', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
                    {viewingMaintenance.status}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.primaryButton} onClick={() => setViewingMaintenance(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
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
            fetchAssetData();
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
    </>
  );
}

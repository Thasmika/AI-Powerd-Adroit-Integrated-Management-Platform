"use client";

import React, { useState } from 'react';
import styles from './page.module.css';

export default function RenewalCentrePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewRenewal, setViewRenewal] = useState<any>(null);
  const [editRenewal, setEditRenewal] = useState<any>(null);
  
  const [renewals, setRenewals] = useState([
    { id: 'RN-1029', assetId: 'VH-0108', type: 'Vehicle Registration', expiry: '2026-10-15', status: 'Expiring Soon', cost: '$120.00' },
    { id: 'RN-1030', assetId: 'VH-0108', type: 'Comprehensive Insurance', expiry: '2026-10-10', status: 'Expiring Soon', cost: '$450.00' },
    { id: 'RN-1031', assetId: 'TR-5022', type: 'Heavy Vehicle Permit', expiry: '2026-09-01', status: 'Expired', cost: '$300.00' },
    { id: 'RN-1032', assetId: 'EX-9901', type: 'Safety Inspection Certificate', expiry: '2027-01-20', status: 'Valid', cost: '$85.00' },
    { id: 'RN-1033', assetId: 'VH-0211', type: 'Vehicle Registration', expiry: '2027-05-11', status: 'Valid', cost: '$120.00' },
  ]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this renewal?")) {
      setRenewals(renewals.filter(r => r.id !== id));
    }
  };

  const filteredRenewals = renewals.filter(rn => 
    rn.assetId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rn.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Renewal Centre</h1>
          <p>Track and manage upcoming expiries for fleet registrations, insurances, and permits.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>+ Log Renewal</button>
      </header>

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by Asset ID or Document Type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <select className={styles.selectFilter}>
            <option>All Types</option>
            <option>Registration</option>
            <option>Insurance</option>
            <option>Permits</option>
            <option>Inspections</option>
          </select>
          <select className={styles.selectFilter}>
            <option>All Statuses</option>
            <option>Expiring Soon (30 Days)</option>
            <option>Expired</option>
            <option>Valid</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.renewalTable}>
          <thead>
            <tr>
              <th>Renewal Ref</th>
              <th>Asset ID</th>
              <th>Document Type</th>
              <th>Expiry Date</th>
              <th>Est. Cost</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRenewals.map((rn) => (
              <tr key={rn.id} className={styles.renewalRow}>
                <td className={styles.refId}>{rn.id}</td>
                <td><strong>{rn.assetId}</strong></td>
                <td>{rn.type}</td>
                <td className={styles.dateCol}>{rn.expiry}</td>
                <td className={styles.costCol}>{rn.cost}</td>
                <td>
                  <span className={`${styles.statusBadge} ${
                    rn.status === 'Valid' ? styles.statusValid : 
                    rn.status === 'Expiring Soon' ? styles.statusWarning : styles.statusError
                  }`}>
                    {rn.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className={styles.btnOutline}>Process</button>
                  <button className={styles.btnOutline} style={{ borderColor: 'rgba(14, 165, 233, 0.3)', color: '#0ea5e9' }} onClick={() => setViewRenewal(rn)}>View</button>
                  <button className={styles.btnOutline} style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }} onClick={() => setEditRenewal(rn)}>Edit</button>
                  <button className={styles.btnOutline} style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }} onClick={() => handleDelete(rn.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Log Renewal</h2>
              <button className={styles.closeModal} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Asset ID</label>
                <input type="text" placeholder="e.g. VH-0108" />
              </div>
              <div className={styles.formGroup}>
                <label>Document Type</label>
                <select>
                  <option>Vehicle Registration</option>
                  <option>Comprehensive Insurance</option>
                  <option>Heavy Vehicle Permit</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>New Expiry Date</label>
                <input type="date" />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={() => setIsModalOpen(false)}>Save Renewal</button>
            </div>
          </div>
        </div>
      )}
      {/* View Modal */}
      {viewRenewal && (
        <div className={styles.modalOverlay} onClick={() => setViewRenewal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>View Renewal Details</h2>
              <button className={styles.closeModal} onClick={() => setViewRenewal(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Renewal Ref:</strong> {viewRenewal.id}</div>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Asset ID:</strong> {viewRenewal.assetId}</div>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Document Type:</strong> {viewRenewal.type}</div>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Expiry Date:</strong> {viewRenewal.expiry}</div>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Est. Cost:</strong> {viewRenewal.cost}</div>
                <div><strong style={{ color: 'var(--text-secondary)' }}>Status:</strong> {viewRenewal.status}</div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnPrimary} onClick={() => setViewRenewal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRenewal && (
        <div className={styles.modalOverlay} onClick={() => setEditRenewal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Renewal {editRenewal.id}</h2>
              <button className={styles.closeModal} onClick={() => setEditRenewal(null)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Asset ID</label>
                <input type="text" defaultValue={editRenewal.assetId} />
              </div>
              <div className={styles.formGroup}>
                <label>Document Type</label>
                <select defaultValue={editRenewal.type}>
                  <option>Vehicle Registration</option>
                  <option>Comprehensive Insurance</option>
                  <option>Heavy Vehicle Permit</option>
                  <option>Safety Inspection Certificate</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input type="date" defaultValue={editRenewal.expiry} />
              </div>
              <div className={styles.formGroup}>
                <label>Estimated Cost</label>
                <input type="text" defaultValue={editRenewal.cost} />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setEditRenewal(null)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={() => {
                alert('Saved changes to ' + editRenewal.id);
                setEditRenewal(null);
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

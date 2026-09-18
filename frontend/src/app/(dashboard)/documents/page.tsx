"use client";

import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import styles from './page.module.css';

export default function DocumentExpiryCentrePage() {
  const [docs, setDocs] = useState([
    { type: 'Passport', number: 'N•••••••', expiry: '12 Mar 2027', status: 'VALID', action: 'View Document' },
    { type: 'Employment Visa', number: '•••••••', expiry: '08 Oct 2026', status: 'RENEWAL DUE', action: 'Initiate Renewal' },
    { type: 'Emirates ID', number: '784-••••', expiry: '08 Oct 2026', status: 'RENEWAL DUE', action: 'Initiate Renewal' },
    { type: 'Health Insurance', number: '•••••••', expiry: '31 Dec 2026', status: 'VALID', action: 'View Document' },
    { type: 'Qualification Certificate', number: 'Recorded', expiry: '-', status: 'ON FILE', action: 'View Document' },
  ]);

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'VALID': return styles.statusValid;
      case 'RENEWAL DUE': return styles.statusRenewalDue;
      case 'ON FILE': return styles.statusOnFile;
      default: return '';
    }
  };

  const handleView = (doc: any) => {
    alert(`Viewing Details for ${doc.type}\nDocument No: ${doc.number}\nExpiry Date: ${doc.expiry}\nStatus: ${doc.status}`);
  };

  const handleEdit = (doc: any) => {
    alert(`Opening edit form for ${doc.type}... (Mock function)`);
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const newDocs = [...docs];
      newDocs.splice(index, 1);
      setDocs(newDocs);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Document & Expiry Centre</h1>
          <p>Centralized repository for all employee compliance documents.</p>
        </div>
      </header>

      {/* Info Boxes */}
      <div className={styles.infoBoxes}>
        <div className={`${styles.infoBox} ${styles.boxBlue}`}>
          <div className={styles.icon}>⏰</div>
          <div className={styles.boxContent}>
            <h4>Advance Warning</h4>
            <p>System highlights documents before expiry so renewal work can start early.</p>
          </div>
        </div>
        
        <div className={`${styles.infoBox} ${styles.boxOrange}`}>
          <div className={styles.icon}>👥</div>
          <div className={styles.boxContent}>
            <h4>Assigned Responsibility</h4>
            <p>Alerts appear for the designated officer responsible for action.</p>
          </div>
        </div>
        
        <div className={`${styles.infoBox} ${styles.boxGreen}`}>
          <div className={styles.icon}>⚡</div>
          <div className={styles.boxContent}>
            <h4>Easy Retrieval</h4>
            <p>Authorized users open the scanned copy directly from the employee record.</p>
          </div>
        </div>
      </div>

      {/* Document Table */}
      <div className={styles.tableContainer}>
        <table className={styles.docTable}>
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Document No.</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, index) => (
              <tr key={index}>
                <td className={styles.typeCell}>{doc.type}</td>
                <td className={styles.monoCell}>{doc.number}</td>
                <td>{doc.expiry}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button className={`${styles.actionBtn} ${doc.status === 'RENEWAL DUE' ? styles.primaryBtn : ''}`}>
                    {doc.action}
                  </button>
                  <div className={styles.iconGroup}>
                    <button className={styles.iconBtn} title="View Details" onClick={() => handleView(doc)}>
                      <Eye size={18} />
                    </button>
                    <button className={styles.iconBtn} title="Edit Document" onClick={() => handleEdit(doc)}>
                      <Edit size={18} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete Document" onClick={() => handleDelete(index)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

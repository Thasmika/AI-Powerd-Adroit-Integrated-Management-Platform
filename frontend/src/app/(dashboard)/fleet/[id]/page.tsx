"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function VehicleProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  // Form State (Mock data for the prototype)
  const [formData, setFormData] = useState({
    fleetNumber: 'VH-0108',
    registrationNumber: 'DXB 12345',
    category: 'Light Vehicle',
    makeModel: 'Toyota Hilux',
    year: '2024',
    color: 'White',
    chassisVin: 'JT111222333444555',
    engineNumber: '2TR-1234567',
    department: 'Transport',
    location: 'Aweer',
    operationalStatus: 'Active',
    remarks: 'Available',
  });

  // Modal & Records State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({ documentName: '', expiryDate: '', fileUrl: '' });
  const [records, setRecords] = useState<any[]>([
    { id: 1, tab: 'Registration', documentName: 'Vehicle Registration Card', expiryDate: '2027-10-15', status: 'VALID', action: 'View Document' }
  ]);

  useEffect(() => {
    // Simulate fetching vehicle details
    setTimeout(() => {
      setLoading(false);
    }, 400);
  }, [resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setRecords(prev => [...prev, {
      id: Date.now(),
      tab: activeTab,
      documentName: recordForm.documentName,
      expiryDate: recordForm.expiryDate,
      status: 'VALID',
      action: 'View Document'
    }]);
    setIsModalOpen(false);
    setRecordForm({ documentName: '', expiryDate: '', fileUrl: '' });
  };

  const tabs = [
    'Overview', 'Registration', 'Insurance', 'Safety', 
    'Certificates', 'Documents', 'History'
  ];

  const handleSaveData = () => {
    alert(`Vehicle ${formData.fleetNumber} saved successfully!`);
  };

  if (loading) {
    return <div className={styles.container}>Loading vehicle master...</div>;
  }

  const tabRecords = records.filter(r => r.tab === activeTab);

  return (
    <>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>Vehicle Master</h1>
            <p>Integrated profile and digital records for asset {formData.fleetNumber}.</p>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.btnPrimary} onClick={handleSaveData}>💾 Save Data</button>
          </div>
        </header>

        {/* Premium Profile Header Block */}
        <div className={styles.profileHeader}>
          <div className={styles.leftBlock}>
            <div className={styles.photoContainer}>
              <div className={styles.photoPlaceholder} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>
                <span className={styles.initials} style={{ fontSize: '1.5rem' }}>VH</span>
              </div>
            </div>
            <div className={styles.empIdGroup}>
              <div className={styles.empIdItem}>
                <label className={styles.empIdLabel}>FLEET NO</label>
                <input 
                  type="text" 
                  name="fleetNumber" 
                  value={formData.fleetNumber} 
                  onChange={handleChange}
                  className={styles.idInput}
                />
              </div>
              <div className={styles.empIdItem}>
                <label className={styles.empIdLabel}>REG NO</label>
                <input 
                  type="text" 
                  name="registrationNumber" 
                  value={formData.registrationNumber} 
                  onChange={handleChange}
                  className={styles.idInput}
                />
              </div>
            </div>
          </div>
          
          <div className={styles.middleBlock}>
            <div className={styles.blockTitle}>
              <span className={styles.icon}>🚛</span> Asset Information
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoGroupFull}>
                <label>Make & Model</label>
                <input type="text" name="makeModel" value={formData.makeModel} onChange={handleChange} className={styles.inputField} />
              </div>
              <div className={styles.infoGroup}>
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={styles.selectField}>
                  <option value="Light Vehicle">Light Vehicle</option>
                  <option value="Heavy Vehicle">Heavy Vehicle</option>
                  <option value="Trailer">Trailer</option>
                </select>
              </div>
              <div className={styles.infoGroup}>
                <label>Year</label>
                <input type="text" name="year" value={formData.year} onChange={handleChange} className={styles.inputField} />
              </div>
              <div className={styles.infoGroup}>
                <label>Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className={styles.inputField} />
              </div>
              <div className={styles.infoGroup}>
                <label>Operational Status</label>
                <select name="operationalStatus" value={formData.operationalStatus} onChange={handleChange} className={styles.selectField}>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.rightBlock}>
            <div className={styles.blockTitle}>
              <span className={styles.icon}>📋</span> Technical Details
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoGroupFull}>
                <label>Chassis / VIN</label>
                <input type="text" name="chassisVin" value={formData.chassisVin} onChange={handleChange} className={styles.inputField} />
              </div>
              <div className={styles.infoGroupFull}>
                <label>Engine Number</label>
                <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} className={styles.inputField} />
              </div>
              <div className={styles.infoGroup}>
                <label>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className={styles.inputField} />
              </div>
              <div className={styles.infoGroup}>
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={styles.inputField} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          {tabs.map(tab => (
            <button 
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'Overview' && (
            <div className={styles.tabGrid}>
              <div className={styles.tabInfoGroup}>
                <label>Remarks</label>
                <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} className={styles.inputField} />
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <>
              {tabRecords.length === 0 ? (
                <div className={styles.contentPlaceholder}>
                  <div className={styles.glowIcon} style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' }}>📄</div>
                  <h3>{activeTab} Records</h3>
                  <p>Digital records, scanned documents and configurations for this vehicle category.</p>
                  <button 
                    className={styles.btnSecondary} 
                    style={{marginTop: '1rem'}}
                    onClick={() => setIsModalOpen(true)}
                  >
                    + Add Record
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600 }}>{activeTab} Records</h3>
                    <button className={styles.btnSecondary} onClick={() => setIsModalOpen(true)}>+ Add Record</button>
                  </div>
                  <div className={styles.tableContainer}>
                    <table className={styles.vehicleTable}>
                      <thead>
                        <tr>
                          <th>Document Name</th>
                          <th>Expiry Date</th>
                          <th>Status</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabRecords.map(r => (
                          <tr key={r.id} className={styles.vehicleRow}>
                            <td style={{ fontWeight: 500 }}>{r.documentName}</td>
                            <td>{r.expiryDate || 'N/A'}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles.statusValid || ''}`} style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '0.4rem 0.8rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button className={styles.btnSecondary} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>{r.action}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add {activeTab} Record</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className={styles.formContainer}>
              <form onSubmit={handleAddRecord}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Document Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Annual Insurance Policy"
                      value={recordForm.documentName} 
                      onChange={e => setRecordForm({...recordForm, documentName: e.target.value})} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Expiry Date</label>
                    <input 
                      type="date" 
                      value={recordForm.expiryDate} 
                      onChange={e => setRecordForm({...recordForm, expiryDate: e.target.value})} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Upload Document</label>
                    <input type="file" />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitBtn}>Add Record</button>
                  <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

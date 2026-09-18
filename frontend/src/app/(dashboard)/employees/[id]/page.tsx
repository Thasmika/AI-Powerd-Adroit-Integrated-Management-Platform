"use client";

import React, { useState, useRef } from 'react';
import styles from './page.module.css';
import { RecordModal } from '@/components/RecordModal';
import { AddEmployeeModal } from '@/components/AddEmployeeModal';
import { useToast } from '@/components/Toast';

export default function EmployeeProfilePage() {
  const [activeTab, setActiveTab] = useState('Employment');
  const [isEditing, setIsEditing] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    empNo: '1',
    empCode: 'SAK',
    empName: 'Shaikh Abdul Kader Shaikh Abdul Karim',
    department: 'Administration',
    designation: 'Finance Manager',
    salaryCategory: '1',
    activeStatus: true,
    salaryTransferStatus: true,
    sponsor: 'Adroit Enterprises L.L.C Satwa Branch',
    visaIssuedBy: 'Adroit Building Material Trading Enterprises',
    companyMolId: '229089',
    empMolId: '10059009213640',
    healthCardNo: '302620122',
    insurer: 'OMAN',
    bankName: '',
    bankAc: 'AE160260001012468094101',
    routingNo: '92024511',
    eidNo: '784-1959-3109102-9',
    uidNo: '',
    password: 'password123'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const tabs = [
    'Employment', 'Salary', 'Personal', 'Passport', 'Visa', 
    'License', 'LabourCard', 'Certificate', 'Documents', 'Leave'
  ];

  const handleSaveData = () => {
    // Mock save process
    showToast(`Employee ${formData.empName} saved successfully!`, 'success');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      showToast('Employee record deleted.', 'error');
    }
  };

  const handleAddNew = () => {
    setIsAddEmployeeModalOpen(true);
  };

  const handleAddEmployeeSuccess = (data: any) => {
    setIsAddEmployeeModalOpen(false);
    showToast(`Employee ${data.firstName} ${data.lastName} created successfully!`, 'success');
  };

  const handleChangePhoto = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      showToast('Photo uploaded successfully.', 'success');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Employee Register</h1>
          <p>Manage and edit employee records and configurations.</p>
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.btnSecondary} onClick={handleAddNew}>+ Add New</button>
          <button className={styles.btnDanger} onClick={handleDelete}>Delete</button>
          <button className={styles.btnPrimary} onClick={handleSaveData}>💾 Save Data</button>
        </div>
      </header>

      {/* Premium Profile Header Block - Editable */}
      <div className={styles.profileHeader}>
        <div className={styles.leftBlock}>
          <div className={styles.photoContainer}>
            <div className={styles.photoPlaceholder}>
              <span className={styles.initials}>SA</span>
            </div>
            <button className={styles.changePhotoBtn} onClick={handleChangePhoto}>Change Photo</button>
            <input 
              type="file" 
              ref={photoInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handlePhotoUpload} 
            />
          </div>
          <div className={styles.empIdGroup}>
            <div className={styles.empIdItem}>
              <label className={styles.empIdLabel}>EMP NO</label>
              <input 
                type="text" 
                name="empNo" 
                value={formData.empNo} 
                onChange={handleChange}
                className={styles.idInput}
              />
            </div>
            <div className={styles.empIdItem}>
              <label className={styles.empIdLabel}>EMP CODE</label>
              <input 
                type="text" 
                name="empCode" 
                value={formData.empCode} 
                onChange={handleChange}
                className={styles.idInput}
              />
            </div>
          </div>
        </div>
        
        <div className={styles.middleBlock}>
          <div className={styles.blockTitle}>
            <span className={styles.icon}>👤</span> Employee Information
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoGroupFull}>
              <label>Employee Name</label>
              <input type="text" name="empName" value={formData.empName} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.infoGroup}>
              <label>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} className={styles.selectField}>
                <option value="Administration">Administration</option>
                <option value="Finance">Finance</option>
                <option value="HR">HR</option>
                <option value="Transport">Transport</option>
              </select>
            </div>
            <div className={styles.infoGroup}>
              <label>Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.infoGroup}>
              <label>Salary Category</label>
              <input type="text" name="salaryCategory" value={formData.salaryCategory} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.infoGroup}>
              <label>System Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.checkboxGroupRow}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="activeStatus" checked={formData.activeStatus} onChange={handleChange} className={styles.checkbox} />
                Active Status
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" name="salaryTransferStatus" checked={formData.salaryTransferStatus} onChange={handleChange} className={styles.checkbox} />
                Salary Transfer Status
              </label>
            </div>
          </div>
        </div>

        <div className={styles.rightBlock}>
          <div className={styles.blockTitle}>
            <span className={styles.icon}>🏢</span> Employment & Sponsorship
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoGroupFull}>
              <label>Sponsor</label>
              <select name="sponsor" value={formData.sponsor} onChange={handleChange} className={styles.selectField}>
                <option value="Adroit Enterprises L.L.C Satwa Branch">Adroit Enterprises L.L.C Satwa Branch</option>
                <option value="Group Company">Group Company</option>
              </select>
            </div>
            <div className={styles.infoGroupFull}>
              <label>Visa Issued By</label>
              <select name="visaIssuedBy" value={formData.visaIssuedBy} onChange={handleChange} className={styles.selectField}>
                <option value="Adroit Building Material Trading Enterprises">Adroit Building Material Trading Enterprises</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.infoGroup}>
              <label>Company MOL ID</label>
              <input type="text" name="companyMolId" value={formData.companyMolId} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.infoGroup}>
              <label>Emp MOL ID</label>
              <input type="text" name="empMolId" value={formData.empMolId} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.infoGroup}>
              <label>Health Card No</label>
              <input type="text" name="healthCardNo" value={formData.healthCardNo} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.infoGroup}>
              <label>Insurer</label>
              <input type="text" name="insurer" value={formData.insurer} onChange={handleChange} className={styles.inputField} />
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
        {activeTab === 'Salary' && (
          <div className={styles.tabGrid}>
            <div className={styles.tabInfoGroup}>
              <label>Bank Name</label>
              <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.tabInfoGroup}>
              <label>Bank A/C</label>
              <input type="text" name="bankAc" value={formData.bankAc} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.tabInfoGroup}>
              <label>Routing No</label>
              <input type="text" name="routingNo" value={formData.routingNo} onChange={handleChange} className={styles.inputField} />
            </div>
          </div>
        )}

        {activeTab === 'Personal' && (
          <div className={styles.tabGrid}>
            <div className={styles.tabInfoGroup}>
              <label>EID No</label>
              <input type="text" name="eidNo" value={formData.eidNo} onChange={handleChange} className={styles.inputField} />
            </div>
            <div className={styles.tabInfoGroup}>
              <label>UID No</label>
              <input type="text" name="uidNo" value={formData.uidNo} onChange={handleChange} className={styles.inputField} />
            </div>
          </div>
        )}

        {activeTab !== 'Salary' && activeTab !== 'Personal' && (
          <div className={styles.contentPlaceholder}>
            <div className={styles.glowIcon}>📄</div>
            <h3>{activeTab} Records</h3>
            <p>Digital records, scanned documents and configurations for this category.</p>
            <button 
              className={styles.btnSecondary} 
              style={{marginTop: '1rem'}}
              onClick={() => setIsRecordModalOpen(true)}
            >
              + Add Record
            </button>
          </div>
        )}
      </div>

      <RecordModal 
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        category={activeTab}
        mode="add"
        onAddSuccess={() => showToast(`${activeTab} document uploaded successfully.`, 'success')}
      />
      
      <AddEmployeeModal 
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSuccess={handleAddEmployeeSuccess}
      />
      
      <ToastContainer />
    </div>
  );
}

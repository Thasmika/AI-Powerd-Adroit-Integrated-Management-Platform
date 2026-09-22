"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { RecordModal } from '@/components/RecordModal';

interface EmployeeData {
  id: number;
  name: string;
  department: string;
  designation: string;
  nationality: string;
  dob: string;
  contact: string;
  employmentStatus: string;
  visaIssuedBy: string;
  departmentHead: string;
  joiningDate: string;
  insurancePlan: string;
  operationalCompany: string;
  photoUrl: string | null;
  // Salary
  salaryCategory: string;
  salaryTransferStatus: string;
  bankName: string;
  bankAc: string;
  routingNo: string;
  // Personal & Labour
  eidNo: string;
  uidNo: string;
  companyMolId: string;
  empMolId: string;
  healthCardNo: string;
  insuranceProvider: string;
  notes: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function EmployeeMasterPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('Employment');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof EmployeeData, value: string | boolean) => {
    if (employeeData) {
      setEmployeeData({ ...employeeData, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!employeeData) return;
    setIsSaving(true);
    setError(null);
    try {
      const updatePayload = {
        employment_status: employeeData.employmentStatus,
        joining_date: employeeData.joiningDate && employeeData.joiningDate !== 'N/A' ? employeeData.joiningDate : null,
        salary_category: employeeData.salaryCategory,
        salary_transfer_status: employeeData.salaryTransferStatus === 'Active',
        bank_name: employeeData.bankName,
        bank_ac: employeeData.bankAc,
        routing_no: employeeData.routingNo,
        eid_no: employeeData.eidNo,
        uid_no: employeeData.uidNo,
        nationality: employeeData.nationality,
        date_of_birth: employeeData.dob && employeeData.dob !== 'N/A' ? employeeData.dob : null,
        company_mol_id: employeeData.companyMolId,
        emp_mol_id: employeeData.empMolId,
        health_card_no: employeeData.healthCardNo,
        insurance_provider: employeeData.insuranceProvider,
        notes: employeeData.notes
      };

      const response = await fetch(`${API_BASE}/employees/${employeeData.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save employee details');
      }

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderActionButtons = () => (
    <div className={styles.actionButtons}>
      {isEditing ? (
        <>
          <button className={styles.btnCancel} onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      ) : (
        <button className={styles.btnPrimary} onClick={() => setIsEditing(true)}>Edit Details</button>
      )}
    </div>
  );

  const renderField = (label: string, field: keyof EmployeeData, isDate: boolean = false, isSelect: boolean = false, options: string[] = []) => (
    <div className={styles.tabInfoGroup}>
      <label>{label}</label>
      {isEditing ? (
        isSelect ? (
          <select 
            className={styles.input} 
            value={employeeData?.[field] as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
          >
            <option value="" disabled>Select...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={isDate ? "date" : "text"} 
            className={styles.input} 
            value={employeeData?.[field] === 'N/A' ? '' : employeeData?.[field] as string || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        )
      ) : (
        <span className={styles.detailValue}>
          {field === 'employmentStatus' ? (
            <span className={`${styles.detailValue} ${styles.statusActive}`}>
              {employeeData?.[field] as string}
            </span>
          ) : (
            employeeData?.[field] as string
          )}
        </span>
      )}
    </div>
  );

  const tabs = [
    'Employment', 'Salary', 'Personal', 'Passport', 'Visa', 
    'License', 'LabourCard', 'Certificate', 'Documents', 'Leave'
  ];

  // Debounce search effect
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!employeeId.trim() && !employeeName.trim()) {
        setEmployeeData(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();
        if (employeeId.trim()) queryParams.append('employee_id', employeeId.trim());
        if (employeeName.trim()) queryParams.append('name', employeeName.trim());

        const response = await fetch(`${API_BASE}/employees/?${queryParams.toString()}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employee details');
        }

        const data = await response.json();

        if (data && data.length > 0) {
          const emp = data[0];
          setEmployeeData({
            id: emp.id,
            name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'N/A',
            department: emp.department_id ? `Dept ID: ${emp.department_id}` : 'N/A',
            designation: emp.designation || 'N/A',
            nationality: emp.nationality || 'N/A',
            dob: emp.date_of_birth || 'N/A',
            contact: emp.contact_number || 'N/A',
            employmentStatus: emp.employment_status || 'N/A',
            visaIssuedBy: emp.visa_sponsoring_company_id ? `Company ID: ${emp.visa_sponsoring_company_id}` : 'N/A',
            departmentHead: emp.department_head_id ? `Head ID: ${emp.department_head_id}` : 'N/A',
            joiningDate: emp.joining_date || 'N/A',
            insurancePlan: emp.insurance_plan || 'N/A',
            operationalCompany: emp.operating_company_id ? `Company ID: ${emp.operating_company_id}` : 'N/A',
            photoUrl: emp.photo_url || null,
            salaryCategory: emp.salary_category || 'N/A',
            salaryTransferStatus: emp.salary_transfer_status ? 'Active' : 'Inactive',
            bankName: emp.bank_name || 'N/A',
            bankAc: emp.bank_ac || 'N/A',
            routingNo: emp.routing_no || 'N/A',
            eidNo: emp.eid_no || 'N/A',
            uidNo: emp.uid_no || 'N/A',
            companyMolId: emp.company_mol_id || 'N/A',
            empMolId: emp.emp_mol_id || 'N/A',
            healthCardNo: emp.health_card_no || 'N/A',
            insuranceProvider: emp.insurance_provider || 'N/A',
            notes: emp.notes || ''
          });
        } else {
          setEmployeeData(null);
          setError("No employee found matching the search criteria.");
        }
      } catch (err: any) {
        setEmployeeData(null);
        if (err.message === 'Failed to fetch') {
          setError('Unable to connect to the server. Please check if the backend API is running.');
        } else {
          setError(err.message || 'An error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchEmployee();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [employeeId, employeeName]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'id') setEmployeeId(value);
    if (name === 'name') setEmployeeName(value);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Employee Master</h1>
          <p>Search and manage comprehensive employee records.</p>
        </div>
      </header>

      <div className={styles.searchSection}>
        <div className={styles.inputGroup}>
          <label htmlFor="empId" className={styles.label}>Employee ID</label>
          <input 
            type="text" 
            id="empId"
            name="id"
            value={employeeId} 
            onChange={handleSearch} 
            placeholder="e.g. EMP-1024"
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="empName" className={styles.label}>Employee Name</label>
          <input 
            type="text" 
            id="empName"
            name="name"
            value={employeeName} 
            onChange={handleSearch} 
            placeholder="e.g. John Doe"
            className={styles.input}
          />
        </div>
      </div>

      {loading && <div className={styles.emptyState}>Loading employee details...</div>}
      
      {!loading && error && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>❌</div>
          <h3 style={{ color: '#ef4444' }}>{error}</h3>
        </div>
      )}

      {!loading && !error && employeeData ? (
        <>
          <div className={styles.gridContainer}>
            {/* Employee Information */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Employee Information</h2>
              </div>
              <div className={styles.panelContent}>
                <div className={styles.photoContainer}>
                  <div className={styles.photoWrapper}>
                    {employeeData.photoUrl ? (
                      <img 
                        src={employeeData.photoUrl} 
                        alt={employeeData.name} 
                        className={styles.photo} 
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.875rem' }}>
                        No photo
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Employee Name</span>
                    <span className={styles.detailValue}>{employeeData.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Department</span>
                    <span className={styles.detailValue}>{employeeData.department}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Designation</span>
                    <span className={styles.detailValue}>{employeeData.designation}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Nationality</span>
                    <span className={styles.detailValue}>{employeeData.nationality}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Date of Birth</span>
                    <span className={styles.detailValue}>{employeeData.dob}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Contact</span>
                    <span className={styles.detailValue}>{employeeData.contact}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment & Sponsorship */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Employment &amp; Sponsorship</h2>
              </div>
              <div className={styles.panelContentAlt}>
                <div className={styles.detailsGridAlt}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Employment Status</span>
                    <span className={`${styles.detailValue} ${styles.statusActive}`}>
                      {employeeData.employmentStatus}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Visa Issued By</span>
                    <span className={styles.detailValue}>{employeeData.visaIssuedBy}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Department Head</span>
                    <span className={styles.detailValue}>{employeeData.departmentHead}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Joining Date</span>
                    <span className={styles.detailValue}>{employeeData.joiningDate}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Insurance Plan</span>
                    <span className={styles.detailValue}>{employeeData.insurancePlan}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Operational Company</span>
                    <span className={styles.detailValue}>{employeeData.operationalCompany}</span>
                  </div>
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
                {renderField('Bank Name', 'bankName')}
                {renderField('Bank A/C', 'bankAc')}
                {renderField('Routing No', 'routingNo')}
                {renderField('Salary Category', 'salaryCategory')}
                {renderField('Transfer Status', 'salaryTransferStatus', false, true, ['Active', 'Inactive'])}
              </div>
            )}

            {activeTab === 'Personal' && (
              <div className={styles.tabGrid}>
                {renderField('EID No', 'eidNo')}
                {renderField('UID No', 'uidNo')}
                {renderField('Nationality', 'nationality')}
                {renderField('Date of Birth', 'dob', true)}
              </div>
            )}

            {activeTab === 'LabourCard' && (
              <div className={styles.tabGrid}>
                {renderField('Company MOL ID', 'companyMolId')}
                {renderField('Emp MOL ID', 'empMolId')}
                {renderField('Health Card No', 'healthCardNo')}
                {renderField('Insurance Provider', 'insuranceProvider')}
              </div>
            )}

            {/* Employment is partially shown in the top panels, but we can put some extras here if needed, or leave it generic */}
            {activeTab === 'Employment' && (
              <div className={styles.tabGrid}>
                {renderField('Employment Status', 'employmentStatus', false, true, ['Active', 'Inactive', 'Terminated', 'On Leave'])}
                {renderField('Joining Date', 'joiningDate', true)}
              </div>
            )}

            {/* Fallback for other tabs */}
            {!['Salary', 'Personal', 'LabourCard', 'Employment'].includes(activeTab) && (
              <div className={styles.contentPlaceholder}>
                <div className={styles.glowIcon}>
                  {activeTab === 'Leave' ? '🌴' : 
                   activeTab === 'Documents' ? '📁' : 
                   activeTab === 'Passport' ? '🛂' :
                   activeTab === 'Visa' ? '✈️' :
                   activeTab === 'License' ? '🪪' :
                   activeTab === 'Certificate' ? '📜' : '📄'}
                </div>
                <h3>{activeTab} Records</h3>
                <p>Digital records, scanned documents and configurations for {activeTab}.</p>
                <button 
                  className={styles.btnSecondary} 
                  style={{marginTop: '1rem'}}
                  onClick={() => setIsRecordModalOpen(true)}
                >
                  + View {activeTab} Records
                </button>
              </div>
            )}

            <div className={styles.notesSection}>
              <label className={styles.notesLabel}>NOTES</label>
              <textarea 
                className={styles.notesTextarea} 
                value={employeeData.notes || ''}
                readOnly={!isEditing}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={`Any additional notes about this employee...`}
              />
            </div>

            {/* Bottom Action Buttons */}
            {['Employment', 'Salary', 'Personal', 'LabourCard'].includes(activeTab) && (
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                {renderActionButtons()}
              </div>
            )}
          </div>
          
          <RecordModal 
            isOpen={isRecordModalOpen}
            onClose={() => setIsRecordModalOpen(false)}
            category={activeTab}
            mode="view"
          />
        </>
      ) : (
        !loading && !error && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No Employee Selected</h3>
            <p>Enter an Employee ID or Name to view their complete profile details here.</p>
          </div>
        )
      )}
    </div>
  );
}

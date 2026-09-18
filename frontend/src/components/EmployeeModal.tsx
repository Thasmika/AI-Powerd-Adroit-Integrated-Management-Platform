"use client";

import React, { useState, useEffect } from 'react';
import styles from './EmployeeModal.module.css';

interface EmployeeFormData {
  emp_no: string;
  emp_code: string;
  employee_name: string;
  department_id: string;
  designation: string;
  salary_category: string;
  system_password: string;
  is_active: boolean;
  salary_transfer_status: boolean;
  
  operating_company_id: string;
  visa_sponsoring_company_id: string;
  company_mol_id: string;
  emp_mol_id: string;
  health_card_no: string;
  insurance_provider: string;
}

const DEFAULT_FORM: EmployeeFormData = {
  emp_no: '1',
  emp_code: 'SAK',
  employee_name: '',
  department_id: '1', // default to Administration for UI match
  designation: '',
  salary_category: '',
  system_password: '',
  is_active: true,
  salary_transfer_status: true,
  
  operating_company_id: '1', 
  visa_sponsoring_company_id: '2',
  company_mol_id: '',
  emp_mol_id: '',
  health_card_no: '',
  insurance_provider: '',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function EmployeeModal({ 
  isOpen, 
  onClose, 
  onSaveSuccess,
  mode = 'add',
  employeeId = null,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSaveSuccess: () => void; 
  mode?: 'add' | 'edit' | 'view';
  employeeId?: number | null;
}) {
  const [formData, setFormData] = useState<EmployeeFormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employeeId && (mode === 'edit' || mode === 'view')) {
      fetchEmployee(employeeId);
    } else if (isOpen && mode === 'add') {
      setFormData(DEFAULT_FORM);
    }
  }, [isOpen, employeeId, mode]);

  const fetchEmployee = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/employees/${id}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch employee details');
      const data = await response.json();
      
      setFormData({
        emp_no: data.employee_id || '',
        emp_code: data.emp_code || '',
        employee_name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        department_id: data.department_id ? String(data.department_id) : '',
        designation: data.designation || '',
        salary_category: data.salary_category || '',
        system_password: '', // do not populate password
        is_active: data.is_active ?? true,
        salary_transfer_status: data.salary_transfer_status ?? true,
        operating_company_id: data.operating_company_id ? String(data.operating_company_id) : '',
        visa_sponsoring_company_id: data.visa_sponsoring_company_id ? String(data.visa_sponsoring_company_id) : '',
        company_mol_id: data.company_mol_id || '',
        emp_mol_id: data.emp_mol_id || '',
        health_card_no: data.health_card_no || '',
        insurance_provider: data.insurance_provider || '',
      });
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Try to generate initials for photo circle
  const getInitials = () => {
    if (!formData.employee_name) return "--";
    const parts = formData.employee_name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
    return "--";
  };

  if (!isOpen) return null;

  const handleChange = (field: keyof EmployeeFormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const nameParts = formData.employee_name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

      const payload = {
        employee_id: formData.emp_no,
        emp_code: formData.emp_code,
        first_name: firstName,
        last_name: lastName,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        designation: formData.designation,
        salary_category: formData.salary_category,
        system_password: formData.system_password,
        is_active: formData.is_active,
        salary_transfer_status: formData.salary_transfer_status,
        
        operating_company_id: formData.operating_company_id ? parseInt(formData.operating_company_id) : null,
        visa_sponsoring_company_id: formData.visa_sponsoring_company_id ? parseInt(formData.visa_sponsoring_company_id) : null,
        company_mol_id: formData.company_mol_id,
        emp_mol_id: formData.emp_mol_id,
        health_card_no: formData.health_card_no,
        insurance_provider: formData.insurance_provider,
      };

      let res;
      if (mode === 'edit' && employeeId) {
        if (!payload.system_password) {
          delete (payload as any).system_password;
        }
        res = await fetch(`${API_BASE}/employees/${employeeId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/employees/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        let errMsg = `HTTP ${res.status}`;
        if (body?.detail) {
          if (Array.isArray(body.detail)) {
            const err = body.detail[0];
            const field = err?.loc?.[err.loc.length - 1] || 'Field';
            errMsg = `${field}: ${err?.msg}`;
          } else {
            errMsg = body.detail;
          }
        }
        throw new Error(String(errMsg));
      }

      setFormData(DEFAULT_FORM);
      onSaveSuccess();
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setSaveError('Unable to connect to the server. Please check if the backend API is running.');
      } else {
        setSaveError(err.message ?? 'Failed to save employee.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData(DEFAULT_FORM);
    setSaveError(null);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Left Section - Photo & IDs */}
        <div className={styles.sidebar}>
          <div className={styles.photoContainer}>
            <div className={styles.photoCircle}>
              <span className={styles.photoInitials}>{getInitials()}</span>
            </div>
            {mode !== 'view' && <a href="#" className={styles.changePhoto}>Change Photo</a>}
          </div>

          <div className={styles.idBox}>
            <span className={styles.idLabel}>EMP NO</span>
            <input 
              type="text" 
              className={styles.idInput} 
              value={formData.emp_no} 
              onChange={e => handleChange('emp_no', e.target.value)} 
              autoComplete="off"
              disabled={mode === 'view'}
            />
          </div>

          <div className={styles.idBox}>
            <span className={styles.idLabel}>
              EMP<br/>CODE
            </span>
            <input 
              type="text" 
              className={styles.idInput} 
              value={formData.emp_code} 
              onChange={e => handleChange('emp_code', e.target.value)} 
              autoComplete="off"
              disabled={mode === 'view'}
            />
          </div>
        </div>

        {/* Right Section - Form Fields */}
        <div className={styles.formContent}>
          {isLoading ? (
            <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : (
            <>
              <fieldset disabled={mode === 'view'} style={{ border: 'none', padding: 0, margin: 0 }}>
                <form className={styles.formGrid} autoComplete="off" onSubmit={e => e.preventDefault()}>
            
            {/* Employee Information */}
            <div className={styles.column}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>👤</span>
                EMPLOYEE INFORMATION
              </h3>

              <div className={styles.field}>
                <label>EMPLOYEE NAME</label>
                <input 
                  type="text" 
                  value={formData.employee_name}
                  onChange={e => handleChange('employee_name', e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                />
              </div>

              <div className={styles.rowTwoCols}>
                <div className={styles.field}>
                  <label>DEPARTMENT</label>
                  <select 
                    value={formData.department_id}
                    onChange={e => handleChange('department_id', e.target.value)}
                  >
                    <option value="1">Administration</option>
                    <option value="2">Finance</option>
                    <option value="3">Operations</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>DESIGNATION</label>
                  <input 
                    type="text" 
                    value={formData.designation}
                    onChange={e => handleChange('designation', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className={styles.rowTwoCols}>
                <div className={styles.field}>
                  <label>SALARY CATEGORY</label>
                  <input 
                    type="text" 
                    value={formData.salary_category}
                    onChange={e => handleChange('salary_category', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.field}>
                  <label>SYSTEM PASSWORD</label>
                  <input 
                    type="password" 
                    value={formData.system_password}
                    onChange={e => handleChange('system_password', e.target.value)}
                    autoComplete="new-password"
                    data-lpignore="true"
                  />
                </div>
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => handleChange('is_active', e.target.checked)}
                  />
                  <span>Active Status</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox"
                    checked={formData.salary_transfer_status}
                    onChange={e => handleChange('salary_transfer_status', e.target.checked)}
                  />
                  <span>Salary Transfer Status</span>
                </label>
              </div>
            </div>

            {/* Employment & Sponsorship */}
            <div className={styles.column}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🏢</span>
                EMPLOYMENT & SPONSORSHIP
              </h3>

              <div className={styles.field}>
                <label>SPONSOR</label>
                <select 
                  value={formData.operating_company_id}
                  onChange={e => handleChange('operating_company_id', e.target.value)}
                >
                  <option value="1">Adroit Enterprises L.L.C Satwa Branch</option>
                  <option value="2">Group Company</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>VISA ISSUED BY</label>
                <select 
                  value={formData.visa_sponsoring_company_id}
                  onChange={e => handleChange('visa_sponsoring_company_id', e.target.value)}
                >
                  <option value="1">Adroit Enterprises L.L.C Satwa Branch</option>
                  <option value="2">Adroit Building Material Trading Enterprises</option>
                </select>
              </div>

              <div className={styles.rowTwoCols}>
                <div className={styles.field}>
                  <label>COMPANY MOL ID</label>
                  <input 
                    type="text" 
                    value={formData.company_mol_id}
                    onChange={e => handleChange('company_mol_id', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.field}>
                  <label>EMP MOL ID</label>
                  <input 
                    type="text" 
                    value={formData.emp_mol_id}
                    onChange={e => handleChange('emp_mol_id', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className={styles.rowTwoCols}>
                <div className={styles.field}>
                  <label>HEALTH CARD NO</label>
                  <input 
                    type="text" 
                    value={formData.health_card_no}
                    onChange={e => handleChange('health_card_no', e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.field}>
                  <label>INSURER</label>
                  <input 
                    type="text" 
                    value={formData.insurance_provider}
                    onChange={e => handleChange('insurance_provider', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

                </form>
              </fieldset>
              
              {saveError && <div className={styles.errorAlert}>{saveError}</div>}

              {/* Footer Actions */}
              <div className={styles.footer}>
                <button type="button" className={styles.btnCancel} onClick={handleClose}>
                  {mode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {mode !== 'view' && (
                  <button type="button" className={styles.btnSave} onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Save')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

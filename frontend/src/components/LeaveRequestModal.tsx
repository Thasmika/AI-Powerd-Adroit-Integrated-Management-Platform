"use client";

import React, { useState, useEffect } from 'react';
import styles from './EmployeeModal.module.css';

interface LeaveFormData {
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

const DEFAULT_FORM: LeaveFormData = {
  employee_id: '',
  leave_type: 'Annual Leave',
  start_date: '',
  end_date: '',
  reason: '',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function LeaveRequestModal({ 
  isOpen, 
  onClose, 
  onSaveSuccess,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSaveSuccess: () => void; 
}) {
  const [formData, setFormData] = useState<LeaveFormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(DEFAULT_FORM);
      setSaveError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof LeaveFormData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    if (!formData.employee_id || !formData.start_date || !formData.end_date) {
      setSaveError("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        employee_id: parseInt(formData.employee_id),
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || null,
      };

      const res = await fetch(`${API_BASE}/leaves/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

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
        setSaveError(err.message ?? 'Failed to submit leave request.');
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
      <div className={styles.modal} style={{ maxWidth: '600px' }}>
        <div className={styles.formContent} style={{ padding: '2rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>New Leave Request</h2>
          
          <form className={styles.column} autoComplete="off" onSubmit={e => e.preventDefault()}>
            <div className={styles.rowTwoCols}>
              <div className={styles.field}>
                <label>EMPLOYEE ID *</label>
                <input 
                  type="number" 
                  value={formData.employee_id}
                  onChange={e => handleChange('employee_id', e.target.value)}
                  placeholder="e.g. 1"
                  required
                />
              </div>
              <div className={styles.field}>
                <label>LEAVE TYPE *</label>
                <select 
                  value={formData.leave_type}
                  onChange={e => handleChange('leave_type', e.target.value)}
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                </select>
              </div>
            </div>

            <div className={styles.rowTwoCols}>
              <div className={styles.field}>
                <label>START DATE *</label>
                <input 
                  type="date" 
                  value={formData.start_date}
                  onChange={e => handleChange('start_date', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>END DATE *</label>
                <input 
                  type="date" 
                  value={formData.end_date}
                  onChange={e => handleChange('end_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>REASON</label>
              <textarea 
                value={formData.reason}
                onChange={e => handleChange('reason', e.target.value)}
                rows={3}
                style={{
                  background: '#0b1120',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder="Brief reason for the leave (optional)"
              />
            </div>
          </form>

          {saveError && <div className={styles.errorAlert}>{saveError}</div>}

          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className={styles.btnSave} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

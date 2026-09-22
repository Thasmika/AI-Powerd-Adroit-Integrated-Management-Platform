import React, { useState } from 'react';
import styles from './AddEmployeeModal.module.css';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

export function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: 'Administration',
    designation: '',
    nationality: '',
    contactNumber: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      department_id: 1, // Using dummy department ID as the select currently returns strings instead of IDs
      designation: formData.designation || null,
      nationality: formData.nationality || null,
      contact_number: formData.contactNumber || null,
    };

    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

    fetch(`${API_BASE}/employees/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('access_token') ? { Authorization: `Bearer ${localStorage.getItem('access_token')}` } : {})
      },
      body: JSON.stringify(payload)
    })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const detail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        throw new Error(detail || 'Failed to create employee');
      }
      return res.json();
    })
    .then((data) => {
      setIsSubmitting(false);
      onSuccess({ ...formData, employee_id: data.employee_id });
      setFormData({
        firstName: '',
        lastName: '',
        department: 'Administration',
        designation: '',
        nationality: '',
        contactNumber: '',
      });
    })
    .catch((err) => {
      setIsSubmitting(false);
      alert(err.message);
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add New Employee</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={styles.input} 
                  placeholder="John" 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={styles.input} 
                  placeholder="Doe" 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <select 
                  name="department" 
                  value={formData.department}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Administration">Administration</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Designation</label>
                <input 
                  type="text" 
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className={styles.input} 
                  placeholder="e.g. Developer" 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nationality</label>
                <input 
                  type="text" 
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className={styles.input} 
                  placeholder="e.g. USA" 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Number</label>
                <input 
                  type="tel" 
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={styles.input} 
                  placeholder="+1 234 567 8900" 
                />
              </div>

            </div>
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.btnCancel} 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.btnSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Asset {
  id: number;
  fleet_number: string;
  registration_number: string | null;
  category: string;
  make_model: string | null;
  year: number | null;
  color: string | null;
  chassis_vin: string | null;
  engine_number: string | null;
  owning_company_id: number | null;
  department_id: number | null;
  location_id: number | null;
  operational_status: string;
  responsible_officer_id: number | null;
  remarks: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function VehicleRegisterPage() {
  const [vehicles, setVehicles] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Asset | null>(null);

    const initialFormState = {
      registration_number: '',
      category: 'Light Vehicle',
      make_model: '',
      year: '',
      color: '',
      chassis_vin: '',
      engine_number: '',
      owning_company_id: '',
      department_id: '',
      location_id: '',
      operational_status: 'Active',
      responsible_officer_id: '',
      remarks: '',
      photo_url: ''
    };

  const [formData, setFormData] = useState(initialFormState);

  const assetCategories = [
    "Heavy Vehicle", 
    "Light Vehicle", 
    "Trailer", 
    "Heavy Machine / Equipment", 
    "Other Company Vehicle"
  ];

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/assets/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Error loading vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        owning_company_id: formData.owning_company_id ? parseInt(formData.owning_company_id) : null,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        responsible_officer_id: formData.responsible_officer_id ? parseInt(formData.responsible_officer_id) : null,
      };

      const url = editingId ? `${API_BASE}/assets/${editingId}` : `${API_BASE}/assets/`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || `Failed to ${editingId ? 'update' : 'register'} vehicle`);
      }

      setFormSuccess(`Vehicle ${editingId ? 'updated' : 'registered'} successfully!`);
      fetchVehicles(); // Refresh the list
    } catch (err: any) {
      setFormError(err.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (v: Asset) => {
    setFormData({
      registration_number: v.registration_number || '',
      category: v.category,
      make_model: v.make_model || '',
      year: v.year ? v.year.toString() : '',
      color: v.color || '',
      chassis_vin: v.chassis_vin || '',
      engine_number: v.engine_number || '',
      owning_company_id: v.owning_company_id ? v.owning_company_id.toString() : '',
      department_id: v.department_id ? v.department_id.toString() : '',
      location_id: v.location_id ? v.location_id.toString() : '',
      operational_status: v.operational_status || 'Active',
      responsible_officer_id: v.responsible_officer_id ? v.responsible_officer_id.toString() : '',
      remarks: v.remarks || '',
      photo_url: '' 
    });
    setEditingId(v.id);
    setIsModalOpen(true);
  };

  const handleViewClick = (v: Asset) => {
    setViewingVehicle(v);
    setTimeout(() => {
      document.getElementById('profileView')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }
      fetchVehicles();
    } catch (err: any) {
      alert(err.message || 'Error deleting vehicle');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormSuccess(null);
    setFormError(null);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const getStatusClass = (status: string) => {
    return status.toLowerCase() === 'active' ? styles.statusActive : styles.statusInactive;
  };

  const stats = [
    { label: 'Total Fleet', value: vehicles.length, icon: '🚛' },
    { label: 'Active', value: vehicles.filter(v => v.operational_status === 'Active').length, icon: '✅' },
    { label: 'Maintenance', value: vehicles.filter(v => v.operational_status === 'Maintenance').length, icon: '🔧' },
    { label: 'Inactive / Disposed', value: vehicles.filter(v => ['Inactive', 'Disposed'].includes(v.operational_status)).length, icon: '⚠️' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Vehicle Register</h1>
          <p>Register new vehicles into the system and view the fleet</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          + Add Vehicle
        </button>
      </header>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{loading ? '–' : s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Registration Form Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingId ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
            </div>
            <div className={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-solid)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.05em' }}>VEHICLE INFORMATION</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="category">Category *</label>
              <select 
                id="category" 
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
              >
                {assetCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="registration_number">Registration Number</label>
              <input 
                type="text" 
                id="registration_number" 
                name="registration_number"
                placeholder="e.g. DXB 12345"
                value={formData.registration_number}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="make_model">Make & Model</label>
              <input 
                type="text" 
                id="make_model" 
                name="make_model"
                placeholder="e.g. Toyota Hilux"
                value={formData.make_model}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="year">Year</label>
              <input 
                type="number" 
                id="year" 
                name="year"
                placeholder="e.g. 2024"
                min="1980"
                max="2100"
                value={formData.year}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="color">Color</label>
              <input 
                type="text" 
                id="color" 
                name="color"
                placeholder="e.g. White"
                value={formData.color}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="chassis_vin">Chassis / VIN</label>
              <input 
                type="text" 
                id="chassis_vin" 
                name="chassis_vin"
                placeholder="Enter VIN number"
                value={formData.chassis_vin}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="engine_number">Engine No.</label>
              <input 
                type="text" 
                id="engine_number" 
                name="engine_number"
                placeholder="Enter Engine number"
                value={formData.engine_number}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="photo_url">Vehicle Photo</label>
              <input 
                type="file" 
                id="photo_url" 
                name="photo_url"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData(prev => ({ ...prev, photo_url: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setFormData(prev => ({ ...prev, photo_url: '' }));
                  }
                }}
              />
              {formData.photo_url && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img src={formData.photo_url} alt="Vehicle Preview" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }} />
                </div>
              )}
            </div>
          </div>

          <h3 style={{ margin: '2rem 0 1rem', color: 'var(--accent-solid)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.05em' }}>COMPANY & OPERATION</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="owning_company_id">Registered Company</label>
              <select id="owning_company_id" name="owning_company_id" value={formData.owning_company_id} onChange={handleInputChange}>
                <option value="">-- Select Company --</option>
                <option value="1">Group Company</option>
                <option value="2">Subsidiary LLC</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="department_id">Department</label>
              <select id="department_id" name="department_id" value={formData.department_id} onChange={handleInputChange}>
                <option value="">-- Select Department --</option>
                <option value="1">Transport</option>
                <option value="2">Logistics</option>
                <option value="3">Operations</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="location_id">Location</label>
              <select id="location_id" name="location_id" value={formData.location_id} onChange={handleInputChange}>
                <option value="">-- Select Location --</option>
                <option value="1">Aweer</option>
                <option value="2">Jebel Ali</option>
                <option value="3">Al Quoz</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="operational_status">Operational Status *</label>
              <select id="operational_status" name="operational_status" required value={formData.operational_status} onChange={handleInputChange}>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
                <option value="Disposed">Disposed</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="responsible_officer_id">Responsible Officer</label>
              <select id="responsible_officer_id" name="responsible_officer_id" value={formData.responsible_officer_id} onChange={handleInputChange}>
                <option value="">-- Unassigned --</option>
                <option value="1">Assigned Manager 1</option>
                <option value="2">Assigned Manager 2</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="remarks">Remarks</label>
              <input type="text" id="remarks" name="remarks" placeholder="Available" value={formData.remarks} onChange={handleInputChange} />
            </div>
          </div>

          {formError && <div style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' }}>{formError}</div>}
          {formSuccess && <div style={{ color: '#4ade80', marginBottom: '1rem', fontSize: '0.9rem' }}>{formSuccess}</div>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? (editingId ? 'Updating...' : 'Registering...') : (editingId ? 'Update Vehicle' : 'Register Vehicle')}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>
              Close
            </button>
          </div>
        </form>
      </div>
          </div>
        </div>
      )}

      {/* Registered Vehicles Table */}
      <div className={styles.tableContainer}>
        <div className={styles.sectionTitle}>Registered Vehicles</div>
        {loading ? (
          <div className={styles.loading}>Loading vehicles...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <table className={styles.vehicleTable}>
            <thead>
              <tr>
                <th>Fleet NO</th>
                <th>Registration</th>
                <th>Category</th>
                <th>Make & Model</th>
                <th>Year / Color</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No vehicles found. Register a vehicle above.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className={styles.vehicleRow}>
                    <td>
                      <span className={styles.fleetNo}>{v.fleet_number}</span>
                    </td>
                    <td>{v.registration_number || '—'}</td>
                    <td>{v.category}</td>
                    <td>{v.make_model || '—'}</td>
                    <td>
                      {v.year || '—'} {v.color ? `/ ${v.color}` : ''}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(v.operational_status)}`}>
                        {v.operational_status}
                      </span>
                    </td>
                    <td className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                      <Link href={`/fleet/${v.id}`} className={`${styles.actionBtn} ${styles.viewBtn}`} title="View Details">View</Link>
                      <button className={`${styles.actionBtn} ${styles.editBtn}`} title="Edit Vehicle" onClick={() => handleEditClick(v)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Delete Vehicle" onClick={() => handleDelete(v.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Dynamic Asset Profile View */}
      {viewingVehicle && (
        <div id="profileView" className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <div className={styles.fleetBadge}>{viewingVehicle.fleet_number}</div>
            <h2 className={styles.profileTitle}>{viewingVehicle.make_model || 'Unknown Vehicle'}</h2>
            <span className={`${styles.statusBadge} ${getStatusClass(viewingVehicle.operational_status)}`} style={{ margin: 0 }}>
              {viewingVehicle.operational_status}
            </span>
            <button className={styles.profileCloseBtn} onClick={() => setViewingVehicle(null)} title="Close Profile">×</button>
          </div>
          
          <div className={styles.profileGrid}>
            <div className={styles.mediaCard}>
              <span className={styles.mediaPlaceholder}>3D ASSET MODEL / 4K IMAGE</span>
            </div>
            
            <div className={styles.detailsCard}>
              <h3 className={styles.detailsTitle}>Asset Particulars</h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Registration Number</span>
                  <span className={styles.detailValue}>{viewingVehicle.registration_number || '—'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>{viewingVehicle.category}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Year</span>
                  <span className={styles.detailValue}>{viewingVehicle.year || '—'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Department</span>
                  <span className={styles.detailValue}>N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

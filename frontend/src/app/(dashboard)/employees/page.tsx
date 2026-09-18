"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { EmployeeModal } from '@/components/EmployeeModal';
import { AddEmployeeModal } from '@/components/AddEmployeeModal';
import { useToast } from '@/components/Toast';

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  department_id?: number;
  designation?: string;
  nationality?: string;
  contact_number?: string;
  photo_url?: string;
  is_active: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function EmployeeMasterList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'view'>('view');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const fetchEmployees = async () => {
      try {
        const response = await fetch(`${API_BASE}/employees/`, {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const data = await response.json();
        setEmployees(data);
      } catch (err: any) {
        if (err.message === 'Failed to fetch') {
          setError('Unable to connect to the server. Please check if the backend API is running.');
        } else {
          setError(err.message || 'An error occurred while fetching employees.');
        }
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openViewModal = (id: number) => {
    setModalMode('view');
    setSelectedEmployeeId(id);
    setIsModalOpen(true);
  };

  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  };

  const handleEdit = (id: number) => {
    setModalMode('edit');
    setSelectedEmployeeId(id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const response = await fetch(`${API_BASE}/employees/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchEmployees();
    } catch (err) {
      alert(err);
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.is_active).length;
  const inactiveEmployees = totalEmployees - activeEmployees;
  const departmentsCount = new Set(employees.map(e => e.department_id).filter(Boolean)).size;

  const stats = [
    { label: 'Total Employees', value: totalEmployees, icon: '👥' },
    { label: 'Active', value: activeEmployees, icon: '✅' },
    { label: 'Inactive', value: inactiveEmployees, icon: '⏸️' },
    { label: 'Departments', value: departmentsCount, icon: '🏢' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>Employee Register</h1>
          <p>Manage and view all registered employee profiles</p>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <span className={styles.btnIcon}>+</span>
          Add Employee
        </button>
      </header>

      <div className={styles.statsContainer}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statIcon}>{s.icon}</span>
            </div>
            <div className={styles.statValue}>
              {loading ? '–' : s.value}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>Loading employees...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <table className={styles.employeeTable}>
            <thead>
              <tr>
                <th>Employee NO</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Nationality</th>
                <th>Contact NO</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No employees found. Click "Add Employee" to create one.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className={styles.employeeRow}>
                    <td>
                      <span className={styles.empNo}>{emp.employee_id}</span>
                    </td>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>
                          {emp.photo_url ? (
                            <img src={emp.photo_url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            getInitials(emp.first_name, emp.last_name)
                          )}
                        </div>
                        <span className={styles.empName}>
                          {emp.first_name} {emp.last_name}
                        </span>
                      </div>
                    </td>
                    <td>{emp.department_id || '—'}</td>
                    <td>{emp.designation || '—'}</td>
                    <td>{emp.nationality || '—'}</td>
                    <td>{emp.contact_number || '—'}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.iconBtn} 
                          title="View" 
                          onClick={() => openViewModal(emp.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button 
                          className={styles.iconBtn} 
                          title="Edit" 
                          onClick={() => handleEdit(emp.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                        </button>
                        <button 
                          className={`${styles.iconBtn} ${styles.deleteBtn}`} 
                          title="Delete" 
                          onClick={() => handleDelete(emp.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <EmployeeModal 
        isOpen={isModalOpen} 
        mode={modalMode}
        employeeId={selectedEmployeeId}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployeeId(null);
        }} 
        onSaveSuccess={() => {
          setIsModalOpen(false);
          setSelectedEmployeeId(null);
          fetchEmployees();
        }} 
      />

      <AddEmployeeModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(data) => {
          setIsAddModalOpen(false);
          showToast(`Employee ${data.firstName} ${data.lastName} created successfully!`, 'success');
          fetchEmployees();
        }}
      />
      <ToastContainer />
    </div>
  );
}

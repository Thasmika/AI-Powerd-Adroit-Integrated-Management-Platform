"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { LeaveRequestModal } from '@/components/LeaveRequestModal';
import { LeaveActionModal, LeaveActionMode } from '@/components/LeaveActionModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function LeaveManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalMode, setActionModalMode] = useState<LeaveActionMode | null>(null);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);

  const workflowSteps = [
    { num: '01', title: 'Leave Request', desc: 'Department Head / authorized user submits request.', icon: '📝' },
    { num: '02', title: 'HR Review', desc: 'HR checks eligibility, dates and employee record.', icon: '🔍' },
    { num: '03', title: 'Approval', desc: 'Approved / rejected status is recorded.', icon: '✅' },
    { num: '04', title: 'Vacation', desc: 'Employee leave period is visible in the system.', icon: '🌴' },
    { num: '05', title: 'Rejoining', desc: 'Return-to-duty / rejoining record is completed.', icon: '🏢' },
    { num: '06', title: 'History', desc: 'Complete leave history remains available for future reference.', icon: '📚' }
  ];

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/leaves/`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaves', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleActionClick = (leave: any, mode: LeaveActionMode) => {
    setSelectedLeaveId(leave.id);
    setActionModalMode(mode);
    setActionModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    try {
      const response = await fetch(`${API_BASE}/leaves/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchLeaves();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'PENDING': return styles.badgePending;
      case 'REVIEWED': return styles.badgeReviewed;
      case 'APPROVED': return styles.badgeApproved;
      case 'REJECTED': return styles.badgeRejected;
      case 'COMPLETED': return styles.badgeCompleted;
      default: return styles.badgeDefault;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Leave Management</h1>
          <p>End-to-end digital leave tracking and approval workflow.</p>
        </div>
        <button className={styles.primaryAction} onClick={() => setIsModalOpen(true)}>+ New Request</button>
      </header>

      {/* Info Boxes */}
      <div className={styles.infoBoxes}>
        <div className={styles.infoBox}>
          <div className={styles.boxHeader}>
            <span className={styles.icon}>📋</span>
            <h4>Leave Types</h4>
          </div>
          <p>Annual Leave • Emergency Leave • Sick Leave</p>
        </div>
        
        <div className={styles.infoBox}>
          <div className={styles.boxHeader}>
            <span className={styles.icon}>👁️</span>
            <h4>Management Visibility</h4>
          </div>
          <p>Who is on leave, upcoming leave, pending requests and expected return dates.</p>
        </div>
        
        <div className={styles.infoBox}>
          <div className={styles.boxHeader}>
            <span className={styles.icon}>🍃</span>
            <h4>Paper Reduction</h4>
          </div>
          <p>Applications, approvals and rejoining records remain electronically linked to the employee.</p>
        </div>
      </div>


      {/* Requests Table */}
      <div className={styles.tableSection}>
        <h3 className={styles.sectionTitle}>Leave Requests</h3>
        {isLoading ? (
          <p style={{ color: '#94a3b8' }}>Loading requests...</p>
        ) : leaves.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No leave requests found.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <div className={styles.employeeInfo}>
                        <span className={styles.employeeName}>
                          {leave.employee ? `${leave.employee.first_name} ${leave.employee.last_name}` : `ID: ${leave.employee_id}`}
                        </span>
                        {leave.employee && (
                          <span className={styles.employeeId}>Emp ID: {leave.employee.employee_id}</span>
                        )}
                      </div>
                    </td>
                    <td>{leave.leave_type}</td>
                    <td>
                      {leave.start_date} to {leave.end_date}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        {leave.status === 'PENDING' && (
                          <button className={styles.btnAction} onClick={() => handleActionClick(leave, 'review')}>HR Review</button>
                        )}
                        {leave.status === 'REVIEWED' && (
                          <button className={styles.btnAction} onClick={() => handleActionClick(leave, 'approve')}>Approve/Reject</button>
                        )}
                        {leave.status === 'APPROVED' && (
                          <button className={styles.btnAction} onClick={() => handleActionClick(leave, 'rejoin')}>Mark Rejoined</button>
                        )}
                        <button className={styles.btnDelete} onClick={() => handleDelete(leave.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeaveRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={() => {
          setIsModalOpen(false);
          fetchLeaves();
        }}
      />

      <LeaveActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onSaveSuccess={() => {
          setActionModalOpen(false);
          fetchLeaves();
        }}
        leaveId={selectedLeaveId}
        mode={actionModalMode}
      />
    </div>
  );
}

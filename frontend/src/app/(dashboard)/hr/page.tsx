"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { AddEmployeeModal } from '@/components/AddEmployeeModal';
import { useToast } from '@/components/Toast';

const statData = [
  { title: "Employees", value: "248", subtitle: "Active records", type: "info" },
  { title: "Expiring ≤ 60 Days", value: "17", subtitle: "Visa / EID / Passport", type: "warning" },
  { title: "On Leave", value: "12", subtitle: "Currently away", type: "success" },
  { title: "Pending Actions", value: "9", subtitle: "HR follow-up", type: "danger" }
];

const upcomingExpiries = [
  { type: "Employment Visa", count: 6 },
  { type: "Emirates ID", count: 5 },
  { type: "Passport", count: 3 },
  { type: "Health Insurance", count: 3 }
];

export default function HRDashboardPage() {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const handleAddEmployeeSuccess = (data: any) => {
    setIsAddEmployeeModalOpen(false);
    showToast(`Employee ${data.firstName} ${data.lastName} created successfully!`, 'success');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>HR Management Overview</h1>
          <p>Real-time insights and actions requiring your attention.</p>
        </div>
      </header>

      {/* 3D Glassmorphic KPI Grid */}
      <div className={styles.statsGrid}>
        {statData.map((stat, idx) => (
          <div key={idx} className={`${styles.statCard} ${styles[`stat${stat.type}`]}`}>
            <div className={styles.statGlow}></div>
            <span className={styles.statTitle}>{stat.title}</span>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statSubtitle}>{stat.subtitle}</span>
          </div>
        ))}
      </div>

      <div className={styles.dashboardLayout}>
        {/* Upcoming Expiries Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Upcoming Expiries</h2>
            <button className={styles.viewAllBtn}>View All</button>
          </div>
          <div className={styles.expiryList}>
            {upcomingExpiries.map((item, idx) => (
              <div key={idx} className={styles.expiryItem}>
                <div className={styles.expiryIcon}></div>
                <div className={styles.expiryDetails}>
                  <span className={styles.expiryType}>{item.type}</span>
                  <span className={styles.expiryCount}>{item.count} employees</span>
                </div>
                <button className={styles.actionIcon}>→</button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Quick Actions</h2>
          </div>
          <div className={styles.actionGrid}>
            <button 
              className={styles.actionBtn} 
              style={{ border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={() => setIsAddEmployeeModalOpen(true)}
            >
              <span className={styles.btnIcon}>+</span>
              <span className={styles.btnText}>Add New Employee</span>
            </button>
            <Link href="/leaves" className={styles.actionBtn}>
              <span className={styles.btnIcon}>📅</span>
              <span className={styles.btnText}>Apply / Review Leave</span>
            </Link>
            <Link href="/documents" className={styles.actionBtn}>
              <span className={styles.btnIcon}>📄</span>
              <span className={styles.btnText}>Open Expiry Centre</span>
            </Link>
            <Link href="/search" className={styles.actionBtn}>
              <span className={styles.btnIcon}>🔍</span>
              <span className={styles.btnText}>Search Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Assistant Bar */}
      <div className={styles.aiContainer}>
        <div className={styles.aiSparkle}>✨</div>
        <div className={styles.aiContent}>
          <h3>Ask HR AI Assistant</h3>
          <p>Example: "Show employees whose visas or Emirates IDs expire within the next 60 days."</p>
        </div>
        <button className={styles.aiButton}>Ask AI</button>
      </div>

      <AddEmployeeModal 
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onSuccess={handleAddEmployeeSuccess}
      />
      <ToastContainer />
    </div>
  );
}

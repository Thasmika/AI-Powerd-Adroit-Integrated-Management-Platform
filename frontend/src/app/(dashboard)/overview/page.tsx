"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function OverviewDashboard() {
  const [metrics, setMetrics] = useState({
    activeEmployees: 0,
    totalVehicles: 0,
    pendingRenewals: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    // Mocking an API call to get integrated metrics
    setTimeout(() => {
      setMetrics({
        activeEmployees: 1240,
        totalVehicles: 485,
        pendingRenewals: 12,
        pendingLeaves: 8,
      });
    }, 500);
  }, []);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Integrated Overview</h1>
          <p>Global monitoring across Human Capital and Fleet Logistics.</p>
        </div>
      </header>

      {/* High-end metrics cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)' }}>👥</div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.activeEmployees.toLocaleString()}</span>
            <span className={styles.metricLabel}>Active Employees</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>🚛</div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.totalVehicles.toLocaleString()}</span>
            <span className={styles.metricLabel}>Total Fleet Assets</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>🚨</div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.pendingRenewals}</span>
            <span className={styles.metricLabel}>Pending Renewals</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>📅</div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{metrics.pendingLeaves}</span>
            <span className={styles.metricLabel}>Pending Leave Requests</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionsGrid}>
        {/* Recent Activity Feed */}
        <div className={styles.activitySection}>
          <h2>Global Activity Feed</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#10b981' }}></div>
              <div className={styles.activityContent}>
                <strong>Vehicle Registration Renewed</strong>
                <span>Asset VH-0108 completed renewal processing.</span>
                <span className={styles.activityTime}>10 mins ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#0ea5e9' }}></div>
              <div className={styles.activityContent}>
                <strong>New Employee Onboarded</strong>
                <span>Sarah Jenkins (EMP-294) joined Engineering.</span>
                <span className={styles.activityTime}>1 hour ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#ef4444' }}></div>
              <div className={styles.activityContent}>
                <strong>Compliance Alert</strong>
                <span>Visa expiring in 5 days for Ahmed Al-Mansoori.</span>
                <span className={styles.activityTime}>2 hours ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityDot} style={{ background: '#f59e0b' }}></div>
              <div className={styles.activityContent}>
                <strong>Leave Request Approved</strong>
                <span>Annual Leave for Omar Farooq approved by HR.</span>
                <span className={styles.activityTime}>4 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health / Status */}
        <div className={styles.systemStatusSection}>
          <h2>System Health</h2>
          <div className={styles.statusCards}>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span>HR Module</span>
                <span className={styles.statusBadgeOk}>Online</span>
              </div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '100%' }}></div></div>
              <span className={styles.statusText}>All services operational</span>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span>Fleet Module</span>
                <span className={styles.statusBadgeOk}>Online</span>
              </div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '100%', background: '#10b981' }}></div></div>
              <span className={styles.statusText}>Telematics sync active</span>
            </div>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span>AI Engine</span>
                <span className={styles.statusBadgeSyncing}>Syncing</span>
              </div>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: '75%', background: '#8b5cf6' }}></div></div>
              <span className={styles.statusText}>Processing latest data nodes...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

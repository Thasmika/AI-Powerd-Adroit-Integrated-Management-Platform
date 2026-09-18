"use client";

import React from 'react';
import styles from './page.module.css';

export default function UserProfile() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerGlow}></div>
        <h1>User Profile</h1>
        <p>Manage your personal information, security settings, and platform preferences.</p>
      </header>

      <div className={styles.contentGrid}>
        {/* Left Column: Personal Info */}
        <div className={styles.mainCard}>
          <div className={styles.cardHeader}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarLarge}>SA</div>
              <div className={styles.avatarActions}>
                <button className={styles.btnPrimary}>Upload New Photo</button>
                <button className={styles.btnSecondary}>Remove</button>
              </div>
            </div>
          </div>
          
          <form className={styles.formGroup}>
            <div className={styles.inputRow}>
              <div className={styles.inputContainer}>
                <label>First Name</label>
                <input type="text" defaultValue="System" className={styles.inputField} />
              </div>
              <div className={styles.inputContainer}>
                <label>Last Name</label>
                <input type="text" defaultValue="Admin" className={styles.inputField} />
              </div>
            </div>
            
            <div className={styles.inputContainer}>
              <label>Email Address</label>
              <input type="email" defaultValue="admin@adroit.com" className={styles.inputField} disabled />
            </div>
            
            <div className={styles.inputContainer}>
              <label>Role / Position</label>
              <input type="text" defaultValue="Super Administrator" className={styles.inputField} disabled />
            </div>

            <div className={styles.formActions}>
              <button className={styles.btnPrimary} type="button">Save Changes</button>
            </div>
          </form>
        </div>

        {/* Right Column: Security & Activity */}
        <div className={styles.sideColumn}>
          <div className={styles.sideCard}>
            <h3>Security Settings</h3>
            <p className={styles.cardDesc}>Update your password and secure your account.</p>
            
            <button className={styles.btnSecondary} style={{ width: '100%', marginBottom: '1rem' }}>
              Change Password
            </button>
            <button className={styles.btnSecondary} style={{ width: '100%' }}>
              Enable Two-Factor Auth (2FA)
            </button>
          </div>

          <div className={styles.sideCard}>
            <h3>Recent Activity</h3>
            <ul className={styles.activityList}>
              <li>
                <span className={styles.activityDot}></span>
                <div className={styles.activityText}>
                  <strong>Logged in</strong>
                  <span>Today at 9:30 AM</span>
                </div>
              </li>
              <li>
                <span className={styles.activityDot}></span>
                <div className={styles.activityText}>
                  <strong>Updated fleet settings</strong>
                  <span>Yesterday at 2:15 PM</span>
                </div>
              </li>
              <li>
                <span className={styles.activityDot}></span>
                <div className={styles.activityText}>
                  <strong>Created new HR report</strong>
                  <span>Oct 10, 2026</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

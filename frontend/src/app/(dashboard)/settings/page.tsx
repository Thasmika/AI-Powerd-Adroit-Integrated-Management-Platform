"use client";

import React from 'react';
import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>System Settings</h1>
        <p>Configure global platform settings, notifications, and integration preferences.</p>
      </header>

      <div className={styles.settingsGrid}>
        <div className={styles.settingsCard}>
          <div className={styles.cardIcon}>🔔</div>
          <h3>Notifications</h3>
          <p>Manage how you receive alerts and email summaries.</p>
          <div className={styles.toggleRow}>
            <span>Email Alerts for Fleet</span>
            <label className={styles.switch}>
              <input type="checkbox" defaultChecked />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.toggleRow}>
            <span>HR Weekly Summaries</span>
            <label className={styles.switch}>
              <input type="checkbox" defaultChecked />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardIcon}>🎨</div>
          <h3>Appearance</h3>
          <p>Customize the UI theme and accessibility options.</p>
          <select className={styles.selectField}>
            <option>Dark Theme (Default)</option>
            <option>Light Theme</option>
            <option>System Sync</option>
          </select>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.cardIcon}>🔗</div>
          <h3>API Integrations</h3>
          <p>Manage API keys and connected third-party services.</p>
          <button className={styles.btnSecondary}>Manage API Keys</button>
        </div>
      </div>
    </div>
  );
}

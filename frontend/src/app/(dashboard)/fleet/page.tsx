"use client";

import React from 'react';
import styles from './page.module.css';
import Link from 'next/link';

const mockKpis = [
  { title: "Total Assets", value: "112", trend: "+3 this month", type: "normal" },
  { title: "In Maintenance", value: "8", trend: "2 expected today", type: "normal" },
  { title: "Expiring (≤60 Days)", value: "24", trend: "8 Registrations, 16 Insurances", type: "urgent" },
  { title: "Missing Documents", value: "3", trend: "Requires immediate attention", type: "alert" }
];

const mockExpiringDocs = [
  { id: 1, asset: "VH-0108 (Toyota Hilux)", type: "Vehicle Registration", daysLeft: 10, status: "URGENT" },
  { id: 2, asset: "HV-1022 (Volvo FH16)", type: "Motor Insurance", daysLeft: 5, status: "URGENT" },
  { id: 3, asset: "TR-0045 (Flatbed Trailer)", type: "Safety Certificate", daysLeft: -4, status: "EXPIRED" },
  { id: 4, asset: "MC-0551 (Excavator)", type: "Inspection Permit", daysLeft: 55, status: "RENEWAL DUE" },
];

const quickActions = [
  {
    href: '/fleet/register',
    icon: '➕',
    label: 'Add Vehicle / Machine',
    desc: 'Register a new asset to the fleet',
    accent: 'rgba(16,185,129,0.15)',
    accentBorder: 'rgba(16,185,129,0.3)',
    accentColor: '#10b981',
  },
  {
    href: '/assets',
    icon: '🔍',
    label: 'Search Fleet',
    desc: 'Find any vehicle by number or model',
    accent: 'rgba(14,165,233,0.12)',
    accentBorder: 'rgba(14,165,233,0.25)',
    accentColor: '#0ea5e9',
  },
  {
    href: '/renewals',
    icon: '🔔',
    label: 'Open Expiry Centre',
    desc: 'View all upcoming & expired documents',
    accent: 'rgba(245,158,11,0.12)',
    accentBorder: 'rgba(245,158,11,0.25)',
    accentColor: '#f59e0b',
  },
  {
    href: '/fleet/documents',
    icon: '📄',
    label: 'Upload / View Document',
    desc: 'Manage fleet compliance documents',
    accent: 'rgba(139,92,246,0.12)',
    accentBorder: 'rgba(139,92,246,0.25)',
    accentColor: '#8b5cf6',
  },
  {
    href: '/fleet/ai',
    icon: '🤖',
    label: 'Ask Fleet AI Assistant',
    desc: 'Natural-language search & summaries',
    accent: 'rgba(236,72,153,0.12)',
    accentBorder: 'rgba(236,72,153,0.25)',
    accentColor: '#ec4899',
  },
];

export default function FleetDashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'URGENT': return styles.statusUrgent;
      case 'EXPIRED': return styles.statusExpired;
      case 'RENEWAL DUE': return styles.statusValid;
      default: return '';
    }
  };

  const getKpiClass = (type: string) => {
    switch(type) {
      case 'urgent': return styles.kpiUrgent;
      case 'alert': return styles.kpiAlert;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Fleet Management Overview</h1>
      </header>

      {/* 3D KPI Grid */}
      <div className={styles.kpiGrid}>
        {mockKpis.map((kpi, idx) => (
          <div key={idx} className={`${styles.kpiCard} ${getKpiClass(kpi.type)}`}>
            <span className={styles.kpiTitle}>{kpi.title}</span>
            <span className={styles.kpiValue}>{kpi.value}</span>
            <span className={styles.kpiTrend}>{kpi.trend}</span>
          </div>
        ))}
      </div>

      <div className={styles.dashboardSections}>
        {/* Main Panel: Attention Items */}
        <div className={styles.sectionPanel}>
          <div className={styles.sectionHeader}>
            <h2>Attention Required: Document Expiries</h2>
            <Link href="/assets" className={styles.statusBadge} style={{background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', textDecoration: 'none'}}>
              View All Assets
            </Link>
          </div>
          
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Asset (Make/Model)</th>
                <th>Document Type</th>
                <th>Days Remaining</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockExpiringDocs.map(doc => (
                <tr key={doc.id}>
                  <td style={{fontWeight: 600, color: 'var(--text-primary)'}}>{doc.asset}</td>
                  <td>{doc.type}</td>
                  <td style={{fontWeight: doc.daysLeft <= 30 ? 700 : 400}}>{doc.daysLeft} Days</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Column: Quick Actions + AI Insight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ── Quick Actions Panel ── */}
          <div className={styles.sectionPanel}>
            <div className={styles.sectionHeader} style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem' }}>
              <h2>Quick Actions</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.8rem 1rem',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.22s ease',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = action.accent;
                      el.style.borderColor = action.accentBorder;
                      el.style.transform = 'translateX(5px)';
                      el.style.boxShadow = `0 4px 20px ${action.accent}`;
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = 'rgba(255,255,255,0.03)';
                      el.style.borderColor = 'var(--border-subtle)';
                      el.style.transform = 'translateX(0)';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    {/* Icon Badge */}
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
                      background: action.accent, border: `1px solid ${action.accentBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.15rem',
                    }}>
                      {action.icon}
                    </div>

                    {/* Label + description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.12rem' }}>
                        {action.label}
                      </div>
                      <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {action.desc}
                      </div>
                    </div>

                    {/* Chevron */}
                    <div style={{ color: action.accentColor, fontSize: '1.2rem', fontWeight: 700, flexShrink: 0, lineHeight: 1 }}>›</div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* ── AI Insight Panel ── */}
          <div className={styles.sectionPanel}>
            <div className={styles.sectionHeader} style={{ marginBottom: '1rem', paddingBottom: '0.75rem' }}>
              <h2>AI Assistant Insights</h2>
            </div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Insight:</strong> 8 vehicle registrations are expiring concurrently next month.
              </p>
              <div style={{ padding: '1rem', background: 'rgba(14,165,233,0.1)', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.2)' }}>
                <p style={{ color: 'var(--accent-solid)', fontWeight: 600, marginBottom: '0.5rem' }}>Suggested Action</p>
                <p style={{ fontSize: '0.9rem' }}>Schedule bulk inspection at RTA next week to clear all 8 vehicles efficiently.</p>
              </div>
              <Link
                href="/fleet/ai"
                style={{ display: 'block', marginTop: '1rem', textAlign: 'center', padding: '0.65rem', borderRadius: '10px', background: 'rgba(14,165,233,0.08)', color: 'var(--accent-solid)', border: '1px solid rgba(14,165,233,0.2)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600, transition: 'background 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(14,165,233,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(14,165,233,0.08)'; }}
              >
                🤖 Ask AI Assistant →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

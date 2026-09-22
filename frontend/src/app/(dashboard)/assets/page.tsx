"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export default function VehicleProfilesPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    fetch(`${API_BASE}/assets/?limit=200`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = assets.filter(
    (a) =>
      a.fleet_number?.toLowerCase().includes(search.toLowerCase()) ||
      a.make_model?.toLowerCase().includes(search.toLowerCase()) ||
      a.registration_number?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'Active':   return { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' };
      case 'Maintenance': return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' };
      case 'Inactive': return { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', border: 'rgba(148,163,184,0.25)' };
      case 'Disposed': return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)' };
      default:         return { bg: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: 'rgba(255,255,255,0.1)' };
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', animation: 'fadeInSlide 0.5s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#fff,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
            Vehicle Profiles
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Identity, registration, ownership and operating status for every fleet asset.
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by Fleet No., Make/Model, Registration..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: '12px', color: 'var(--text-primary)', fontSize: '0.95rem',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Vehicles', value: assets.length, icon: '🚛' },
          { label: 'Active', value: assets.filter(a => a.operational_status === 'Active').length, icon: '✅' },
          { label: 'In Maintenance', value: assets.filter(a => a.operational_status === 'Maintenance').length, icon: '🔧' },
          { label: 'Inactive', value: assets.filter(a => a.operational_status === 'Inactive' || a.operational_status === 'Disposed').length, icon: '⛔' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: 'var(--glass-border)', borderRadius: '20px', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{loading ? '–' : s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Fleet No.', 'Make / Model', 'Registration', 'Category', 'Year', 'Status', 'Action'].map((h) => (
                <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading vehicles...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No vehicles found.</td></tr>
            ) : (
              filtered.map((a) => {
                const sc = statusColor(a.operational_status);
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--accent-solid)' }}>{a.fleet_number}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)' }}>{a.make_model || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{a.registration_number || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{a.category || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>{a.year || '—'}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                        {a.operational_status || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <Link href={`/assets/${a.id}`} style={{ padding: '0.4rem 1rem', borderRadius: '8px', background: 'rgba(14,165,233,0.1)', color: 'var(--accent-solid)', border: '1px solid rgba(14,165,233,0.2)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', transition: 'background 0.2s' }}>
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

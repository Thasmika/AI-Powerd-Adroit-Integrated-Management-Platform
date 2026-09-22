"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

type AssetDoc = {
  id: number;
  asset_id: number;
  fleet_number?: string;
  document_type_id: number;
  document_number: string;
  expiry_date: string | null;
  issue_date: string | null;
  status: string;
  is_current: boolean;
};

const DOC_TYPE_LABELS: Record<number, string> = {
  1: 'Vehicle Registration',
  2: 'Motor Insurance',
  3: 'Safety Certificate',
  4: 'Inspection Permit',
  5: 'Heavy Vehicle Permit',
};

export default function DocumentProcessBoardPage() {
  const [allDocs, setAllDocs] = useState<(AssetDoc & { fleet_number: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const assetRes = await fetch(`${API_BASE}/assets/?limit=200`, { headers });
      if (!assetRes.ok) throw new Error("Failed to fetch assets");
      const assetList = await assetRes.json();
      
      if (!Array.isArray(assetList)) return;

      // Fetch documents for each asset in parallel including history
      const docResults = await Promise.all(
        assetList.map(async (a) => {
          try {
            const endpoint = `${API_BASE}/assets/${a.id}/documents?history=true`;
            const r = await fetch(endpoint, { headers });
            if (!r.ok) return [];
            const docs: AssetDoc[] = await r.json();
            return docs.map((d) => ({ ...d, fleet_number: a.fleet_number }));
          } catch { return []; }
        })
      );

      setAllDocs(docResults.flat().sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Map to 6 columns
  // 1: Record, 2: Upload (Mock empty for now as requested)
  // 3: Monitor (is_current && VALID)
  // 4: Alert (is_current && (URGENT || RENEWAL DUE))
  // 5: Renew (is_current && EXPIRED)
  // 6: Update (Archived History, !is_current)

  const columns = [
    { id: 'record', title: '1. Record', desc: 'Create document', docs: [] },
    { id: 'upload', title: '2. Upload', desc: 'Attach digital copy', docs: [] },
    { 
      id: 'monitor', title: '3. Monitor', desc: 'Watch expiry dates',
      docs: allDocs.filter(d => d.is_current && d.status === 'VALID')
    },
    { 
      id: 'alert', title: '4. Alert', desc: 'Officer notified',
      docs: allDocs.filter(d => d.is_current && (d.status === 'URGENT' || d.status === 'RENEWAL DUE'))
    },
    { 
      id: 'renew', title: '5. Renew', desc: 'Action completed',
      docs: allDocs.filter(d => d.is_current && d.status === 'EXPIRED')
    },
    { 
      id: 'update', title: '6. Update', desc: 'History retained',
      docs: allDocs.filter(d => !d.is_current)
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID': return 'var(--status-valid)';
      case 'URGENT': return 'var(--status-urgent)';
      case 'RENEWAL DUE': return 'var(--status-due)';
      case 'EXPIRED': return 'var(--status-expired)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className={styles.boardContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Vehicle Document Control Process</h1>
          <p className={styles.subtitle}>Visually track and manage the ongoing lifecycle of vehicle documents.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading document pipeline...</div>
      ) : (
        <div className={styles.kanbanBoard}>
          {columns.map((col) => (
            <div key={col.id} className={styles.column}>
              <div className={styles.columnHeader}>
                <h3 className={styles.columnTitle}>{col.title}</h3>
                <p className={styles.columnDesc}>{col.desc}</p>
                <div className={styles.countBadge}>{col.docs.length}</div>
              </div>

              <div className={styles.cardList}>
                {col.docs.length === 0 ? (
                  <div className={styles.emptyState}>No documents in this stage</div>
                ) : (
                  col.docs.map(doc => (
                    <div key={doc.id} className={styles.card}>
                      <div className={styles.cardTop}>
                        <Link href={`/assets/${doc.asset_id}`} className={styles.fleetLink}>
                          {doc.fleet_number}
                        </Link>
                        <span 
                          className={styles.statusBadge}
                          style={{
                            color: getStatusColor(doc.status),
                            borderColor: getStatusColor(doc.status),
                            background: `color-mix(in srgb, ${getStatusColor(doc.status)} 12%, transparent)`
                          }}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <div className={styles.docType}>
                        {DOC_TYPE_LABELS[doc.document_type_id] || `Type ${doc.document_type_id}`}
                      </div>
                      <div className={styles.docNumber}>
                        {doc.document_number || 'Unnamed Doc'}
                      </div>
                      <div className={styles.cardFooter}>
                        <span className={styles.dateLabel}>Exp:</span>
                        <span className={doc.status === 'EXPIRED' ? styles.dateExpired : styles.dateValue}>
                          {doc.expiry_date || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

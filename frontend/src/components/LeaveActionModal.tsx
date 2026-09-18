"use client";

import React, { useState, useEffect } from 'react';
import styles from './LeaveActionModal.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type LeaveActionMode = 'review' | 'approve' | 'rejoin';

export function LeaveActionModal({
  isOpen,
  onClose,
  onSaveSuccess,
  leaveId,
  mode
}: {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  leaveId: number | null;
  mode: LeaveActionMode | null;
}) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusDecision, setStatusDecision] = useState('APPROVED');
  const [actualReturnDate, setActualReturnDate] = useState('');
  const [rejoinRemarks, setRejoinRemarks] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReviewNotes('');
      setStatusDecision('APPROVED');
      setActualReturnDate('');
      setRejoinRemarks('');
      setSaveError(null);
    }
  }, [isOpen]);

  if (!isOpen || !leaveId || !mode) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      let endpoint = '';
      let method = 'PUT';
      let urlStr = '';
      
      if (mode === 'review') {
        urlStr = `${API_BASE}/leaves/${leaveId}/review?review_notes=${encodeURIComponent(reviewNotes)}`;
      } else if (mode === 'approve') {
        urlStr = `${API_BASE}/leaves/${leaveId}/approve?status_decision=${encodeURIComponent(statusDecision)}`;
      } else if (mode === 'rejoin') {
        if (!actualReturnDate) {
          throw new Error('Return date is required');
        }
        urlStr = `${API_BASE}/leaves/${leaveId}/rejoin?actual_return_date=${encodeURIComponent(actualReturnDate)}&remarks=${encodeURIComponent(rejoinRemarks)}`;
      }

      const res = await fetch(urlStr, {
        method,
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        let errMsg = `HTTP ${res.status}`;
        if (body?.detail) {
          if (Array.isArray(body.detail)) {
            const err = body.detail[0];
            const field = err?.loc?.[err.loc.length - 1] || 'Field';
            errMsg = `${field}: ${err?.msg}`;
          } else {
            errMsg = body.detail;
          }
        }
        throw new Error(String(errMsg));
      }

      onSaveSuccess();
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setSaveError('Unable to connect to the server. Please check if the backend API is running.');
      } else {
        setSaveError(err.message ?? `Failed to perform ${mode} action.`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getTitle = () => {
    if (mode === 'review') return 'HR Review';
    if (mode === 'approve') return 'Approve / Reject';
    if (mode === 'rejoin') return 'Record Rejoining';
    return 'Action';
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ maxWidth: '500px' }}>
        <div className={styles.formContent} style={{ padding: '2rem' }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{getTitle()}</h2>
          
          <form className={styles.column} autoComplete="off" onSubmit={e => e.preventDefault()}>
            {mode === 'review' && (
              <div className={styles.field}>
                <label>HR REVIEW NOTES *</label>
                <textarea 
                  value={reviewNotes}
                  onChange={e => setReviewNotes(e.target.value)}
                  rows={4}
                  style={{
                    background: '#0b1120',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Enter notes about eligibility, dates, etc."
                  required
                />
              </div>
            )}

            {mode === 'approve' && (
              <div className={styles.field}>
                <label>DECISION *</label>
                <select 
                  value={statusDecision}
                  onChange={e => setStatusDecision(e.target.value)}
                  required
                >
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                </select>
              </div>
            )}

            {mode === 'rejoin' && (
              <>
                <div className={styles.field}>
                  <label>ACTUAL RETURN DATE *</label>
                  <input 
                    type="date" 
                    value={actualReturnDate}
                    onChange={e => setActualReturnDate(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>REMARKS</label>
                  <textarea 
                    value={rejoinRemarks}
                    onChange={e => setRejoinRemarks(e.target.value)}
                    rows={3}
                    style={{
                      background: '#0b1120',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: '#e2e8f0',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Any notes about the employee's return"
                  />
                </div>
              </>
            )}
          </form>

          {saveError && <div className={styles.errorAlert}>{saveError}</div>}

          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.btnSave} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

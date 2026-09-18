"""
ExpiryEngine — Steps 3 & 4 of the Document Control Process.

Step 3 (Monitor): Automatically evaluates expiry status from expiry_date.
Step 4 (Alert):   When status transitions to URGENT/EXPIRED, an audit event
                  is logged so the responsible officer can be notified.

Only `is_current=True` documents are scanned — archived versions (historical
records after a renewal) are intentionally excluded.
"""
from datetime import date
from typing import Optional
from sqlalchemy.orm import Session

from app.models.document import EmployeeDocument, AssetDocument, DocumentType
from app.services.audit_service import AuditService


class ExpiryEngine:

    # ─── Status thresholds ────────────────────────────────────────────────────
    URGENT_THRESHOLD_DAYS = 30

    @staticmethod
    def compute_live_status(expiry_date: Optional[date], warning_threshold_days: int) -> str:
        """
        Pure, side-effect-free status computation.
        Called by API endpoints so responses always carry a fresh status
        without requiring a DB write.

        Returns: EXPIRED | URGENT | RENEWAL DUE | VALID | ON FILE
        """
        if not expiry_date:
            return "ON FILE"

        today = date.today()
        days_remaining = (expiry_date - today).days

        if days_remaining < 0:
            return "EXPIRED"
        elif days_remaining <= ExpiryEngine.URGENT_THRESHOLD_DAYS:
            return "URGENT"
        elif days_remaining <= warning_threshold_days:
            return "RENEWAL DUE"
        else:
            return "VALID"

    @staticmethod
    def evaluate_status(expiry_date: Optional[date], warning_threshold_days: int) -> str:
        """Alias kept for backwards compatibility."""
        return ExpiryEngine.compute_live_status(expiry_date, warning_threshold_days)

    @staticmethod
    def run_daily_evaluation(db: Session) -> dict:
        """
        Step 3 — Monitor: Scan ALL active documents and update their stored status.
        Step 4 — Alert:  Log an audit event whenever status worsens to URGENT or EXPIRED,
                         giving the system a hook point for future email/push notifications.

        Only processes `is_current=True` asset documents (archived versions are skipped).
        Returns a summary dict for logging/monitoring.
        """
        summary = {"employee_updated": 0, "asset_updated": 0, "alerts_triggered": 0}

        # ── Employee Documents ────────────────────────────────────────────────
        emp_docs = db.query(EmployeeDocument).join(DocumentType).all()
        for doc in emp_docs:
            if doc.expiry_date and doc.document_type.expiry_required:
                new_status = ExpiryEngine.compute_live_status(
                    doc.expiry_date,
                    doc.document_type.default_warning_threshold_days
                )
                if doc.status != new_status:
                    doc.status = new_status
                    summary["employee_updated"] += 1

        # ── Asset Documents (is_current=True only) ────────────────────────────
        asset_docs = (
            db.query(AssetDocument)
            .join(DocumentType)
            .filter(AssetDocument.is_current == True)  # noqa: E712
            .all()
        )

        alert_statuses = {"URGENT", "EXPIRED"}

        for doc in asset_docs:
            if doc.expiry_date and doc.document_type.expiry_required:
                new_status = ExpiryEngine.compute_live_status(
                    doc.expiry_date,
                    doc.document_type.default_warning_threshold_days
                )
                if doc.status != new_status:
                    old_status = doc.status
                    doc.status = new_status
                    summary["asset_updated"] += 1

                    # Step 4 — Alert: Log whenever status worsens into action range.
                    # Future enhancement: dispatch email/push notification here.
                    if new_status in alert_statuses and old_status not in alert_statuses:
                        AuditService.log_action(
                            db=db,
                            action="DOCUMENT_ALERT_TRIGGERED",
                            module="Fleet",
                            entity_type="AssetDocument",
                            entity_id=doc.id,
                            user_id=None,   # System-generated event
                            after_state={
                                "asset_id": doc.asset_id,
                                "document_type_id": doc.document_type_id,
                                "old_status": old_status,
                                "new_status": new_status,
                                "expiry_date": str(doc.expiry_date),
                            }
                        )
                        summary["alerts_triggered"] += 1

        db.commit()
        return summary

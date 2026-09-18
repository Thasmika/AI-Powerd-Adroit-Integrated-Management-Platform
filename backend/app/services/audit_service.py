from sqlalchemy.orm import Session
from app.models.audit import AuditEvent
from typing import Dict, Any, Optional

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        module: str,
        entity_type: str,
        entity_id: Optional[int] = None,
        user_id: Optional[int] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ):
        """
        Records an immutable audit event for traceability of sensitive actions.
        """
        audit_event = AuditEvent(
            action=action,
            module=module,
            entity_id=entity_id,
            entity_type=entity_type,
            user_id=user_id,
            before_state=before_state,
            after_state=after_state,
            ip_address=ip_address
        )
        db.add(audit_event)
        # Flush to database but wait for the parent transaction to commit
        db.flush()
        return audit_event

# ── Base + Organization ──────────────────────────────────────────────────────
from app.db.base_class import Base
from app.models.company import Company
from app.models.department import Department
from app.models.location import Location

# ── Security / RBAC ──────────────────────────────────────────────────────────
from app.models.user import User, UserScope
from app.models.role import Role
from app.models.permissions import Permission

# ── HR ────────────────────────────────────────────────────────────────────────
from app.models.employee import Employee
from app.models.leave_type import LeaveType, LeaveEvent
from app.models.leave import LeaveRequest

# ── Fleet ─────────────────────────────────────────────────────────────────────
from app.models.asset import AssetCategory, Asset, MaintenanceLog

# ── Documents ─────────────────────────────────────────────────────────────────
from app.models.document import DocumentType, DocumentFile, EmployeeDocument, AssetDocument

# ── Expiry / Workflow ──────────────────────────────────────────────────────────
from app.models.officer_rules import ResponsibleOfficerRule
from app.models.audit import AuditEvent, ExpiryAction, Notification

# ── Governance / AI ───────────────────────────────────────────────────────────
from app.models.ai_interaction import AIInteraction
"""
RBAC — Permissions and Role-Permission assignments.

Design: deny-by-default. Every role starts with zero permissions.
Permissions are namespaced as "<module>:<action>" e.g. "HR:employee.view".
"""
from sqlalchemy import Column, Integer, String, Boolean, Table, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

# ── Join table ──────────────────────────────────────────────────────────────
role_permission_association = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False),
    UniqueConstraint("role_id", "permission_id", name="uq_role_permission"),
)


class Permission(Base):
    """
    Granular permission token.

    Naming convention: "<MODULE>:<resource>.<action>"
    Examples:
        HR:employee.view
        HR:employee.create
        HR:leave.approve
        FLEET:asset.view
        FLEET:document.upload
        SYSTEM:admin.all
    """
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # e.g. "HR:employee.view"
    description = Column(String, nullable=True)
    module = Column(String, nullable=False, index=True)  # HR | FLEET | SYSTEM
    is_active = Column(Boolean, default=True, nullable=False)

    # Roles that carry this permission
    roles = relationship(
        "Role",
        secondary=role_permission_association,
        back_populates="permissions",
    )

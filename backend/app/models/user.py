"""
Security — App Users, Role assignment, and Organisation Scope control.

user_role_association : Many-to-many join between users and roles.
UserScope             : Restricts which company/department a user can see.
                        A user with no scope rows sees everything (super admin).
"""
from sqlalchemy import (
    Column, Integer, String, Boolean, Table, ForeignKey, DateTime, UniqueConstraint
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


# ── Join tables ──────────────────────────────────────────────────────────────
user_role_association = Table(
    "user_role_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False),
)


class User(Base):
    """
    Application user account.

    is_superuser = True  → bypass all scope/permission checks.
    is_active    = False → login rejected.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    roles = relationship("Role", secondary=user_role_association, back_populates="users")
    scopes = relationship("UserScope", back_populates="user", cascade="all, delete-orphan")


class UserScope(Base):
    """
    Organisation-level access scope for a user.

    A user may have multiple scope rows restricting access to specific
    companies and/or departments. If NO rows exist, access is unrestricted
    (for super-admin accounts).

    scope_type: 'COMPANY' or 'DEPARTMENT'
    """
    __tablename__ = "user_scopes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scope_type = Column(String, nullable=False)                                         # COMPANY | DEPARTMENT
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "scope_type", "company_id", "department_id",
                         name="uq_user_scope"),
    )

    # Relationships
    user = relationship("User", back_populates="scopes")
    company = relationship("Company")
    department = relationship("Department")


"""
Expiry/Workflow — Responsible Officer Rules.

Defines which user is automatically assigned a renewal ExpiryAction
when a document of a given type approaches expiry.

Resolution order (highest priority wins):
  1. Exact match: document_type + company + department
  2. Company-level match: document_type + company (department IS NULL)
  3. Global match: document_type only (company IS NULL, department IS NULL)
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class ResponsibleOfficerRule(Base):
    """
    Configurable rule that maps a document type (+ optional org scope)
    to a responsible user for expiry-driven renewal actions.
    """
    __tablename__ = "responsible_officer_rules"

    id = Column(Integer, primary_key=True, index=True)

    # Matching criteria
    document_type_id = Column(Integer, ForeignKey("document_types.id", ondelete="CASCADE"), nullable=False, index=True)
    module = Column(String, nullable=False)                     # 'HR' | 'FLEET'
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)      # None = all companies
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)  # None = all departments

    # Resolution
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    priority = Column(Integer, default=100, nullable=False)     # Lower number = checked first
    is_active = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "document_type_id", "module", "company_id", "department_id",
            name="uq_officer_rule_scope",
        ),
    )

    # Relationships
    document_type = relationship("DocumentType")
    company = relationship("Company")
    department = relationship("Department")
    assigned_user = relationship("User", foreign_keys=[assigned_user_id])

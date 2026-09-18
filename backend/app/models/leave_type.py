"""
HR — Leave Types (reference data) and Leave Events (workflow audit trail).

LeaveType  : Reference table — Annual, Emergency, Sick etc.
LeaveEvent : Immutable log of every status transition on a LeaveRequest.
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class LeaveType(Base):
    """
    Reference table for leave categories.

    Seeded values: Annual, Emergency, Sick.
    """
    __tablename__ = "leave_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # "Annual Leave"
    code = Column(String, unique=True, nullable=False)               # "ANNUAL" | "EMERGENCY" | "SICK"
    max_days_per_year = Column(Integer, nullable=True)               # None = unlimited / governed externally
    requires_document = Column(Boolean, default=False)               # e.g. Sick leave may need a medical cert
    is_active = Column(Boolean, default=True, nullable=False)

    # Reverse relationship to requests (optional; lazy loaded)
    leave_requests = relationship("LeaveRequest", back_populates="leave_type_ref", lazy="dynamic")


class LeaveEvent(Base):
    """
    Immutable audit trail for every status transition on a LeaveRequest.

    Event types: SUBMITTED, HR_REVIEWED, APPROVED, REJECTED,
                 CANCELLED, ON_LEAVE, COMPLETED, REJOINED.
    Rows are append-only — never update or delete.
    """
    __tablename__ = "leave_events"

    id = Column(Integer, primary_key=True, index=True)
    leave_request_id = Column(Integer, ForeignKey("leave_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)   # SUBMITTED | APPROVED | REJECTED etc.
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Null = system action
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    leave_request = relationship("LeaveRequest", back_populates="events")
    actor = relationship("User", foreign_keys=[actor_id])

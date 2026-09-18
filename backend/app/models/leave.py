"""
HR — Leave Requests.

LeaveRequest links to LeaveType (reference) and tracks the full
approval workflow. Status transitions are logged in LeaveEvent
(see leave_type.py).
"""
from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)

    # Request Details
    leave_type = Column(String, nullable=True)                        # Legacy string — kept for compatibility
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"), nullable=True, index=True)  # FK to reference table
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(String)

    # Workflow Status
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED, ON_LEAVE, COMPLETED

    # HR Review & Approval
    hr_review_notes = Column(String, nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approval_date = Column(DateTime(timezone=True), nullable=True)

    # Rejoining
    actual_return_date = Column(Date, nullable=True)
    rejoining_remarks = Column(String, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    employee = relationship("Employee")
    leave_type_ref = relationship("LeaveType", back_populates="leave_requests")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    events = relationship("LeaveEvent", back_populates="leave_request",
                          cascade="all, delete-orphan", order_by="LeaveEvent.created_at")


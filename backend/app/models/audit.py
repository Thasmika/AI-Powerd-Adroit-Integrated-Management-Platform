from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Can be null for system actions
    action = Column(String, index=True, nullable=False) # e.g., 'DOCUMENT_UPLOAD', 'LEAVE_APPROVE', 'ASSET_CREATE'
    module = Column(String, index=True, nullable=False) # 'HR', 'FLEET', 'SYSTEM'
    entity_id = Column(Integer, nullable=True) # ID of the affected record
    entity_type = Column(String, nullable=True) # e.g., 'Employee', 'Asset', 'LeaveRequest'
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    ip_address = Column(String, nullable=True)
    
    user = relationship("User")

class ExpiryAction(Base):
    __tablename__ = "expiry_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    document_type_id = Column(Integer, ForeignKey("document_types.id"), nullable=False)
    entity_id = Column(Integer, nullable=False) # ID of Employee or Asset
    module = Column(String, nullable=False) # 'HR' or 'FLEET'
    
    # Action Status
    status = Column(String, default="OPEN") # OPEN, IN_PROGRESS, COMPLETED
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Dates
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    document_type = relationship("DocumentType")
    assigned_to = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    channel = Column(String, default="IN_APP") # IN_APP, EMAIL
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

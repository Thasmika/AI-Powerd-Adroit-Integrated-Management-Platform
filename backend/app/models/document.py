from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class DocumentType(Base):
    __tablename__ = "document_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False) # e.g., 'Passport', 'Visa', 'Vehicle Registration'
    module = Column(String, nullable=False) # 'HR' or 'Fleet'
    expiry_required = Column(Boolean, default=True)
    required = Column(Boolean, default=False)
    default_warning_threshold_days = Column(Integer, default=60)

class DocumentFile(Base):
    __tablename__ = "document_files"
    
    id = Column(Integer, primary_key=True, index=True)
    storage_key = Column(String, unique=True, nullable=False) # Internal key for local/cloud storage
    original_filename = Column(String, nullable=False)
    file_type = Column(String) # PDF, JPG, PNG
    file_size = Column(Integer)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by_id = Column(Integer, ForeignKey("users.id"))
    
    uploaded_by = relationship("User")

class EmployeeDocument(Base):
    __tablename__ = "employee_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    document_type_id = Column(Integer, ForeignKey("document_types.id"), nullable=False)
    document_file_id = Column(Integer, ForeignKey("document_files.id"), nullable=True) # Can be missing if just tracking metadata
    
    document_number = Column(String, nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    status = Column(String, default="VALID") # VALID, RENEWAL DUE, URGENT, EXPIRED, ON FILE
    notes = Column(String, nullable=True)
    
    employee = relationship("Employee")
    document_type = relationship("DocumentType")
    document_file = relationship("DocumentFile")

class AssetDocument(Base):
    """
    A single document record attached to a fleet asset.

    Lifecycle (6-step Document Control Process):
      1. RECORD  – row created with document metadata (document_number, dates)
      2. UPLOAD  – document_file_id set after scanning/upload
      3. MONITOR – system computes expiry status daily from expiry_date
      4. ALERT   – status transitions to URGENT / RENEWAL DUE; officer notified
      5. RENEW   – new AssetDocument row created; this row marked is_current=False
      6. UPDATE  – superseded_by_id points to the new record; full history retained

    is_current=True  → the active, live document for this vehicle + document type.
    is_current=False → archived historical version; traceable via superseded_by_id.
    """
    __tablename__ = "asset_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    document_type_id = Column(Integer, ForeignKey("document_types.id"), nullable=False)
    document_file_id = Column(Integer, ForeignKey("document_files.id"), nullable=True)
    
    document_number = Column(String, nullable=True)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)

    # Step 3 — computed status: VALID | RENEWAL DUE | URGENT | EXPIRED
    status = Column(String, default="VALID")
    notes = Column(String, nullable=True)

    # Step 5 & 6 — renewal lifecycle tracking
    is_current = Column(Boolean, default=True, nullable=False, index=True)
    superseded_by_id = Column(Integer, ForeignKey("asset_documents.id"), nullable=True)

    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    asset = relationship("Asset")
    document_type = relationship("DocumentType")
    document_file = relationship("DocumentFile")
    superseded_by = relationship("AssetDocument", remote_side=[id], foreign_keys=[superseded_by_id])

"""
Pydantic schemas for all document-related models.

AssetDocument schemas fully reflect the 6-step Document Control Process:
  1. Record  → AssetDocumentCreate
  2. Upload  → handled via multipart in the endpoint
  3. Monitor → status field, computed by ExpiryEngine
  4. Alert   → status = URGENT / RENEWAL DUE / EXPIRED
  5. Renew   → AssetDocumentRenewRequest
  6. Update  → superseded_by_id, is_current
"""
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel


# ─────────────────────────────────────────────
# DocumentFile
# ─────────────────────────────────────────────
class DocumentFileBase(BaseModel):
    original_filename: str
    file_type: str
    file_size: int


class DocumentFileInDB(DocumentFileBase):
    id: int
    storage_key: str
    upload_date: datetime
    uploaded_by_id: Optional[int] = None

    class Config:
        orm_mode = True


# ─────────────────────────────────────────────
# EmployeeDocument
# ─────────────────────────────────────────────
class EmployeeDocumentBase(BaseModel):
    employee_id: int
    document_type_id: int
    document_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    status: str = "VALID"


class EmployeeDocumentCreate(EmployeeDocumentBase):
    pass


class EmployeeDocumentUpdate(BaseModel):
    document_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class EmployeeDocumentInDB(EmployeeDocumentBase):
    id: int
    document_file_id: Optional[int] = None

    class Config:
        orm_mode = True


class EmployeeDocument(EmployeeDocumentInDB):
    document_file: Optional[DocumentFileInDB] = None


# ─────────────────────────────────────────────
# AssetDocument  (full lifecycle support)
# ─────────────────────────────────────────────
class AssetDocumentBase(BaseModel):
    asset_id: int
    document_type_id: int
    document_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    status: str = "VALID"


class AssetDocumentCreate(AssetDocumentBase):
    pass


class AssetDocumentUpdate(BaseModel):
    document_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class AssetDocumentRenewRequest(BaseModel):
    """
    Step 5 — Renew: payload used to create the replacement document record.
    The calling endpoint will atomically retire the old record (is_current=False,
    superseded_by_id=<new_id>) and activate this new one (is_current=True).
    """
    document_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None


class AssetDocumentInDB(AssetDocumentBase):
    id: int
    document_file_id: Optional[int] = None
    # Step 5 & 6 lifecycle fields
    is_current: bool = True
    superseded_by_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class AssetDocument(AssetDocumentInDB):
    document_file: Optional[DocumentFileInDB] = None


class AssetDocumentHistory(BaseModel):
    """Ordered list of all versions of a document (newest first)."""
    asset_id: int
    document_type_id: int
    versions: List[AssetDocument]

    class Config:
        orm_mode = True

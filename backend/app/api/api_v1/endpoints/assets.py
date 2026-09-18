"""
Assets API — Fleet Asset & Vehicle Document Control Endpoints.

Document Control endpoints implement the 6-step lifecycle:
  1. RECORD  → POST   /{id}/documents                   (create record)
  2. UPLOAD  → PUT    /{id}/documents/{doc_id}/upload    (attach scanned file)
  3. MONITOR → GET    /{id}/documents                   (live status computed)
  4. ALERT   → ExpiryEngine daily job (logs DOCUMENT_ALERT_TRIGGERED audit)
  5. RENEW   → POST   /{id}/documents/{doc_id}/renew    (creates new doc, archives old)
  6. UPDATE  → (automatic in step 5) superseded_by_id set, history retained

GET /{id}/documents returns only is_current=True by default.
Pass ?history=true to retrieve all versions including archived ones.
"""
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from datetime import date

from app.db.session import SessionLocal
from app.models.asset import Asset, MaintenanceLog
from app.models.document import AssetDocument, DocumentType
from app.schemas.asset import AssetCreate, AssetUpdate, Asset as AssetSchema
from app.schemas.document import (
    AssetDocument as AssetDocumentSchema,
    AssetDocumentHistory,
    AssetDocumentRenewRequest,
)
from app.schemas.maintenance import (
    MaintenanceLogCreate,
    MaintenanceLogUpdate,
    MaintenanceLog as MaintenanceLogSchema,
)
from app.api.deps import get_db, RoleChecker
from app.services.audit_service import AuditService
from app.services.document_service import DocumentService
from app.services.expiry_engine import ExpiryEngine

router = APIRouter()

fleet_roles = ["Super Admin", "Fleet/Transport Officer", "Management"]
fleet_read_roles = ["Super Admin", "Fleet/Transport Officer", "Management", "Read-Only Auditor"]

DOC_TYPE_LABEL_MAP = {
    1: "Vehicle Registration",
    2: "Motor Insurance",
    3: "Safety Certificate",
    4: "Inspection Permit",
    5: "Heavy Vehicle Permit",
}


# ─────────────────────────────────────────────────────────────────────────────
# Asset CRUD
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[AssetSchema])
def read_assets(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user=Depends(RoleChecker(fleet_read_roles)),
) -> Any:
    """Retrieve assets."""
    return db.query(Asset).offset(skip).limit(limit).all()


@router.post("/", response_model=AssetSchema)
def create_asset(
    *,
    db: Session = Depends(get_db),
    asset_in: AssetCreate,
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """Create new asset."""
    # Auto-generate fleet_number if not provided
    if not asset_in.fleet_number:
        last_asset = db.query(Asset).order_by(Asset.id.desc()).first()
        if last_asset and last_asset.fleet_number and last_asset.fleet_number.startswith("VRN-"):
            try:
                last_num = int(last_asset.fleet_number.split("-")[1])
                asset_in.fleet_number = f"VRN-{last_num + 1:02d}"
            except ValueError:
                asset_in.fleet_number = f"VRN-{last_asset.id + 1:02d}"
        else:
            asset_in.fleet_number = "VRN-01"

    if db.query(Asset).filter(Asset.fleet_number == asset_in.fleet_number).first():
        raise HTTPException(
            status_code=400,
            detail="The asset with this fleet_number already exists in the system.",
        )
    asset = Asset(**asset_in.dict())
    db.add(asset)
    db.commit()
    db.refresh(asset)

    AuditService.log_action(
        db=db,
        action="ASSET_CREATE",
        module="Fleet",
        entity_type="Asset",
        entity_id=asset.id,
        user_id=current_user.id,
        after_state={"fleet_number": asset.fleet_number, "make_model": asset.make_model},
    )
    db.commit()
    return asset


@router.get("/{id}", response_model=AssetSchema)
def read_asset_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_read_roles)),
) -> Any:
    """Get a specific asset by id."""
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.put("/{id}", response_model=AssetSchema)
def update_asset(
    id: int,
    asset_in: AssetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """Update an asset."""
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    for field, value in asset_in.dict(exclude_unset=True).items():
        setattr(asset, field, value)

    db.add(asset)
    db.commit()
    db.refresh(asset)

    AuditService.log_action(
        db=db,
        action="ASSET_UPDATE",
        module="Fleet",
        entity_type="Asset",
        entity_id=asset.id,
        user_id=current_user.id,
        after_state={"fleet_number": asset.fleet_number},
    )
    db.commit()
    return asset


@router.delete("/{id}", response_model=AssetSchema)
def delete_asset(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """Delete an asset."""
    asset = db.query(Asset).filter(Asset.id == id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    db.delete(asset)
    db.commit()

    AuditService.log_action(
        db=db,
        action="ASSET_DELETE",
        module="Fleet",
        entity_type="Asset",
        entity_id=id,
        user_id=current_user.id,
        after_state={"deleted": True},
    )
    db.commit()
    return asset


# ─────────────────────────────────────────────────────────────────────────────
# Document Control — Steps 1–6
# ─────────────────────────────────────────────────────────────────────────────

def _get_asset_or_404(db: Session, asset_id: int) -> Asset:
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


def _get_doc_or_404(db: Session, asset_id: int, doc_id: int) -> AssetDocument:
    doc = (
        db.query(AssetDocument)
        .filter(AssetDocument.id == doc_id, AssetDocument.asset_id == asset_id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


def _compute_and_patch_status(doc: AssetDocument, db: Session) -> AssetDocument:
    """
    Step 3 — Monitor: Compute live status from expiry date and sync to DB
    if it has changed. Returns the (potentially updated) document object.
    """
    doc_type = db.query(DocumentType).filter(DocumentType.id == doc.document_type_id).first()
    threshold = doc_type.default_warning_threshold_days if doc_type else 60

    live_status = ExpiryEngine.compute_live_status(doc.expiry_date, threshold)
    if doc.status != live_status:
        doc.status = live_status
        db.add(doc)
        # Commit deferred to caller to batch with other writes
    return doc


# ── Step 1 & 2: Record + optional Upload ─────────────────────────────────────

@router.post("/{id}/documents", response_model=AssetDocumentSchema)
def add_asset_document(
    id: int,
    document_type_id: int = Form(...),
    document_number: Optional[str] = Form(None),
    issue_date: Optional[date] = Form(None),
    expiry_date: Optional[date] = Form(None),
    notes: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """
    Step 1 — Record: Create a document record for this asset.
    Step 2 — Upload: Optionally attach a scanned file in the same call.

    If a current document of the same type already exists, this endpoint
    REJECTS the request. Use the /renew endpoint to replace an existing document.
    This enforces the full lifecycle — you cannot silently overwrite an existing
    current document; you must go through the Renew step to keep history.
    """
    _get_asset_or_404(db, id)

    # Guard: block silent overwrite — must use /renew instead
    existing_current = (
        db.query(AssetDocument)
        .filter(
            AssetDocument.asset_id == id,
            AssetDocument.document_type_id == document_type_id,
            AssetDocument.is_current == True,  # noqa: E712
        )
        .first()
    )
    if existing_current:
        raise HTTPException(
            status_code=409,
            detail=(
                f"A current {DOC_TYPE_LABEL_MAP.get(document_type_id, 'document')} already exists "
                f"for this asset (doc id={existing_current.id}). "
                "Use the /renew endpoint to replace it and preserve history."
            ),
        )

    # Step 2 — Upload file if provided
    doc_file_id = None
    if file and file.filename:
        doc_file = DocumentService.upload_document(db, file, current_user)
        doc_file_id = doc_file.id

    # Compute initial status (Step 3 — first pass)
    doc_type = db.query(DocumentType).filter(DocumentType.id == document_type_id).first()
    threshold = doc_type.default_warning_threshold_days if doc_type else 60
    initial_status = ExpiryEngine.compute_live_status(expiry_date, threshold)

    asset_doc = AssetDocument(
        asset_id=id,
        document_type_id=document_type_id,
        document_number=document_number,
        issue_date=issue_date,
        expiry_date=expiry_date,
        notes=notes,
        document_file_id=doc_file_id,
        status=initial_status,
        is_current=True,        # Step 1: always starts as the current document
        superseded_by_id=None,
    )
    db.add(asset_doc)
    db.commit()
    db.refresh(asset_doc)

    AuditService.log_action(
        db=db,
        action="ASSET_DOCUMENT_ADD",
        module="Fleet",
        entity_type="AssetDocument",
        entity_id=asset_doc.id,
        user_id=current_user.id,
        after_state={
            "asset_id": id,
            "document_type_id": document_type_id,
            "document_number": document_number,
            "expiry_date": str(expiry_date) if expiry_date else None,
            "has_file": doc_file_id is not None,
            "status": initial_status,
        },
    )
    db.commit()
    return asset_doc


# ── Step 2 (separate): Upload file to an already-recorded document ────────────

@router.put("/{id}/documents/{doc_id}/upload", response_model=AssetDocumentSchema)
def upload_file_to_document(
    id: int,
    doc_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """
    Step 2 — Upload: Attach a scanned digital copy to an existing document record.
    This separates 'Record' from 'Upload' as the process defines.
    Can also be used to replace a file on the current document.
    """
    _get_asset_or_404(db, id)
    doc = _get_doc_or_404(db, id, doc_id)

    if not doc.is_current:
        raise HTTPException(
            status_code=409,
            detail="Cannot upload a file to an archived document. Use the current version."
        )

    doc_file = DocumentService.upload_document(db, file, current_user)
    doc.document_file_id = doc_file.id
    db.add(doc)
    db.commit()
    db.refresh(doc)

    AuditService.log_action(
        db=db,
        action="ASSET_DOCUMENT_FILE_UPLOAD",
        module="Fleet",
        entity_type="AssetDocument",
        entity_id=doc.id,
        user_id=current_user.id,
        after_state={"asset_id": id, "doc_id": doc_id, "file": file.filename},
    )
    db.commit()
    return doc


# ── Step 3: Monitor — GET live documents ─────────────────────────────────────

@router.get("/{id}/documents", response_model=List[AssetDocumentSchema])
def read_asset_documents(
    id: int,
    history: bool = Query(False, description="Set true to include archived (superseded) versions"),
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_read_roles)),
) -> Any:
    """
    Step 3 — Monitor: Return documents with live-computed expiry status.

    By default only `is_current=True` documents are returned (the active live documents).
    Pass `?history=true` to retrieve all versions including archived historical records.
    """
    _get_asset_or_404(db, id)

    query = db.query(AssetDocument).filter(AssetDocument.asset_id == id)
    if not history:
        query = query.filter(AssetDocument.is_current == True)  # noqa: E712

    docs = query.order_by(AssetDocument.document_type_id, AssetDocument.id.desc()).all()

    # Step 3 — compute & patch live statuses in one batch
    changed = False
    for doc in docs:
        before = doc.status
        doc = _compute_and_patch_status(doc, db)
        if doc.status != before:
            changed = True

    if changed:
        db.commit()
        for doc in docs:
            db.refresh(doc)

    return docs


# ── Step 5 & 6: Renew + Update ────────────────────────────────────────────────

@router.post("/{id}/documents/{doc_id}/renew", response_model=AssetDocumentSchema)
def renew_asset_document(
    id: int,
    doc_id: int,
    renew_in: AssetDocumentRenewRequest,
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """
    Step 5 — Renew: Create a replacement document record.
    Step 6 — Update: Atomically archive the old record and activate the new one.

    Transactional guarantee: if any step fails, the entire operation rolls back —
    you will never end up with two 'current' documents or a dangling archived record.

    After completion:
      - New document: is_current=True, superseded_by_id=None
      - Old document: is_current=False, superseded_by_id=<new_doc.id>
      - Full history is preserved and queryable via GET /documents?history=true
    """
    _get_asset_or_404(db, id)
    old_doc = _get_doc_or_404(db, id, doc_id)

    if not old_doc.is_current:
        raise HTTPException(
            status_code=409,
            detail="Only the current active document can be renewed. This record is already archived."
        )

    try:
        # Step 2 (of renew) — Upload new file if provided
        new_file_id = None
        if file and file.filename:
            new_file = DocumentService.upload_document(db, file, current_user)
            new_file_id = new_file.id

        # Compute initial status for new document
        doc_type = db.query(DocumentType).filter(
            DocumentType.id == old_doc.document_type_id
        ).first()
        threshold = doc_type.default_warning_threshold_days if doc_type else 60
        new_status = ExpiryEngine.compute_live_status(renew_in.expiry_date, threshold)

        # Step 5 — Create the new replacement document
        new_doc = AssetDocument(
            asset_id=id,
            document_type_id=old_doc.document_type_id,
            document_number=renew_in.document_number,
            issue_date=renew_in.issue_date,
            expiry_date=renew_in.expiry_date,
            notes=renew_in.notes,
            document_file_id=new_file_id,
            status=new_status,
            is_current=True,
            superseded_by_id=None,
        )
        db.add(new_doc)
        db.flush()  # Get new_doc.id without committing yet

        # Step 6 — Archive the old document, point to new
        old_doc.is_current = False
        old_doc.superseded_by_id = new_doc.id
        db.add(old_doc)

        # Commit atomically
        db.commit()
        db.refresh(new_doc)

        AuditService.log_action(
            db=db,
            action="ASSET_DOCUMENT_RENEW",
            module="Fleet",
            entity_type="AssetDocument",
            entity_id=new_doc.id,
            user_id=current_user.id,
            after_state={
                "asset_id": id,
                "document_type_id": old_doc.document_type_id,
                "old_doc_id": old_doc.id,
                "new_doc_id": new_doc.id,
                "new_expiry_date": str(renew_in.expiry_date) if renew_in.expiry_date else None,
                "new_status": new_status,
            },
        )
        db.commit()
        return new_doc

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Renewal failed and was rolled back: {str(exc)}"
        ) from exc


# ── History: GET full version chain ──────────────────────────────────────────

@router.get("/{id}/documents/{doc_id}/history", response_model=AssetDocumentHistory)
def get_document_history(
    id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_read_roles)),
) -> Any:
    """
    Return the complete version chain for a document.
    Starting from any version (current or archived), walks the chain to find
    all historical versions of the same document type for this asset,
    ordered newest first.
    """
    _get_asset_or_404(db, id)
    anchor = _get_doc_or_404(db, id, doc_id)

    # Fetch all versions for this asset + document_type
    all_versions = (
        db.query(AssetDocument)
        .filter(
            AssetDocument.asset_id == id,
            AssetDocument.document_type_id == anchor.document_type_id,
        )
        .order_by(AssetDocument.id.desc())
        .all()
    )

    return {
        "asset_id": id,
        "document_type_id": anchor.document_type_id,
        "versions": all_versions,
    }


# ── Delete (current docs only — safety guard) ────────────────────────────────

@router.delete("/{id}/documents/{doc_id}", response_model=AssetDocumentSchema)
def delete_asset_document(
    id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """
    Delete a document from an asset.
    Archived historical records (is_current=False) can always be deleted.
    Deleting a current record is allowed but will log a warning audit event.
    """
    _get_asset_or_404(db, id)
    document = _get_doc_or_404(db, id, doc_id)

    db.delete(document)
    db.commit()

    AuditService.log_action(
        db=db,
        action="ASSET_DOCUMENT_DELETE",
        module="Fleet",
        entity_type="AssetDocument",
        entity_id=doc_id,
        user_id=current_user.id,
        after_state={
            "deleted": True,
            "was_current": document.is_current,
            "document_type_id": document.document_type_id,
        },
    )
    db.commit()
    return document


# ─────────────────────────────────────────────────────────────────────────────
# Maintenance Logs
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{id}/maintenance", response_model=List[MaintenanceLogSchema])
def read_asset_maintenance_logs(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_read_roles)),
) -> Any:
    """Get all maintenance logs for a specific asset."""
    _get_asset_or_404(db, id)
    return db.query(MaintenanceLog).filter(MaintenanceLog.asset_id == id).all()


@router.post("/{id}/maintenance", response_model=MaintenanceLogSchema)
def create_asset_maintenance_log(
    id: int,
    log_in: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """Create a new maintenance log for an asset."""
    _get_asset_or_404(db, id)
    log = MaintenanceLog(**log_in.dict())
    log.asset_id = id
    db.add(log)
    db.commit()
    db.refresh(log)

    AuditService.log_action(
        db=db,
        action="ASSET_MAINTENANCE_CREATE",
        module="Fleet",
        entity_type="MaintenanceLog",
        entity_id=log.id,
        user_id=current_user.id,
        after_state={"asset_id": id, "service": log.service},
    )
    db.commit()
    return log


@router.put("/{id}/maintenance/{log_id}", response_model=MaintenanceLogSchema)
def update_asset_maintenance_log(
    id: int,
    log_id: int,
    log_in: MaintenanceLogUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """Update a maintenance log for an asset."""
    _get_asset_or_404(db, id)
    log = db.query(MaintenanceLog).filter(
        MaintenanceLog.id == log_id, MaintenanceLog.asset_id == id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    for field, value in log_in.dict(exclude_unset=True).items():
        setattr(log, field, value)

    db.add(log)
    db.commit()
    db.refresh(log)

    AuditService.log_action(
        db=db,
        action="ASSET_MAINTENANCE_UPDATE",
        module="Fleet",
        entity_type="MaintenanceLog",
        entity_id=log.id,
        user_id=current_user.id,
        after_state={"asset_id": id, "service": log.service},
    )
    db.commit()
    return log


@router.delete("/{id}/maintenance/{log_id}", response_model=MaintenanceLogSchema)
def delete_asset_maintenance_log(
    id: int,
    log_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(fleet_roles)),
) -> Any:
    """Delete a maintenance log from an asset."""
    _get_asset_or_404(db, id)
    log = db.query(MaintenanceLog).filter(
        MaintenanceLog.id == log_id, MaintenanceLog.asset_id == id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    db.delete(log)
    db.commit()

    AuditService.log_action(
        db=db,
        action="ASSET_MAINTENANCE_DELETE",
        module="Fleet",
        entity_type="MaintenanceLog",
        entity_id=log_id,
        user_id=current_user.id,
        after_state={"deleted": True},
    )
    db.commit()
    return log

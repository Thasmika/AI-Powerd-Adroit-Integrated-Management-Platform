from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from app.db.session import SessionLocal
from app.models.leave import LeaveRequest
from app.schemas.leave import LeaveRequestCreate, LeaveRequestUpdate, LeaveRequest as LeaveRequestSchema, LeaveRequestWithEmployee
from app.api.deps import get_db, get_current_active_user, RoleChecker
from app.services.audit_service import AuditService

router = APIRouter()

@router.post("/", response_model=LeaveRequestSchema)
def create_leave_request(
    *,
    db: Session = Depends(get_db),
    leave_in: LeaveRequestCreate,
    current_user = Depends(RoleChecker(["Super Admin", "HR Officer", "Management", "Department Head"]))
) -> Any:
    """
    Submit a new leave request.
    """
    # Validation logic (dates etc)
    if leave_in.start_date > leave_in.end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date")
        
    leave = LeaveRequest(
        employee_id=leave_in.employee_id,
        leave_type=leave_in.leave_type,
        start_date=leave_in.start_date,
        end_date=leave_in.end_date,
        reason=leave_in.reason,
        status="PENDING"
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    
    AuditService.log_action(
        db=db, action="LEAVE_REQUEST_CREATE", module="HR",
        entity_type="LeaveRequest", entity_id=leave.id, user_id=current_user.id
    )
    db.commit()
    return leave

@router.get("/", response_model=List[LeaveRequestWithEmployee])
def read_leaves(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(RoleChecker(["Super Admin", "HR Officer", "Management", "Department Head"]))
) -> Any:
    """
    Retrieve all leave requests.
    """
    leaves = db.query(LeaveRequest).order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
    return leaves

@router.put("/{id}/review", response_model=LeaveRequestSchema)
def review_leave_request(
    id: int,
    *,
    db: Session = Depends(get_db),
    review_notes: str,
    current_user = Depends(RoleChecker(["Super Admin", "HR Officer"]))
) -> Any:
    """
    HR reviews the leave request.
    """
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave.hr_review_notes = review_notes
    leave.reviewed_by_id = current_user.id
    leave.status = "REVIEWED"
    db.commit()
    db.refresh(leave)
    return leave

@router.put("/{id}/approve", response_model=LeaveRequestSchema)
def approve_leave_request(
    id: int,
    *,
    db: Session = Depends(get_db),
    status_decision: str, # APPROVED or REJECTED
    current_user = Depends(RoleChecker(["Super Admin", "Management", "Department Head"]))
) -> Any:
    """
    Authorized approver accepts or rejects the leave request.
    """
    if status_decision not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid status decision")
        
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave.status = status_decision
    leave.approved_by_id = current_user.id
    from datetime import datetime
    leave.approval_date = datetime.utcnow()
    
    db.commit()
    db.refresh(leave)
    
    AuditService.log_action(
        db=db, action=f"LEAVE_REQUEST_{status_decision}", module="HR",
        entity_type="LeaveRequest", entity_id=leave.id, user_id=current_user.id
    )
    db.commit()
    return leave

@router.put("/{id}/rejoin", response_model=LeaveRequestSchema)
def record_rejoining(
    id: int,
    *,
    db: Session = Depends(get_db),
    actual_return_date: date,
    remarks: str,
    current_user = Depends(RoleChecker(["Super Admin", "HR Officer"]))
) -> Any:
    """
    Record an employee returning from leave.
    """
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
        
    leave.status = "COMPLETED"
    leave.actual_return_date = actual_return_date
    leave.rejoining_remarks = remarks
    
    db.commit()
    db.refresh(leave)
    
    AuditService.log_action(
        db=db, action="LEAVE_REJOIN", module="HR",
        entity_type="LeaveRequest", entity_id=leave.id, user_id=current_user.id
    )
    db.commit()
    return leave

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leave_request(
    *,
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Super Admin", "HR Officer", "Management"]))
) -> None:
    """
    Delete a leave request.
    """
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")

    AuditService.log_action(
        db=db, action="LEAVE_REQUEST_DELETE", module="HR",
        entity_type="LeaveRequest", entity_id=leave.id, user_id=current_user.id
    )

    db.delete(leave)
    db.commit()

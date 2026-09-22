from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.api.deps import get_db, RoleChecker
from app.models.employee import Employee
from app.models.document import EmployeeDocument
from app.models.leave import LeaveRequest

router = APIRouter()

@router.get("/hr-stats")
def get_hr_stats(
    db: Session = Depends(get_db),
    current_user = Depends(RoleChecker(["Super Admin", "HR Officer", "Management", "Read-Only Auditor"]))
):
    today = date.today()
    sixty_days_later = today + timedelta(days=60)
    
    # 1. Total Employees
    total_employees = db.query(Employee).filter(Employee.is_active == True).count()
    
    # 2. Expiring <= 60 Days (Visa / EID / Passport)
    expiring_docs = db.query(EmployeeDocument).filter(
        EmployeeDocument.expiry_date != None,
        EmployeeDocument.expiry_date >= today,
        EmployeeDocument.expiry_date <= sixty_days_later
    ).count()
    
    # 3. On Leave
    on_leave = db.query(LeaveRequest).filter(
        LeaveRequest.start_date <= today,
        LeaveRequest.end_date >= today,
        LeaveRequest.status.in_(["APPROVED", "ON_LEAVE"])
    ).count()
    
    # 4. Pending Actions (HR follow-up)
    pending_leaves = db.query(LeaveRequest).filter(
        LeaveRequest.status == "PENDING"
    ).count()
    
    return {
        "totalEmployees": total_employees,
        "expiringDocs": expiring_docs,
        "onLeave": on_leave,
        "pendingActions": pending_leaves
    }

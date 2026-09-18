from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.db.session import SessionLocal
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, Employee as EmployeeSchema
from app.api.deps import get_db, get_current_active_user, RoleChecker
from app.services.audit_service import AuditService

router = APIRouter()

# Password hashing context for system_password field
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Define roles that can modify HR data
hr_roles = ["Super Admin", "HR Officer", "Management"]


# ---------------------------------------------------------------------------
# GET /employees/ — list all employees
# ---------------------------------------------------------------------------
@router.get("/", response_model=List[EmployeeSchema])
def read_employees(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    employee_id: Optional[str] = None,
    name: Optional[str] = None,
    current_user=Depends(
        RoleChecker(["Super Admin", "HR Officer", "Management", "Read-Only Auditor"])
    ),
) -> Any:
    """Retrieve a paginated list of employees."""
    query = db.query(Employee)
    if employee_id:
        query = query.filter(Employee.employee_id.ilike(f"%{employee_id}%"))
    if name:
        query = query.filter(
            (Employee.first_name.ilike(f"%{name}%")) | (Employee.last_name.ilike(f"%{name}%"))
        )
    employees = query.offset(skip).limit(limit).all()
    return employees


# ---------------------------------------------------------------------------
# POST /employees/ — create a new employee
# ---------------------------------------------------------------------------
@router.post("/", response_model=EmployeeSchema, status_code=status.HTTP_201_CREATED)
def create_employee(
    *,
    db: Session = Depends(get_db),
    employee_in: EmployeeCreate,
    current_user=Depends(RoleChecker(hr_roles)),
) -> Any:
    """Create a new employee record."""
    # Auto-generate employee_id if not provided
    if not employee_in.employee_id:
        last_emp = db.query(Employee).order_by(Employee.id.desc()).first()
        if last_emp and last_emp.employee_id and last_emp.employee_id.startswith("EMP-"):
            try:
                last_num = int(last_emp.employee_id.split("-")[1])
                employee_in.employee_id = f"EMP-{last_num + 1:02d}"
            except ValueError:
                employee_in.employee_id = f"EMP-{last_emp.id + 1:02d}"
        else:
            employee_in.employee_id = "EMP-01"

    # Uniqueness guard
    existing = db.query(Employee).filter(Employee.employee_id == employee_in.employee_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An employee with this employee_id already exists.",
        )

    # Separate password before model creation; hash it if provided
    data = employee_in.dict(exclude={"system_password"})
    raw_password = employee_in.system_password
    if raw_password:
        data["system_password"] = _pwd_context.hash(raw_password)

    employee = Employee(**data)
    db.add(employee)
    db.commit()
    db.refresh(employee)

    # Audit trail
    AuditService.log_action(
        db=db,
        action="EMPLOYEE_CREATE",
        module="HR",
        entity_type="Employee",
        entity_id=employee.id,
        user_id=current_user.id,
        after_state={"employee_id": employee.employee_id, "name": f"{employee.first_name} {employee.last_name}"},
    )
    db.commit()

    return employee


# ---------------------------------------------------------------------------
# GET /employees/{id} — fetch a single employee
# ---------------------------------------------------------------------------
@router.get("/{id}", response_model=EmployeeSchema)
def read_employee_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        RoleChecker(
            ["Super Admin", "HR Officer", "Management", "Read-Only Auditor", "Department Head"]
        )
    ),
) -> Any:
    """Get a specific employee by database ID."""
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Department Head scope check (placeholder — tighten as business rules evolve)
    user_roles = [role.name for role in current_user.roles]
    if (
        "Department Head" in user_roles
        and "Super Admin" not in user_roles
        and "HR Officer" not in user_roles
    ):
        pass  # Extend with dept-level scoping when user.department_id is available

    return employee


# ---------------------------------------------------------------------------
# PUT /employees/{id} — update an existing employee
# ---------------------------------------------------------------------------
@router.put("/{id}", response_model=EmployeeSchema)
def update_employee(
    *,
    id: int,
    db: Session = Depends(get_db),
    employee_in: EmployeeUpdate,
    current_user=Depends(RoleChecker(hr_roles)),
) -> Any:
    """Update an existing employee record. Only supplied fields are modified."""
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Capture before-state for the audit trail
    before_state = {
        "employee_id": employee.employee_id,
        "name": f"{employee.first_name} {employee.last_name}",
    }

    # Apply only the fields that were explicitly provided (exclude_unset=True)
    update_data = employee_in.dict(exclude_unset=True)

    # Hash password if it was included in the update payload
    raw_password = update_data.pop("system_password", None)
    if raw_password:
        update_data["system_password"] = _pwd_context.hash(raw_password)

    for field, value in update_data.items():
        setattr(employee, field, value)

    db.add(employee)
    db.commit()
    db.refresh(employee)

    # Audit trail
    AuditService.log_action(
        db=db,
        action="EMPLOYEE_UPDATE",
        module="HR",
        entity_type="Employee",
        entity_id=employee.id,
        user_id=current_user.id,
        before_state=before_state,
        after_state={"employee_id": employee.employee_id, "name": f"{employee.first_name} {employee.last_name}"},
    )
    db.commit()

    return employee


# ---------------------------------------------------------------------------
# DELETE /employees/{id} — remove an employee
# ---------------------------------------------------------------------------
@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    *,
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(RoleChecker(hr_roles)),
) -> None:
    """Permanently delete an employee record."""
    employee = db.query(Employee).filter(Employee.id == id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Audit trail before deletion (after_state is None to signal removal)
    AuditService.log_action(
        db=db,
        action="EMPLOYEE_DELETE",
        module="HR",
        entity_type="Employee",
        entity_id=employee.id,
        user_id=current_user.id,
        before_state={"employee_id": employee.employee_id, "name": f"{employee.first_name} {employee.last_name}"},
    )

    db.delete(employee)
    db.commit()

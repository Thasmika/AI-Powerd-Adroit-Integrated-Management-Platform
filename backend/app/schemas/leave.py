from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel

class LeaveRequestBase(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    status: Optional[str] = None
    hr_review_notes: Optional[str] = None
    actual_return_date: Optional[date] = None
    rejoining_remarks: Optional[str] = None

class LeaveRequestInDBBase(LeaveRequestBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    reviewed_by_id: Optional[int] = None
    approved_by_id: Optional[int] = None
    approval_date: Optional[datetime] = None
    
    hr_review_notes: Optional[str] = None
    actual_return_date: Optional[date] = None
    rejoining_remarks: Optional[str] = None

    class Config:
        orm_mode = True

class LeaveRequest(LeaveRequestInDBBase):
    pass

class EmployeeBasic(BaseModel):
    id: int
    first_name: str
    last_name: str
    employee_id: str
    
    class Config:
        orm_mode = True

class LeaveRequestWithEmployee(LeaveRequest):
    employee: Optional[EmployeeBasic] = None

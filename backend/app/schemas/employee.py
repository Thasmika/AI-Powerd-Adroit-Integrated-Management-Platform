from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class EmployeeBase(BaseModel):
    # Core Identity
    employee_id: Optional[str] = None
    emp_code: Optional[str] = None
    first_name: str
    last_name: str
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    contact_number: Optional[str] = None

    # Employment
    employment_status: str = "Active"
    designation: Optional[str] = None
    joining_date: Optional[date] = None

    # Organization
    department_id: Optional[int] = None
    location_id: Optional[int] = None
    department_head_id: Optional[int] = None

    # Company / Sponsorship
    operating_company_id: Optional[int] = None
    visa_sponsoring_company_id: Optional[int] = None

    # Insurance
    insurance_provider: Optional[str] = None
    insurance_plan: Optional[str] = None
    health_card_no: Optional[str] = None

    # Financial / Salary
    salary_category: Optional[str] = None
    salary_transfer_status: Optional[bool] = True
    bank_name: Optional[str] = None
    bank_ac: Optional[str] = None
    routing_no: Optional[str] = None

    # Identifications & Labor
    company_mol_id: Optional[str] = None
    emp_mol_id: Optional[str] = None
    eid_no: Optional[str] = None
    uid_no: Optional[str] = None

    # Metadata
    notes: Optional[str] = None
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    """Schema for creating a new employee. system_password is hashed server-side."""
    system_password: Optional[str] = None  # Plaintext received; hashed before storage


class EmployeeUpdate(BaseModel):
    """All fields optional for partial updates (PATCH-style PUT)."""
    emp_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    employee_id: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    contact_number: Optional[str] = None
    employment_status: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    department_id: Optional[int] = None
    location_id: Optional[int] = None
    department_head_id: Optional[int] = None
    operating_company_id: Optional[int] = None
    visa_sponsoring_company_id: Optional[int] = None
    insurance_provider: Optional[str] = None
    insurance_plan: Optional[str] = None
    health_card_no: Optional[str] = None
    salary_category: Optional[str] = None
    salary_transfer_status: Optional[bool] = None
    bank_name: Optional[str] = None
    bank_ac: Optional[str] = None
    routing_no: Optional[str] = None
    company_mol_id: Optional[str] = None
    emp_mol_id: Optional[str] = None
    eid_no: Optional[str] = None
    uid_no: Optional[str] = None
    system_password: Optional[str] = None  # Plaintext received; hashed before storage
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeInDBBase(EmployeeBase):
    id: int
    photo_url: Optional[str] = None

    class Config:
        orm_mode = True


class Employee(EmployeeInDBBase):
    pass

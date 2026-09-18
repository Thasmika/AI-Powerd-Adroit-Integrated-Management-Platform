from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False) # e.g., EMP 0115
    emp_code = Column(String, index=True, nullable=True)
    
    # Identity
    photo_url = Column(String, nullable=True)
    first_name = Column(String, index=True, nullable=False)
    last_name = Column(String, index=True, nullable=False)
    nationality = Column(String)
    date_of_birth = Column(Date)
    contact_number = Column(String)
    
    # Employment
    employment_status = Column(String, default="Active") # Active, Inactive, On Leave
    designation = Column(String)
    joining_date = Column(Date)
    
    # Relationships to Organization (Departments, Locations)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    department_head_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Company / Sponsorship
    operating_company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    visa_sponsoring_company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    
    # Insurance
    insurance_provider = Column(String, nullable=True)
    insurance_plan = Column(String, nullable=True)
    health_card_no = Column(String, nullable=True)
    
    # Financial/Salary
    salary_category = Column(String, nullable=True)
    salary_transfer_status = Column(Boolean, default=True)
    bank_name = Column(String, nullable=True)
    bank_ac = Column(String, nullable=True)
    routing_no = Column(String, nullable=True)

    # Identifications & Labor
    company_mol_id = Column(String, nullable=True)
    emp_mol_id = Column(String, nullable=True)
    eid_no = Column(String, nullable=True)
    uid_no = Column(String, nullable=True)

    # System Access
    system_password = Column(String, nullable=True) # Hashed
    
    # Metadata
    is_active = Column(Boolean, default=True)
    notes = Column(String, nullable=True)
    
    # Relationship Definitions
    department = relationship("Department")
    location = relationship("Location")
    operating_company = relationship("Company", foreign_keys=[operating_company_id])
    visa_sponsoring_company = relationship("Company", foreign_keys=[visa_sponsoring_company_id])
    department_head = relationship("User", foreign_keys=[department_head_id])

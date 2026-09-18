import os
import sys
from datetime import date

# Add the backend root to the path so we can import the app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.db.base import Company, Department, Location, Employee, Asset

def import_data():
    db = SessionLocal()
    print("Starting data import...")
    
    # Check if we need to create some default company/department
    company = db.query(Company).filter(Company.name == "Adroit LLC").first()
    if not company:
        company = Company(name="Adroit LLC")
        db.add(company)
        db.commit()
        db.refresh(company)

    department = db.query(Department).filter(Department.name == "IT").first()
    if not department:
        department = Department(name="IT", company_id=company.id)
        db.add(department)
        db.commit()
        db.refresh(department)
        
    location = db.query(Location).filter(Location.name == "HQ").first()
    if not location:
        location = Location(name="HQ", company_id=company.id)
        db.add(location)
        db.commit()
        db.refresh(location)

    # Legacy employee records to import
    legacy_employees = [
        {
            "employee_id": "EMP-001",
            "first_name": "John",
            "last_name": "Doe",
            "department_id": department.id,
            "designation": "Manager",
            "employment_status": "Active"
        },
        {
            "employee_id": "EMP-002",
            "first_name": "Jane",
            "last_name": "Smith",
            "department_id": department.id,
            "designation": "Engineer",
            "employment_status": "Active"
        }
    ]

    employees_added = 0
    for emp_data in legacy_employees:
        existing = db.query(Employee).filter(Employee.employee_id == emp_data["employee_id"]).first()
        if not existing:
            emp = Employee(**emp_data)
            db.add(emp)
            employees_added += 1
            print(f"Imported employee {emp_data['employee_id']}")
        else:
            print(f"Employee {emp_data['employee_id']} already exists. Skipping.")

    # Legacy asset records to import
    legacy_assets = [
        {
            "fleet_number": "VH-001",
            "registration_number": "REG-001",
            "category": "Heavy Vehicle",
            "make_model": "Mercedes Actros",
            "year": 2020,
            "chassis_vin": "WDB1234567890",
            "operational_status": "Active",
            "owning_company_id": company.id
        },
        {
            "fleet_number": "VH-002",
            "registration_number": "REG-002",
            "category": "Light Vehicle",
            "make_model": "Toyota Hilux",
            "year": 2021,
            "chassis_vin": "MRO1234567890",
            "operational_status": "Active",
            "owning_company_id": company.id
        }
    ]

    assets_added = 0
    for asset_data in legacy_assets:
        existing = db.query(Asset).filter(Asset.fleet_number == asset_data["fleet_number"]).first()
        if not existing:
            asset = Asset(**asset_data)
            db.add(asset)
            assets_added += 1
            print(f"Imported asset {asset_data['fleet_number']}")
        else:
            print(f"Asset {asset_data['fleet_number']} already exists. Skipping.")

    db.commit()
    db.close()
    print(f"Data import completed! Added {employees_added} employees and {assets_added} assets.")

if __name__ == "__main__":
    import_data()

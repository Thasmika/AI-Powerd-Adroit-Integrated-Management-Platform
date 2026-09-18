import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.db.base import Company, Department, Location

departments_to_add = [
    "Administrative Department",
    "Trading Department",
    "Transport Department",
    "Transport & Trading Department"
]

locations_to_add = [
    "Satwa Branch",
    "Aweer Branch",
    "Alboom Branch",
    "Ajman Branch",
    "Aweer Store",
    "Technical Workshop"
]

def seed_data():
    db = SessionLocal()
    try:
        # Check if we have a company to link to, if not create one
        company = db.query(Company).first()
        if not company:
            company = Company(name="Default Company")
            db.add(company)
            db.commit()
            db.refresh(company)

        # Seed Departments
        for dept_name in departments_to_add:
            existing = db.query(Department).filter(Department.name == dept_name).first()
            if not existing:
                new_dept = Department(name=dept_name, company_id=company.id, is_active=True)
                db.add(new_dept)
                print(f"Added Department: {dept_name}")
            else:
                print(f"Department already exists: {dept_name}")
                
        # Seed Locations
        for loc_name in locations_to_add:
            existing = db.query(Location).filter(Location.name == loc_name).first()
            if not existing:
                new_loc = Location(name=loc_name, company_id=company.id, is_active=True)
                db.add(new_loc)
                print(f"Added Location: {loc_name}")
            else:
                print(f"Location already exists: {loc_name}")
                
        db.commit()
        print("Done.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

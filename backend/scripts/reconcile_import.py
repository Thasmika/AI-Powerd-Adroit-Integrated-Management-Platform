import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.db.base import Employee, Asset, Department, Company

def reconcile():
    db = SessionLocal()
    print("Starting post-import reconciliation...")
    
    # We expect 2 employees and 2 assets from our import data script
    expected_employees = 2
    expected_assets = 2
    
    actual_employees = db.query(Employee).count()
    actual_assets = db.query(Asset).count()
    
    print(f"Employees: Expected={expected_employees}, Actual={actual_employees}")
    if expected_employees <= actual_employees:
        print("[PASS] Employee reconciliation passed.")
    else:
        print("[FAIL] Employee reconciliation failed! Missing records.")
        
    print(f"Assets: Expected={expected_assets}, Actual={actual_assets}")
    if expected_assets <= actual_assets:
        print("[PASS] Asset reconciliation passed.")
    else:
        print("[FAIL] Asset reconciliation failed! Missing records.")
        
    db.close()

if __name__ == "__main__":
    reconcile()

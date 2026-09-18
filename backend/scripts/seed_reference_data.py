"""
seed_reference_data.py
======================
Seeds all required reference / lookup data as specified in adroit_database_design.md.

Run from the `backend/` directory with the venv active:
    python scripts/seed_reference_data.py

Idempotent: safe to run multiple times — skips rows that already exist.
"""
import sys
import os

# Ensure the backend package is importable when run from the scripts/ directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import db.base FIRST — registers ALL models with SQLAlchemy's metadata
# so that ORM relationships can be resolved before any query runs.
import app.db.base  # noqa: F401

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.document import DocumentType
from app.models.leave_type import LeaveType
from app.models.asset import AssetCategory
from app.models.role import Role


# ─────────────────────────────────────────────────────────────────────────────
#  Reference data definitions
# ─────────────────────────────────────────────────────────────────────────────

DOCUMENT_TYPES = [
    # HR documents
    {"name": "Passport",                  "module": "HR",    "expiry_required": True,  "required": True,  "default_warning_threshold_days": 90},
    {"name": "Employment Visa",           "module": "HR",    "expiry_required": True,  "required": True,  "default_warning_threshold_days": 60},
    {"name": "Emirates ID",               "module": "HR",    "expiry_required": True,  "required": True,  "default_warning_threshold_days": 60},
    {"name": "Health Insurance",          "module": "HR",    "expiry_required": True,  "required": True,  "default_warning_threshold_days": 60},
    {"name": "Qualification Certificate", "module": "HR",    "expiry_required": False, "required": False, "default_warning_threshold_days": 60},
    # Fleet documents
    {"name": "Vehicle Registration",      "module": "FLEET", "expiry_required": True,  "required": True,  "default_warning_threshold_days": 60},
    {"name": "Motor Insurance",           "module": "FLEET", "expiry_required": True,  "required": True,  "default_warning_threshold_days": 60},
    {"name": "Safety Certificate",        "module": "FLEET", "expiry_required": True,  "required": True,  "default_warning_threshold_days": 60},
    {"name": "Inspection/Test Certificate","module": "FLEET","expiry_required": True,  "required": False, "default_warning_threshold_days": 60},
    {"name": "Permit",                    "module": "FLEET", "expiry_required": True,  "required": False, "default_warning_threshold_days": 60},
    {"name": "Other",                     "module": "FLEET", "expiry_required": False, "required": False, "default_warning_threshold_days": 60},
]

LEAVE_TYPES = [
    {"name": "Annual Leave",    "code": "ANNUAL",    "max_days_per_year": 30,  "requires_document": False},
    {"name": "Emergency Leave", "code": "EMERGENCY", "max_days_per_year": None, "requires_document": False},
    {"name": "Sick Leave",      "code": "SICK",      "max_days_per_year": 15,  "requires_document": True},
]

ASSET_CATEGORIES = [
    {"name": "Heavy Vehicle",            "code": "HEAVY_VEHICLE"},
    {"name": "Light Vehicle",            "code": "LIGHT_VEHICLE"},
    {"name": "Trailer",                  "code": "TRAILER"},
    {"name": "Heavy Machine/Equipment",  "code": "MACHINE"},
    {"name": "Other Company Vehicle",    "code": "OTHER"},
]

ROLES = [
    {"name": "Super Admin",    "description": "Full unrestricted access to all modules and settings"},
    {"name": "HR Manager",     "description": "Full access to HR module — employees, leave, documents"},
    {"name": "Fleet Manager",  "description": "Full access to Fleet module — assets, documents, fleet reports"},
    {"name": "HR Officer",     "description": "Read/write access to HR module with restricted admin functions"},
    {"name": "Fleet Officer",  "description": "Read/write access to Fleet module with restricted admin functions"},
    {"name": "Viewer",         "description": "Read-only access to all modules"},
]


# ─────────────────────────────────────────────────────────────────────────────
#  Seed helpers
# ─────────────────────────────────────────────────────────────────────────────

def seed_document_types(db: Session) -> None:
    inserted = 0
    for data in DOCUMENT_TYPES:
        exists = db.query(DocumentType).filter_by(name=data["name"]).first()
        if not exists:
            db.add(DocumentType(**data))
            inserted += 1
    db.commit()
    print(f"  [OK] document_types: {inserted} inserted, {len(DOCUMENT_TYPES) - inserted} already existed")


def seed_leave_types(db: Session) -> None:
    inserted = 0
    for data in LEAVE_TYPES:
        exists = db.query(LeaveType).filter_by(code=data["code"]).first()
        if not exists:
            db.add(LeaveType(**data))
            inserted += 1
    db.commit()
    print(f"  [OK] leave_types: {inserted} inserted, {len(LEAVE_TYPES) - inserted} already existed")


def seed_asset_categories(db: Session) -> None:
    inserted = 0
    for data in ASSET_CATEGORIES:
        exists = db.query(AssetCategory).filter_by(code=data["code"]).first()
        if not exists:
            db.add(AssetCategory(**data))
            inserted += 1
    db.commit()
    print(f"  [OK] asset_categories: {inserted} inserted, {len(ASSET_CATEGORIES) - inserted} already existed")


def seed_roles(db: Session) -> None:
    inserted = 0
    for data in ROLES:
        exists = db.query(Role).filter_by(name=data["name"]).first()
        if not exists:
            db.add(Role(**data))
            inserted += 1
    db.commit()
    print(f"  [OK] roles: {inserted} inserted, {len(ROLES) - inserted} already existed")


# ─────────────────────────────────────────────────────────────────────────────
#  Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    print("\n[SEED] Adroit -- Seeding reference data...")
    db: Session = SessionLocal()
    try:
        seed_document_types(db)
        seed_leave_types(db)
        seed_asset_categories(db)
        seed_roles(db)
        print("\n[OK] All reference data seeded successfully.\n")
    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

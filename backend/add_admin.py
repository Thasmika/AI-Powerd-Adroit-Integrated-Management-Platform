import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app.db.base  # Registers all models

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.models.role import Role

def create_admin():
    db = SessionLocal()
    email = "admin@adroit.com"
    password = "adminpassword"
    
    # Check if exists
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Patch existing admin to ensure is_superuser is set
        if not user.is_superuser:
            user.is_superuser = True
            db.commit()
            print(f"Patched existing admin user '{email}' — is_superuser set to True.")
        else:
            print(f"Admin user '{email}' already exists and is already a superuser.")
        db.close()
        sys.exit(0)
        
    hashed_password = get_password_hash(password)
    
    new_user = User(
        email=email,
        hashed_password=hashed_password,
        full_name="System Admin",
        is_active=True,
        is_superuser=True,
    )
    
    super_admin_role = db.query(Role).filter(Role.name == "Super Admin").first()
    if super_admin_role:
        new_user.roles.append(super_admin_role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"Created admin user: {email} with password: {password}")
    db.close()

if __name__ == "__main__":
    create_admin()

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.api.deps import get_db, get_current_active_user
from app.models.employee import Employee
from app.models.user import User
from app.models.role import Role

client = TestClient(app)

# We will override the dependencies for testing
def override_get_current_active_user():
    # Mock an admin user
    admin_role = Role(id=1, name="Super Admin")
    user = User(id=1, email="admin@adroit.com", is_active=True, is_superuser=True)
    user.roles = [admin_role]
    return user

app.dependency_overrides[get_current_active_user] = override_get_current_active_user

def test_read_employees(db_session: Session):
    response = client.get("/api/v1/employees/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_employee(db_session: Session):
    employee_data = {
        "first_name": "Test",
        "last_name": "User",
        "employee_id": "EMP-9999",
        "email": "test.user@adroit.com",
        "department_id": 1,
        "designation": "Tester",
        "status": "Active"
    }
    
    response = client.post("/api/v1/employees/", json=employee_data)
    if response.status_code == 200:
        assert response.json()["first_name"] == "Test"
        assert response.json()["employee_id"] == "EMP-9999"
    elif response.status_code == 400:
        # In case the DB wasn't cleanly wiped or it existed
        assert "already exists" in response.json()["detail"]
    else:
        # Fails if validation error
        assert response.status_code == 200

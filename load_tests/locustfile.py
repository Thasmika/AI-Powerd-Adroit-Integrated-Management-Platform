import os
from locust import HttpUser, task, between, events

# A simple user class that performs read-heavy tasks
class ReadHeavyUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Login before running tasks"""
        response = self.client.post("/api/v1/auth/login", data={
            "username": os.getenv("TEST_USER_EMAIL", "admin@adroit.ae"),
            "password": os.getenv("TEST_USER_PASSWORD", "admin123")
        })
        if response.status_code == 200:
            token = response.json().get("access_token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})
        else:
            print("Failed to login during load test start.")

    @task(3)
    def view_dashboard(self):
        """Simulate viewing the main dashboard"""
        # Replace with actual dashboard endpoints
        self.client.get("/api/v1/health")

    @task(2)
    def list_employees(self):
        """Simulate viewing the employee list"""
        # self.client.get("/api/v1/employees/")
        pass

    @task(2)
    def list_assets(self):
        """Simulate viewing the asset list"""
        # self.client.get("/api/v1/assets/")
        pass

# A user class that performs write-heavy tasks (less frequent)
class WriteHeavyUser(HttpUser):
    wait_time = between(3, 10)

    def on_start(self):
        """Login before running tasks"""
        response = self.client.post("/api/v1/auth/login", data={
            "username": os.getenv("TEST_USER_EMAIL", "admin@adroit.ae"),
            "password": os.getenv("TEST_USER_PASSWORD", "admin123")
        })
        if response.status_code == 200:
            token = response.json().get("access_token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task
    def create_leave_request(self):
        """Simulate creating a leave request"""
        # self.client.post("/api/v1/leaves/", json={"type": "Annual", "days": 5})
        pass

# A user class for AI queries
class AIQueryUser(HttpUser):
    wait_time = between(5, 15)

    def on_start(self):
        response = self.client.post("/api/v1/auth/login", data={
            "username": os.getenv("TEST_USER_EMAIL", "admin@adroit.ae"),
            "password": os.getenv("TEST_USER_PASSWORD", "admin123")
        })
        if response.status_code == 200:
            token = response.json().get("access_token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task
    def ask_ai(self):
        """Simulate asking the AI a question"""
        # self.client.post("/api/v1/ai/query", json={"query": "How many employees are on leave?"})
        pass

# Load Testing the Adroit Integrated Management Platform

This directory contains the load testing scripts using [Locust](https://locust.io/).

## Prerequisites
1. Python 3.10+
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Tests

To run the load test against a staging or local environment:

```bash
# Set your test user credentials
export TEST_USER_EMAIL="admin@adroit.ae"
export TEST_USER_PASSWORD="your_password"

# Run Locust (with web UI)
locust -f locustfile.py --host=http://localhost:8000
```
Then visit `http://localhost:8089` to start the test.

### Headless execution
To run a headless test targeting 50 concurrent users with a spawn rate of 5 users per second, for 2 minutes:

```bash
locust -f locustfile.py --host=http://your-staging-url.com --headless -u 50 -r 5 --run-time 2m
```

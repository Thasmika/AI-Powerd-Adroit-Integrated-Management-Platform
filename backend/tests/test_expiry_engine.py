import pytest
from datetime import date, timedelta
from app.services.expiry_engine import ExpiryEngine

def test_expiry_engine_evaluate_status():
    today = date.today()
    
    # Test EXPIRED
    expired_date = today - timedelta(days=1)
    assert ExpiryEngine.evaluate_status(expired_date, 60) == "EXPIRED"
    
    # Test EXACTLY TODAY
    assert ExpiryEngine.evaluate_status(today, 60) == "URGENT"
    
    # Test URGENT (<= 30 days)
    urgent_date = today + timedelta(days=30)
    assert ExpiryEngine.evaluate_status(urgent_date, 60) == "URGENT"
    
    urgent_date_mid = today + timedelta(days=15)
    assert ExpiryEngine.evaluate_status(urgent_date_mid, 60) == "URGENT"
    
    # Test RENEWAL DUE (31 to threshold)
    renewal_due_date = today + timedelta(days=31)
    assert ExpiryEngine.evaluate_status(renewal_due_date, 60) == "RENEWAL DUE"
    
    renewal_due_date_end = today + timedelta(days=60)
    assert ExpiryEngine.evaluate_status(renewal_due_date_end, 60) == "RENEWAL DUE"
    
    # Test VALID (> threshold)
    valid_date = today + timedelta(days=61)
    assert ExpiryEngine.evaluate_status(valid_date, 60) == "VALID"
    
    # Test NO EXPIRY DATE
    assert ExpiryEngine.evaluate_status(None, 60) == "ON FILE"

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Any, List

from app.api.deps import get_db

router = APIRouter()

@router.get("/global")
def search_global(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db)
) -> Any:
    """
    Perform a global search across employees, vehicles, and documents.
    """
    # This is a stub implementation.
    # In a full production implementation, you would query the Employee, Vehicle,
    # and Document tables using ORM filters and return unified results.
    
    results = [
        {"type": "employee", "id": "EMP-294", "name": "Sarah Jenkins", "match": "Name match"},
        {"type": "vehicle", "id": "VH-0108", "name": "Ford Transit", "match": "Vehicle ID match"},
    ]
    
    # Filter dummy results by query
    filtered = [r for r in results if q.lower() in r["name"].lower() or q.lower() in r["id"].lower()]
    
    return {"results": filtered, "query": q}

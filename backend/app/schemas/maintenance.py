from typing import Optional
from pydantic import BaseModel
from datetime import date

class MaintenanceLogBase(BaseModel):
    service: str
    provider: Optional[str] = None
    date: date
    cost: Optional[float] = None
    status: Optional[str] = "Completed"
    invoice_file_id: Optional[int] = None

class MaintenanceLogCreate(MaintenanceLogBase):
    asset_id: int

class MaintenanceLogUpdate(BaseModel):
    service: Optional[str] = None
    provider: Optional[str] = None
    date: Optional[date] = None
    cost: Optional[float] = None
    status: Optional[str] = None
    invoice_file_id: Optional[int] = None

class MaintenanceLog(MaintenanceLogBase):
    id: int
    asset_id: int

    class Config:
        orm_mode = True

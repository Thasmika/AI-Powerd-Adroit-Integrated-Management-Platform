from typing import Optional
from datetime import date
from pydantic import BaseModel

class AssetBase(BaseModel):
    fleet_number: Optional[str] = None
    registration_number: Optional[str] = None
    
    category: str
    make_model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    chassis_vin: Optional[str] = None
    engine_number: Optional[str] = None
    
    total_mileage: Optional[int] = None
    fuel_efficiency: Optional[float] = None
    next_service_mileage: Optional[int] = None
    engine_hours: Optional[int] = None
    
    owning_company_id: Optional[int] = None
    department_id: Optional[int] = None
    location_id: Optional[int] = None
    
    operational_status: str = "Active"
    responsible_officer_id: Optional[int] = None
    remarks: Optional[str] = None
    photo_url: Optional[str] = None
    is_active: bool = True

class AssetCreate(AssetBase):
    pass

class AssetUpdate(AssetBase):
    fleet_number: Optional[str] = None
    category: Optional[str] = None

class AssetInDBBase(AssetBase):
    id: int

    class Config:
        orm_mode = True

class Asset(AssetInDBBase):
    pass

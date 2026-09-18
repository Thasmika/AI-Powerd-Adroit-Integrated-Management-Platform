"""
Fleet — Asset Categories (reference data) and Assets.

AssetCategory : Reference table — Heavy Vehicle, Light Vehicle, Trailer, etc.
Asset         : Physical vehicle / equipment record.

The `category` string column is kept for backwards compatibility.
`category_id` FK is the preferred reference going forward.
"""
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class AssetCategory(Base):
    """
    Reference table for fleet asset categories.

    Seeded values: Heavy Vehicle, Light Vehicle, Trailer,
                   Heavy Machine/Equipment, Other Company Vehicle.
    """
    __tablename__ = "asset_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, unique=True, nullable=False)   # HEAVY_VEHICLE | LIGHT_VEHICLE | TRAILER | MACHINE | OTHER
    is_active = Column(Boolean, default=True, nullable=False)

    assets = relationship("Asset", back_populates="asset_category", lazy="dynamic")


class Asset(Base):
    """
    Physical asset (vehicle, trailer, machine or equipment).

    fleet_number is the unique business identifier (e.g. VH-0108).
    """
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    fleet_number = Column(String, unique=True, index=True, nullable=False)       # e.g., VH-0108
    registration_number = Column(String, index=True, nullable=True)

    # Asset Details
    category = Column(String, nullable=True)                                      # Legacy string — kept for compatibility
    category_id = Column(Integer, ForeignKey("asset_categories.id"), nullable=True, index=True)
    make_model = Column(String)
    year = Column(Integer)
    color = Column(String)
    chassis_vin = Column(String, index=True)
    engine_number = Column(String)
    photo_url = Column(String, nullable=True)

    # Overview Metrics
    total_mileage = Column(Integer, nullable=True)
    fuel_efficiency = Column(Float, nullable=True)
    next_service_mileage = Column(Integer, nullable=True)
    engine_hours = Column(Integer, nullable=True)

    # Ownership & Operation
    owning_company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)

    operational_status = Column(String, default="Active")  # Active, Inactive, Maintenance, Disposed
    responsible_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    remarks = Column(String, nullable=True)

    # Metadata
    is_active = Column(Boolean, default=True)

    # Relationship Definitions
    asset_category = relationship("AssetCategory", back_populates="assets")
    owning_company = relationship("Company")
    department = relationship("Department")
    location = relationship("Location")
    responsible_officer = relationship("User", foreign_keys=[responsible_officer_id])

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    service = Column(String, nullable=False)
    provider = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    cost = Column(Float, nullable=True)
    status = Column(String, default="Completed")
    invoice_file_id = Column(Integer, ForeignKey("document_files.id"), nullable=True)
    
    asset = relationship("Asset")
    invoice_file = relationship("DocumentFile")


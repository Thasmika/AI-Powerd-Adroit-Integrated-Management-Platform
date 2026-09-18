from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    legal_name = Column(String)
    is_active = Column(Boolean, default=True)
    
    departments = relationship("Department", back_populates="company")
    locations = relationship("Location", back_populates="company")

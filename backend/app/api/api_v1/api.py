from fastapi import APIRouter
from app.api.api_v1.endpoints import login, employees, leaves, assets, search, ai, dashboard

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(leaves.router, prefix="/leaves", tags=["leaves"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])

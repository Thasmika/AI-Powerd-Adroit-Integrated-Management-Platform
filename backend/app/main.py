from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.middleware.metrics import PrometheusMiddleware, metrics_endpoint
import app.db.base  # Import all models to ensure SQLAlchemy registry is fully loaded
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
import logging

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error(f"Validation error: {exc.errors()} body: {exc.body}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Prometheus metrics middleware
app.add_middleware(PrometheusMiddleware)

# Expose metrics endpoint
app.add_route("/metrics", metrics_endpoint, methods=["GET"])

@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
def health_check():
    return {"status": "ok"}

app.include_router(api_router, prefix=settings.API_V1_STR)

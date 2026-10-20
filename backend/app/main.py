import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure the backend directory is in sys.path for versatile execution environments
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from .core.config import settings
from .routers import (
    forecast_runs_router,
    regions_router,
    confidence_map_router,
    verification_router,
    data_status_router,
    cases_models_router,
    exports_router,
)

# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_TITLE,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configure CORS for local Next.js frontend and production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Preserved Health Check Endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """
    Application health check endpoint.
    Preserved exactly as required by the ForecastGuard specifications.
    """
    return {
        "status": "healthy",
        "project": "ForecastGuard"
    }


# Root overview route
@app.get("/", tags=["Overview"])
def root_overview():
    """
    API welcome and navigation summary.
    """
    return {
        "project": "ForecastGuard — Forecast Bust Detection (SIH26079)",
        "status": "online",
        "data_mode": settings.DATA_MODE,
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
        "health_check": "/health",
        "endpoints": {
            "forecast_runs": f"{settings.API_V1_PREFIX}/forecast-runs",
            "forecast_runs_latest": f"{settings.API_V1_PREFIX}/forecast-runs/latest",
            "regions": f"{settings.API_V1_PREFIX}/regions",
            "confidence_map": f"{settings.API_V1_PREFIX}/confidence-map",
            "verification_summary": f"{settings.API_V1_PREFIX}/verification/summary",
            "verification_series": f"{settings.API_V1_PREFIX}/verification/series",
            "data_status": f"{settings.API_V1_PREFIX}/data-status",
            "cases": f"{settings.API_V1_PREFIX}/cases",
            "models": f"{settings.API_V1_PREFIX}/models",
            "exports_regions_csv": f"{settings.API_V1_PREFIX}/exports/regions.csv",
        }
    }


# Include v1 feature routers
app.include_router(forecast_runs_router, prefix=settings.API_V1_PREFIX)
app.include_router(regions_router, prefix=settings.API_V1_PREFIX)
app.include_router(confidence_map_router, prefix=settings.API_V1_PREFIX)
app.include_router(verification_router, prefix=settings.API_V1_PREFIX)
app.include_router(data_status_router, prefix=settings.API_V1_PREFIX)
app.include_router(cases_models_router, prefix=settings.API_V1_PREFIX)
app.include_router(exports_router, prefix=settings.API_V1_PREFIX)

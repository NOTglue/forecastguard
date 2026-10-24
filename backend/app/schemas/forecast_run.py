from datetime import datetime
from typing import List, Optional
from pydantic import Field
from .common import BaseDemoModel


class ForecastRun(BaseDemoModel):
    """Represents an operational or demonstration numerical weather prediction run."""
    run_id: str = Field(..., description="Unique run identifier, e.g. RUN-20261020-00Z")
    model_name: str = Field(..., description="Numerical weather model name, e.g. GFS-0.25deg-Ensemble")
    model_version: str = Field(..., description="Model version tag, e.g. v4.2-demo")
    initialization_time: datetime = Field(..., description="Timezone-aware initialization timestamp")
    forecast_horizon_hours: int = Field(..., ge=1, le=720, description="Forecast lead time horizon in hours")
    status: str = Field(..., description="Status of the run: ACTIVE, COMPLETED, or ARCHIVED")
    data_source: str = Field(..., description="Upstream NWP data feed provider or source description")
    cycle_regime: str = Field(..., description="Synoptic weather regime during cycle initialization")
    total_regions_monitored: int = Field(..., ge=0, description="Total geographic sectors or radar zones monitored")
    high_risk_regions_count: int = Field(..., ge=0, description="Number of sectors with bust risk exceeding critical threshold")
    notes: Optional[str] = Field(None, description="Operational or diagnostic notes")


class ForecastRunsListResponse(BaseDemoModel):
    """Response envelope for list of forecast runs."""
    total: int = Field(..., description="Total count of forecast runs returned")
    runs: List[ForecastRun] = Field(..., description="Collection of forecast run records")

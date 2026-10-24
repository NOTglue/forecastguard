from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field
from .common import BaseDemoModel


class UpstreamSource(BaseModel):
    """Details of an upstream meteorological input source."""
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(..., description="Provider or system name")
    feed_type: str = Field(..., description="NWP_FORECAST, GRIDDED_OBSERVATION, or RADAR_MOCK")
    status: str = Field(..., description="Operating status, e.g. SYNTHETIC_DEMO, OPERATIONAL, OFFLINE")
    spatial_resolution: str = Field(..., description="Spatial resolution (e.g. 0.25 degree, 4km)")
    update_frequency: str = Field(..., description="Update cadence (e.g. 6-hourly, daily)")
    description: str = Field(..., description="Brief summary of source usage")


class DataStatusResponse(BaseDemoModel):
    """Comprehensive data provenance and freshness status."""
    is_real_data: bool = Field(
        default=False,
        description="Whether the system is currently processing real-world operational weather data"
    )
    is_demonstration: bool = Field(
        default=True,
        description="Indicates synthetic demonstration mode is active"
    )
    data_source: str = Field(..., description="Primary data source label")
    active_forecast_run_id: str = Field(..., description="Latest active run identifier")
    last_updated: datetime = Field(..., description="Timezone-aware timestamp of the last data refresh")
    data_freshness_seconds: int = Field(..., ge=0, description="Elapsed seconds since last data refresh")
    refresh_cadence: str = Field(..., description="Expected refresh cycle interval")
    upstream_sources: List[UpstreamSource] = Field(..., description="Status breakdown of upstream data feeds")
    system_notice: str = Field(..., description="Guidance on integrating real NWP feeds and live radars")

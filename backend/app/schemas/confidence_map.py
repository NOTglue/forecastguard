from datetime import datetime
from typing import Any, Dict, List
from pydantic import BaseModel, ConfigDict, Field
from .common import BaseDemoModel
from .region import ExceedanceProbabilities


class ConfidenceMapRegion(BaseModel):
    """Regional radar sector payload formatted for interactive geospatial maps."""
    model_config = ConfigDict(populate_by_name=True)

    region_id: str = Field(..., description="Unique zone identifier (e.g. ODISHA-07)")
    name: str = Field(..., description="Human-readable sector name")
    coordinates: List[float] = Field(..., description="[Latitude, Longitude] pair")
    radius_meters: int = Field(..., description="Radar visualization coverage radius in meters")
    confidence_value: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence in NWP forecast accuracy (0.0 to 1.0)"
    )
    bust_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Bust probability (0.0 to 1.0)"
    )
    risk_level: str = Field(..., description="Risk tier: LOW, MODERATE, HIGH, SEVERE")
    raw_rain_mm: float = Field(..., ge=0.0, description="Raw NWP forecasted precipitation (mm)")
    corrected_rain_mm: float = Field(..., ge=0.0, description="AI-corrected precipitation (mm)")
    bias_shift_mm: float = Field(..., description="Correction shift (corrected - raw) in mm")
    exceedance_probabilities: ExceedanceProbabilities = Field(..., description="Rainfall threshold exceedances")
    data_status: str = Field(..., description="Data status: SYNTHETIC_DEMO, VERIFIED, or REALTIME")
    diagnostic_note: str = Field(..., description="Quick diagnostic annotation for map tooltips")


class ConfidenceMapResponse(BaseDemoModel):
    """Response envelope for confidence map geospatial endpoint."""
    forecast_run_id: str = Field(..., description="Active forecast run identifier")
    generated_at: datetime = Field(..., description="Timezone-aware timestamp of map layer generation")
    total_regions: int = Field(..., description="Total sectors included in map layer")
    regions: List[ConfidenceMapRegion] = Field(..., description="List of regional confidence map zones")
    geojson: Dict[str, Any] = Field(..., description="Standard GeoJSON FeatureCollection representation")
    legend_reference: Dict[str, str] = Field(..., description="Mapping of risk levels to suggested hex color codes")

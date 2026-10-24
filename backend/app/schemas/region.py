from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from .common import BaseDemoModel


class ExceedanceProbabilities(BaseModel):
    """Heavy rainfall exceedance probabilities based on IMD classification thresholds."""
    model_config = ConfigDict(populate_by_name=True)
    
    heavy_rain_gt_64_5mm: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability of 24h precipitation exceeding 64.5mm (Heavy Rain threshold)"
    )
    very_heavy_rain_gt_115_5mm: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability of 24h precipitation exceeding 115.5mm (Very Heavy Rain threshold)"
    )
    extremely_heavy_rain_gt_204_5mm: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability of 24h precipitation exceeding 204.5mm (Extremely Heavy Rain threshold)"
    )


class Region(BaseDemoModel):
    """Geographic sector or radar zone definition."""
    region_id: str = Field(..., description="Unique zone identifier (e.g. ODISHA-07)")
    name: str = Field(..., description="Human-readable sector name (e.g. NORTH BAY // ODISHA)")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Centroid latitude")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Centroid longitude")
    radar_radius_meters: int = Field(..., ge=1000, description="Radar coverage radius in meters")
    synoptic_regime: str = Field(..., description="Active synoptic monsoon regime")
    climate_zone: str = Field(..., description="Regional climate classification")


class RegionsListResponse(BaseDemoModel):
    """Response envelope for list of monitored regions."""
    total: int = Field(..., description="Total monitored regions")
    regions: List[Region] = Field(..., description="Collection of regions")


class RegionRisk(BaseDemoModel):
    """Regional forecast bust risk assessment and bias delta metrics."""
    region_id: str = Field(..., description="Unique zone identifier")
    region_name: str = Field(..., description="Human-readable sector name")
    forecast_run_id: str = Field(..., description="Forecast run associated with this assessment")
    forecast_horizon_hours: int = Field(..., ge=1, description="Lead time horizon in hours")
    bust_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Probability that the forecast will bust (calibrated demo metric, 0.0 to 1.0)"
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence in raw numerical model (inverse bust risk indicator, 0.0 to 1.0)"
    )
    risk_level: str = Field(..., description="Risk category: LOW, MODERATE, HIGH, or SEVERE")
    raw_precipitation_mm: float = Field(..., ge=0.0, description="Raw uncorrected NWP precipitation prediction (mm)")
    corrected_precipitation_mm: float = Field(..., ge=0.0, description="AI bias-corrected precipitation prediction (mm)")
    bias_delta_mm: float = Field(..., description="Correction shift delta in mm: (corrected - raw)")
    exceedance_probabilities: ExceedanceProbabilities = Field(..., description="Rainfall threshold exceedance probabilities")
    diagnostic_note: str = Field(..., description="Diagnostic observation note explaining the anomaly")
    computation_method: str = Field(..., description="Explanation of computed vs demonstrated parameters")
    updated_at: datetime = Field(..., description="Timezone-aware timestamp of risk calculation")


class ExplanationFactor(BaseModel):
    """A contributing meteorological or numerical factor toward forecast bust risk."""
    factor_name: str = Field(..., description="Name of the physical or algorithmic factor")
    contribution_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Relative contribution weight to the overall bust probability (0.0 to 1.0)"
    )
    direction: str = Field(..., description="OVERESTIMATION_BIAS, UNDERESTIMATION_BIAS, or POSITION_ERROR")
    description: str = Field(..., description="Physical meteorological explanation of this factor")


class RegionExplanation(BaseDemoModel):
    """In-depth diagnostic explanation for forecast bust risk in a specific region."""
    region_id: str = Field(..., description="Unique zone identifier")
    region_name: str = Field(..., description="Human-readable sector name")
    bust_risk_level: str = Field(..., description="Risk category: LOW, MODERATE, HIGH, or SEVERE")
    bust_probability: float = Field(..., ge=0.0, le=1.0, description="Calculated probability of forecast bust")
    primary_driver: str = Field(..., description="Principal driver of forecast instability or bias")
    summary: str = Field(..., description="Executive meteorological summary")
    key_factors: List[ExplanationFactor] = Field(..., description="Breakdown of physical and algorithmic contributing factors")
    anomalies_detected: List[str] = Field(..., description="List of observed anomaly triggers")
    recommended_action: str = Field(..., description="Operational guidance for meteorologists or automated downstream systems")
    disclaimer: str = Field(..., description="Transparency statement regarding demo data status")

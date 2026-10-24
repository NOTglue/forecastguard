from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from .common import BaseDemoModel


class VerificationMetrics(BaseModel):
    """Aggregate accuracy and bust verification metrics."""
    model_config = ConfigDict(populate_by_name=True)

    raw_nwp_mae_mm: float = Field(..., description="Mean Absolute Error of raw NWP precipitation against observations (mm)")
    ai_corrected_mae_mm: float = Field(..., description="Mean Absolute Error of AI-corrected forecast against observations (mm)")
    raw_nwp_rmse_mm: float = Field(..., description="Root Mean Squared Error of raw NWP (mm)")
    ai_corrected_rmse_mm: float = Field(..., description="Root Mean Squared Error of AI-corrected forecast (mm)")
    bust_detection_precision: float = Field(..., ge=0.0, le=1.0, description="Precision of bust detection classifier (0.0 to 1.0)")
    bust_detection_recall: float = Field(..., ge=0.0, le=1.0, description="Recall/Hit-rate of bust detection classifier (0.0 to 1.0)")
    critical_success_index: float = Field(..., ge=0.0, le=1.0, description="Threat Score / Critical Success Index (0.0 to 1.0)")
    brier_score: float = Field(..., ge=0.0, le=1.0, description="Brier score for probabilistic bust prediction (0.0 to 1.0)")


class VerificationSummaryResponse(BaseDemoModel):
    """Summary metrics response for forecast verification."""
    is_simulated: bool = Field(
        default=True,
        description="Flag indicating that verification metrics are synthetic demonstration values"
    )
    verification_status: str = Field(
        ...,
        description="Status of verification dataset, e.g. SYNTHETIC_DEMO_BENCHMARK or UNAVAILABLE_FOR_OPERATIONAL_USE"
    )
    evaluation_dataset: str = Field(..., description="Description of the reference evaluation dataset")
    sample_size_events: int = Field(..., ge=0, description="Total evaluation sample points/events")
    disclaimer: str = Field(..., description="Explicit disclaimer explaining demonstration status")
    metrics: VerificationMetrics = Field(..., description="Evaluated verification scores")


class VerificationSeriesPoint(BaseModel):
    """Daily forecast verification timeline node (forecast vs observation)."""
    model_config = ConfigDict(populate_by_name=True)

    day: int = Field(..., ge=1, le=30, description="Forecast lead day index (e.g. 1 to 10)")
    lead_time_hours: int = Field(..., description="Cumulative lead time hours (e.g. 24, 48, ...)")
    regime: str = Field(..., description="Synoptic regime identifier (e.g. ACTIVE_TROUGH)")
    raw_forecast_mm: float = Field(..., ge=0.0, description="Raw NWP forecasted precipitation in mm")
    ai_corrected_forecast_mm: float = Field(..., ge=0.0, description="AI-corrected precipitation forecast in mm")
    observed_precipitation_mm: Optional[float] = Field(
        None,
        description="Observed precipitation from gridded gauges/radars; null if lead day is in future"
    )
    bust_risk_probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Forecast bust risk probability (0.0 to 1.0)"
    )
    observation_status: str = Field(
        ...,
        description="Status: VERIFIED_DEMO_RECORD or UNAVAILABLE_FUTURE_LEAD"
    )
    is_simulated: bool = Field(
        default=True,
        description="Explicit flag declaring whether this point uses simulated demo data"
    )


class VerificationSeriesResponse(BaseDemoModel):
    """Response envelope for verification time-series timeline."""
    forecast_run_id: str = Field(..., description="Associated forecast run ID")
    is_simulated: bool = Field(
        default=True,
        description="True for demonstration/synthetic series"
    )
    total_points: int = Field(..., description="Total points in the verification horizon")
    verified_points_count: int = Field(..., description="Number of historical points with observations")
    unverified_points_count: int = Field(..., description="Number of future lead points without observations")
    disclaimer: str = Field(..., description="Transparency notice regarding simulation/demo nature")
    series: List[VerificationSeriesPoint] = Field(..., description="Time series verification points")

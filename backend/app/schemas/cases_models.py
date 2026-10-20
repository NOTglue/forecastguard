from typing import List
from pydantic import BaseModel, ConfigDict, Field
from .common import BaseDemoModel


class BustCase(BaseDemoModel):
    """Historical or synthetic case study of a major numerical weather forecast bust."""
    case_id: str = Field(..., description="Unique case study identifier")
    title: str = Field(..., description="Case study descriptive title")
    event_date: str = Field(..., description="Date or time window of the event (YYYY-MM-DD)")
    region: str = Field(..., description="Geographical sector or basin affected")
    synoptic_situation: str = Field(..., description="Synoptic weather regime and meteorological conditions")
    raw_model_prediction: str = Field(..., description="What the raw numerical model predicted")
    observed_outcome: str = Field(..., description="What actually occurred in meteorological observations")
    forecast_error_magnitude: str = Field(..., description="Quantitative error delta (e.g. +140mm bias, 180km track error)")
    failure_mechanism: str = Field(..., description="Root cause physical or computational failure mechanism")
    lessons_learned: str = Field(..., description="Operational insights and mitigation via ForecastGuard AI")


class CasesListResponse(BaseDemoModel):
    """Envelope response for forecast bust case studies."""
    total: int = Field(..., description="Total case studies available")
    cases: List[BustCase] = Field(..., description="List of forecast bust case studies")


class ModelMetadata(BaseDemoModel):
    """Metadata describing a forecast bust detection or bias-correction model."""
    model_id: str = Field(..., description="Model identifier")
    name: str = Field(..., description="Human-readable model name")
    version: str = Field(..., description="Semantic version of model weights/architecture")
    status: str = Field(..., description="Lifecycle status: PROTOTYPE_DEMO, VALIDATION, OPERATIONAL")
    architecture: str = Field(..., description="Underlying machine learning architecture")
    target_variable: str = Field(..., description="Prediction target (e.g. Binary Bust Probability, Precipitation Delta)")
    input_features: List[str] = Field(..., description="Key meteorological and NWP features utilized")
    forecast_horizons: List[str] = Field(..., description="Supported lead times (e.g. 24h, 48h, 72h, 120h, 240h)")
    baseline_comparison: str = Field(..., description="Baseline numerical model compared against")
    is_scientifically_calibrated: bool = Field(
        default=False,
        description="Whether model is calibrated against multi-year reanalysis data (False for demo)"
    )
    disclaimer: str = Field(..., description="Scientific disclaimer regarding demo model metadata")


class ModelsListResponse(BaseDemoModel):
    """Envelope response for available models metadata."""
    total: int = Field(..., description="Total models documented")
    models: List[ModelMetadata] = Field(..., description="Collection of model metadata records")

from fastapi import APIRouter
from ..schemas.verification import (
    VerificationSummaryResponse,
    VerificationSeriesResponse,
)
from ..services.verification_service import verification_service

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.get(
    "/summary",
    response_model=VerificationSummaryResponse,
    summary="Get Forecast Verification Summary Metrics",
    description=(
        "Retrieve aggregate evaluation metrics (MAE, RMSE, Hit-Rate/Recall, CSI, Brier Score). "
        "Explicitly flags synthetic simulation status and dataset provenance."
    )
)
def get_verification_summary() -> VerificationSummaryResponse:
    return verification_service.get_summary()


@router.get(
    "/series",
    response_model=VerificationSeriesResponse,
    summary="Get 10-Day Verification Time Series",
    description=(
        "Retrieve daily comparison waveform data (Raw Forecast, AI Corrected, IMD Gridded Observations). "
        "Points for future lead days are marked UNAVAILABLE_FUTURE_LEAD as observations do not yet exist."
    )
)
def get_verification_series() -> VerificationSeriesResponse:
    return verification_service.get_series()

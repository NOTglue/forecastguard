from typing import Optional
from fastapi import APIRouter, Query, HTTPException, status
from ..schemas.forecast_run import ForecastRun, ForecastRunsListResponse
from ..services.forecast_service import forecast_service

router = APIRouter(prefix="/forecast-runs", tags=["Forecast Runs"])


@router.get(
    "/latest",
    response_model=ForecastRun,
    summary="Get Latest Forecast Run",
    description="Retrieve metadata for the most recently initialized active numerical weather prediction run."
)
def get_latest_forecast_run() -> ForecastRun:
    run = forecast_service.get_latest_run()
    return run


@router.get(
    "",
    response_model=ForecastRunsListResponse,
    summary="List Forecast Runs",
    description="Retrieve a paginated list of forecast run identifiers, initialization times, and operational statuses."
)
def list_forecast_runs(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Optional filter by status (ACTIVE, COMPLETED, ARCHIVED)"
    ),
    limit: int = Query(50, ge=1, le=100, description="Max runs to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
) -> ForecastRunsListResponse:
    return forecast_service.list_runs(status=status_filter, limit=limit, offset=offset)


@router.get(
    "/{run_id}",
    response_model=ForecastRun,
    summary="Get Forecast Run By ID",
    description="Retrieve metadata for a specific forecast run by its unique identifier."
)
def get_forecast_run_by_id(run_id: str) -> ForecastRun:
    run = forecast_service.get_run_by_id(run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Forecast run '{run_id}' not found."
        )
    return run

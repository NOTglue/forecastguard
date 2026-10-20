from typing import Optional, List
from ..data.demo_store import DEMO_FORECAST_RUNS
from ..schemas.forecast_run import ForecastRun, ForecastRunsListResponse


class ForecastService:
    """Service handling numerical weather prediction forecast runs."""

    @staticmethod
    def list_runs(
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> ForecastRunsListResponse:
        filtered = DEMO_FORECAST_RUNS
        if status:
            filtered = [r for r in filtered if r["status"].upper() == status.upper()]
        
        total = len(filtered)
        paginated = filtered[offset : offset + limit]
        runs = [ForecastRun(**r) for r in paginated]
        return ForecastRunsListResponse(total=total, runs=runs)

    @staticmethod
    def get_latest_run() -> ForecastRun:
        # Latest active run is the first item by convention in our store
        active_runs = [r for r in DEMO_FORECAST_RUNS if r["status"] == "ACTIVE"]
        chosen = active_runs[0] if active_runs else DEMO_FORECAST_RUNS[0]
        return ForecastRun(**chosen)

    @staticmethod
    def get_run_by_id(run_id: str) -> Optional[ForecastRun]:
        for r in DEMO_FORECAST_RUNS:
            if r["run_id"].upper() == run_id.upper():
                return ForecastRun(**r)
        return None


forecast_service = ForecastService()

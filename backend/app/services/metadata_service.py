from datetime import datetime, timezone
from typing import List
from ..data.demo_store import (
    DEMO_UPSTREAM_SOURCES,
    DEMO_CASES,
    DEMO_MODELS,
    DEMO_FORECAST_RUNS,
    CYCLE_TIME,
)
from ..schemas.data_status import UpstreamSource, DataStatusResponse
from ..schemas.cases_models import (
    BustCase,
    CasesListResponse,
    ModelMetadata,
    ModelsListResponse,
)


class MetadataService:
    """Service providing data provenance status, historical case studies, and model metadata."""

    @staticmethod
    def get_data_status() -> DataStatusResponse:
        now = datetime.now(timezone.utc)
        freshness_secs = int((now - CYCLE_TIME).total_seconds())
        if freshness_secs < 0:
            freshness_secs = 0

        upstream_objs = [UpstreamSource(**s) for s in DEMO_UPSTREAM_SOURCES]
        active_run_id = DEMO_FORECAST_RUNS[0]["run_id"]

        return DataStatusResponse(
            data_mode="DEMO",
            is_real_data=False,
            is_demonstration=True,
            data_source="Synthetic NWP Demonstration Feed (Simulated GFS 0.25° + IMD Gridded Observations)",
            active_forecast_run_id=active_run_id,
            last_updated=CYCLE_TIME,
            data_freshness_seconds=freshness_secs,
            refresh_cadence="6-Hourly Synthetic Cycle (00Z, 06Z, 12Z, 18Z)",
            upstream_sources=upstream_objs,
            system_notice=(
                "ForecastGuard is operating in DEMONSTRATION mode. Simulated inputs allow full end-to-end "
                "evaluation of frontend radar dashboards, APIs, and alerts without requiring immediate "
                "operational credentials for IMD or ECMWF data feeds."
            ),
        )

    @staticmethod
    def list_cases() -> CasesListResponse:
        case_objs: List[BustCase] = [BustCase(**c) for c in DEMO_CASES]
        return CasesListResponse(
            data_mode="DEMO",
            total=len(case_objs),
            cases=case_objs,
        )

    @staticmethod
    def list_models() -> ModelsListResponse:
        model_objs: List[ModelMetadata] = [ModelMetadata(**m) for m in DEMO_MODELS]
        return ModelsListResponse(
            data_mode="DEMO",
            total=len(model_objs),
            models=model_objs,
        )


metadata_service = MetadataService()

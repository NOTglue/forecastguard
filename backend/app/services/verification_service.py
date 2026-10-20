from typing import List
from ..data.demo_store import (
    DEMO_VERIFICATION_SUMMARY,
    DEMO_VERIFICATION_SERIES,
    DEMO_FORECAST_RUNS,
)
from ..schemas.verification import (
    VerificationSummaryResponse,
    VerificationMetrics,
    VerificationSeriesResponse,
    VerificationSeriesPoint,
)


class VerificationService:
    """Service providing model verification metrics and lead-time series tracking."""

    @staticmethod
    def get_summary() -> VerificationSummaryResponse:
        summary_raw = DEMO_VERIFICATION_SUMMARY
        metrics_obj = VerificationMetrics(**summary_raw["metrics"])
        return VerificationSummaryResponse(
            data_mode=summary_raw.get("data_mode", "DEMO"),
            is_simulated=summary_raw.get("is_simulated", True),
            verification_status=summary_raw["verification_status"],
            evaluation_dataset=summary_raw["evaluation_dataset"],
            sample_size_events=summary_raw["sample_size_events"],
            disclaimer=summary_raw["disclaimer"],
            metrics=metrics_obj,
        )

    @staticmethod
    def get_series() -> VerificationSeriesResponse:
        latest_run = DEMO_FORECAST_RUNS[0]["run_id"]
        points: List[VerificationSeriesPoint] = [
            VerificationSeriesPoint(**p) for p in DEMO_VERIFICATION_SERIES
        ]

        verified_count = sum(1 for p in points if p.observed_precipitation_mm is not None)
        unverified_count = len(points) - verified_count

        return VerificationSeriesResponse(
            data_mode="DEMO",
            forecast_run_id=latest_run,
            is_simulated=True,
            total_points=len(points),
            verified_points_count=verified_count,
            unverified_points_count=unverified_count,
            disclaimer=(
                "Demonstration Series Notice: Historical points (Days 1-5) include synthetic observation comparisons; "
                "Future lead points (Days 6-10) marked UNAVAILABLE_FUTURE_LEAD as observations cannot exist in advance."
            ),
            series=points,
        )


verification_service = VerificationService()

import io
import csv
from typing import Optional, List
from datetime import datetime, timezone
from ..data.demo_store import DEMO_REGIONS, DEMO_FORECAST_RUNS
from ..schemas.region import (
    Region,
    RegionsListResponse,
    RegionRisk,
    ExceedanceProbabilities,
    RegionExplanation,
    ExplanationFactor,
)


class RegionService:
    """Service handling regional sectors, risk metrics, explanations, and CSV export."""

    @staticmethod
    def list_regions() -> RegionsListResponse:
        regions: List[Region] = []
        for r in DEMO_REGIONS.values():
            regions.append(
                Region(
                    region_id=r["region_id"],
                    name=r["name"],
                    latitude=r["latitude"],
                    longitude=r["longitude"],
                    radar_radius_meters=r["radar_radius_meters"],
                    synoptic_regime=r["synoptic_regime"],
                    climate_zone=r["climate_zone"],
                    data_mode=r.get("data_mode", "DEMO"),
                )
            )
        return RegionsListResponse(total=len(regions), regions=regions)

    @staticmethod
    def get_region(region_id: str) -> Optional[Region]:
        key = region_id.upper().strip()
        r = DEMO_REGIONS.get(key)
        if not r:
            return None
        return Region(
            region_id=r["region_id"],
            name=r["name"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            radar_radius_meters=r["radar_radius_meters"],
            synoptic_regime=r["synoptic_regime"],
            climate_zone=r["climate_zone"],
            data_mode=r.get("data_mode", "DEMO"),
        )

    @staticmethod
    def get_region_risk(region_id: str) -> Optional[RegionRisk]:
        key = region_id.upper().strip()
        r = DEMO_REGIONS.get(key)
        if not r:
            return None

        raw = float(r["raw_precipitation_mm"])
        corr = float(r["corrected_precipitation_mm"])
        # Computed bias delta
        bias_delta = round(corr - raw, 1)

        latest_run = DEMO_FORECAST_RUNS[0]["run_id"]

        exceedance = ExceedanceProbabilities(
            heavy_rain_gt_64_5mm=r["exceedance_probabilities"]["heavy_rain_gt_64_5mm"],
            very_heavy_rain_gt_115_5mm=r["exceedance_probabilities"]["very_heavy_rain_gt_115_5mm"],
            extremely_heavy_rain_gt_204_5mm=r["exceedance_probabilities"]["extremely_heavy_rain_gt_204_5mm"],
        )

        return RegionRisk(
            region_id=r["region_id"],
            region_name=r["name"],
            data_mode=r.get("data_mode", "DEMO"),
            forecast_run_id=latest_run,
            forecast_horizon_hours=96,  # 4-day active lead time
            bust_probability=r["bust_probability"],
            confidence_score=r["confidence_score"],
            risk_level=r["risk_level"],
            raw_precipitation_mm=raw,
            corrected_precipitation_mm=corr,
            bias_delta_mm=bias_delta,
            exceedance_probabilities=exceedance,
            diagnostic_note=r["diagnostic_note"],
            computation_method="DEMO_COMPUTED: bias_delta_mm = (corrected - raw); risk scores and threshold exceedances derived from synthetic ensemble distribution.",
            updated_at=datetime.now(timezone.utc),
        )

    @staticmethod
    def get_region_explanations(region_id: str) -> Optional[RegionExplanation]:
        key = region_id.upper().strip()
        r = DEMO_REGIONS.get(key)
        if not r:
            return None

        factors = [
            ExplanationFactor(
                factor_name=f["factor_name"],
                contribution_score=f["contribution_score"],
                direction=f["direction"],
                description=f["description"],
            )
            for f in r.get("key_factors", [])
        ]

        return RegionExplanation(
            region_id=r["region_id"],
            region_name=r["name"],
            data_mode=r.get("data_mode", "DEMO"),
            bust_risk_level=r["risk_level"],
            bust_probability=r["bust_probability"],
            primary_driver=r["primary_driver"],
            summary=r["summary"],
            key_factors=factors,
            anomalies_detected=r.get("anomalies_detected", []),
            recommended_action=r["recommended_action"],
            disclaimer="Demonstration Diagnostic Notice: Explanations are synthetic case scenarios and not calibrated against active operational radar sensors.",
        )

    @staticmethod
    def generate_regions_csv() -> str:
        """Generates downloadable CSV content containing regional bust risk summary."""
        output = io.StringIO()
        writer = csv.writer(output, lineterminator="\n")

        headers = [
            "region_id",
            "region_name",
            "latitude",
            "longitude",
            "radar_radius_meters",
            "synoptic_regime",
            "climate_zone",
            "raw_precipitation_mm",
            "corrected_precipitation_mm",
            "bias_delta_mm",
            "bust_probability",
            "confidence_score",
            "risk_level",
            "heavy_rain_gt_64_5mm_prob",
            "very_heavy_rain_gt_115_5mm_prob",
            "extremely_heavy_rain_gt_204_5mm_prob",
            "diagnostic_note",
            "data_mode",
            "exported_at_utc",
        ]
        writer.writerow(headers)

        now_str = datetime.now(timezone.utc).isoformat()
        for r in DEMO_REGIONS.values():
            raw = float(r["raw_precipitation_mm"])
            corr = float(r["corrected_precipitation_mm"])
            delta = round(corr - raw, 1)
            ex = r["exceedance_probabilities"]
            writer.writerow([
                r["region_id"],
                r["name"],
                r["latitude"],
                r["longitude"],
                r["radar_radius_meters"],
                r["synoptic_regime"],
                r["climate_zone"],
                raw,
                corr,
                delta,
                r["bust_probability"],
                r["confidence_score"],
                r["risk_level"],
                ex["heavy_rain_gt_64_5mm"],
                ex["very_heavy_rain_gt_115_5mm"],
                ex["extremely_heavy_rain_gt_204_5mm"],
                r["diagnostic_note"],
                r.get("data_mode", "DEMO"),
                now_str,
            ])

        return output.getvalue()


region_service = RegionService()

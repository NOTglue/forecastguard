from datetime import datetime, timezone
from typing import Dict, Any, List
from ..data.demo_store import DEMO_REGIONS, DEMO_FORECAST_RUNS
from ..schemas.region import ExceedanceProbabilities
from ..schemas.confidence_map import (
    ConfidenceMapRegion,
    ConfidenceMapResponse,
)


class ConfidenceMapService:
    """Service providing geospatial confidence map data for frontend radar and GIS layers."""

    @staticmethod
    def get_map_data() -> ConfidenceMapResponse:
        latest_run = DEMO_FORECAST_RUNS[0]["run_id"]
        regions_list: List[ConfidenceMapRegion] = []
        geojson_features: List[Dict[str, Any]] = []

        legend_colors = {
            "LOW": "#00f5d4",       # Doppler Cyan
            "MODERATE": "#aacc00",  # Advisory Lime
            "HIGH": "#ffbe0b",      # Alert Amber
            "SEVERE": "#ff0055",    # High Risk Crimson
        }

        for r in DEMO_REGIONS.values():
            raw = float(r["raw_precipitation_mm"])
            corr = float(r["corrected_precipitation_mm"])
            delta = round(corr - raw, 1)

            exceedance = ExceedanceProbabilities(
                heavy_rain_gt_64_5mm=r["exceedance_probabilities"]["heavy_rain_gt_64_5mm"],
                very_heavy_rain_gt_115_5mm=r["exceedance_probabilities"]["very_heavy_rain_gt_115_5mm"],
                extremely_heavy_rain_gt_204_5mm=r["exceedance_probabilities"]["extremely_heavy_rain_gt_204_5mm"],
            )

            map_region = ConfidenceMapRegion(
                region_id=r["region_id"],
                name=r["name"],
                coordinates=[r["latitude"], r["longitude"]],
                radius_meters=r["radar_radius_meters"],
                confidence_value=r["confidence_score"],
                bust_probability=r["bust_probability"],
                risk_level=r["risk_level"],
                raw_rain_mm=raw,
                corrected_rain_mm=corr,
                bias_shift_mm=delta,
                exceedance_probabilities=exceedance,
                data_status="SYNTHETIC_DEMO",
                diagnostic_note=r["diagnostic_note"],
            )
            regions_list.append(map_region)

            # Standard GeoJSON Point Feature (RFC 7946: [lon, lat])
            geojson_features.append({
                "type": "Feature",
                "id": r["region_id"],
                "geometry": {
                    "type": "Point",
                    "coordinates": [r["longitude"], r["latitude"]],
                },
                "properties": {
                    "region_id": r["region_id"],
                    "name": r["name"],
                    "radius_meters": r["radar_radius_meters"],
                    "confidence_value": r["confidence_score"],
                    "bust_probability": r["bust_probability"],
                    "risk_level": r["risk_level"],
                    "marker_color": legend_colors.get(r["risk_level"], "#00f5d4"),
                    "raw_rain_mm": raw,
                    "corrected_rain_mm": corr,
                    "bias_shift_mm": delta,
                    "diagnostic_note": r["diagnostic_note"],
                },
            })

        geojson_collection = {
            "type": "FeatureCollection",
            "features": geojson_features,
        }

        return ConfidenceMapResponse(
            data_mode="DEMO",
            forecast_run_id=latest_run,
            generated_at=datetime.now(timezone.utc),
            total_regions=len(regions_list),
            regions=regions_list,
            geojson=geojson_collection,
            legend_reference=legend_colors,
        )


confidence_map_service = ConfidenceMapService()

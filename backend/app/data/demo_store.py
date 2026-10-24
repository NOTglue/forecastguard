"""
ForecastGuard - Central Demonstration Data Store
SIH26079: Forecast Bust Detection

NOTE:
All data points contained in this module are clearly designated as DEMONSTRATION (DEMO) DATA.
They provide consistent, structured responses for the initial API and Next.js frontend
prototype, without presenting synthetic values as calibrated operational forecasts.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any


# Timezone-aware reference timestamps
NOW_UTC = datetime.now(timezone.utc)
CYCLE_TIME = NOW_UTC.replace(minute=0, second=0, microsecond=0)


# ==========================================
# 1. FORECAST RUNS
# ==========================================
DEMO_FORECAST_RUNS: List[Dict[str, Any]] = [
    {
        "run_id": "RUN-20261020-00Z",
        "model_name": "GFS-0.25deg-Ensemble",
        "model_version": "v4.2-demo",
        "initialization_time": CYCLE_TIME - timedelta(hours=6),
        "forecast_horizon_hours": 240,
        "status": "ACTIVE",
        "data_source": "NOAA GFS 0.25° + IMD Gridded Synthesis (Demonstration Pipeline)",
        "cycle_regime": "DEEP_DEPRESSION",
        "total_regions_monitored": 4,
        "high_risk_regions_count": 2,
        "notes": "Active synoptic cycle over Bay of Bengal and Western Ghats. High bust risk detected in 2 coastal sectors.",
        "data_mode": "DEMO",
    },
    {
        "run_id": "RUN-20261019-12Z",
        "model_name": "GFS-0.25deg-Ensemble",
        "model_version": "v4.2-demo",
        "initialization_time": CYCLE_TIME - timedelta(hours=18),
        "forecast_horizon_hours": 240,
        "status": "COMPLETED",
        "data_source": "NOAA GFS 0.25° + IMD Gridded Synthesis (Demonstration Pipeline)",
        "cycle_regime": "BAY_DEPRESSION",
        "total_regions_monitored": 4,
        "high_risk_regions_count": 1,
        "notes": "Archived prior 12Z cycle. Coastal convective bias was flagged early.",
        "data_mode": "DEMO",
    },
    {
        "run_id": "RUN-20261019-00Z",
        "model_name": "GFS-0.25deg-Ensemble",
        "model_version": "v4.2-demo",
        "initialization_time": CYCLE_TIME - timedelta(hours=30),
        "forecast_horizon_hours": 240,
        "status": "ARCHIVED",
        "data_source": "NOAA GFS 0.25° + IMD Gridded Synthesis (Demonstration Pipeline)",
        "cycle_regime": "ACTIVE_TROUGH",
        "total_regions_monitored": 4,
        "high_risk_regions_count": 0,
        "notes": "Archived cycle under steady trough conditions.",
        "data_mode": "DEMO",
    },
]


# ==========================================
# 2. MONITORED REGIONS AND RISK ASSESSMENTS
# ==========================================
DEMO_REGIONS: Dict[str, Dict[str, Any]] = {
    "ODISHA-07": {
        "region_id": "ODISHA-07",
        "name": "NORTH BAY // ODISHA",
        "latitude": 20.3,
        "longitude": 85.8,
        "radar_radius_meters": 230000,
        "synoptic_regime": "BAY_DEPRESSION",
        "climate_zone": "Tropical Coastal Maritime",
        "data_mode": "DEMO",
        # Risk & Precipitation values
        "raw_precipitation_mm": 194.0,
        "corrected_precipitation_mm": 138.0,
        "bust_probability": 0.76,  # Probabilities kept strictly between 0 and 1
        "confidence_score": 0.24,
        "risk_level": "SEVERE",
        "exceedance_probabilities": {
            "heavy_rain_gt_64_5mm": 0.91,
            "very_heavy_rain_gt_115_5mm": 0.72,
            "extremely_heavy_rain_gt_204_5mm": 0.28,
        },
        "diagnostic_note": "GFS CONVECTIVE CORE OVER-PREDICTION (+56MM BIAS VS IMD GRID)",
        "primary_driver": "CONVECTIVE_PARAM_BLOWUP",
        "summary": "Deep convective parameterization in raw 0.25° NWP produces excessive coastal precipitation cores under low-level cyclonic shear over North Bay.",
        "key_factors": [
            {
                "factor_name": "Convective Available Potential Energy (CAPE) Bias",
                "contribution_score": 0.45,
                "direction": "OVERESTIMATION_BIAS",
                "description": "Uncalibrated boundary-layer moisture flux without mid-tropospheric entrainment drying causes premature convective blowup."
            },
            {
                "factor_name": "Trough Axis Placement Jitter",
                "contribution_score": 0.31,
                "direction": "POSITION_ERROR",
                "description": "Ensemble spread reveals a 65km northward displacement of the monsoon depression vortex center."
            },
            {
                "factor_name": "Sea Surface Temperature Feedback Lag",
                "contribution_score": 0.24,
                "direction": "OVERESTIMATION_BIAS",
                "description": "Uncoupled ocean-atmosphere boundary fails to account for cyclone-induced upwelling sea-surface cooling."
            }
        ],
        "anomalies_detected": [
            "Precipitation delta exceeds 50mm threshold (+56mm)",
            "Doppler radar shows stratiform rain while NWP predicted deep convection",
            "Ensemble standard deviation > 35% of mean"
        ],
        "recommended_action": "Adopt AI bias-corrected field (138mm); suppress extreme flood alert to moderate advisory; prioritize INSAT-3D cloud-top cooling surveillance.",
    },
    "KONKAN-23": {
        "region_id": "KONKAN-23",
        "name": "WESTERN GHATS // KONKAN",
        "latitude": 18.2,
        "longitude": 73.4,
        "radar_radius_meters": 210000,
        "synoptic_regime": "OROGRAPHIC_SURGE",
        "climate_zone": "Tropical Highland Ghats",
        "data_mode": "DEMO",
        "raw_precipitation_mm": 88.0,
        "corrected_precipitation_mm": 146.0,
        "bust_probability": 0.68,
        "confidence_score": 0.32,
        "risk_level": "HIGH",
        "exceedance_probabilities": {
            "heavy_rain_gt_64_5mm": 0.86,
            "very_heavy_rain_gt_115_5mm": 0.64,
            "extremely_heavy_rain_gt_204_5mm": 0.19,
        },
        "diagnostic_note": "OROGRAPHIC LIFT UNDER-RESOLVED IN RAW 0.25 DEG RUN (-58MM)",
        "primary_driver": "SUBGRID_OROGRAPHIC_UNDERESTIMATION",
        "summary": "Coarse 0.25° NWP resolution smoothes out steep Western Ghats windward escarpment, missing localized 140mm+ precipitation spikes.",
        "key_factors": [
            {
                "factor_name": "Subgrid Terrain Smoothing",
                "contribution_score": 0.52,
                "direction": "UNDERESTIMATION_BIAS",
                "description": "Topographic elevation averaged down from 1200m to 450m in grid cells, dampening forced mechanical ascent of Arabian Sea moisture."
            },
            {
                "factor_name": "Low-Level Jet Velocity Peak",
                "contribution_score": 0.30,
                "direction": "UNDERESTIMATION_BIAS",
                "description": "Strong 850hPa zonal jet exceeding 42 knots feeding extreme moisture convergence directly into coastal cliffs."
            },
            {
                "factor_name": "Microphysics Collision-Coalescence Underprediction",
                "contribution_score": 0.18,
                "direction": "UNDERESTIMATION_BIAS",
                "description": "Standard single-moment scheme underpredicts warm-rain droplet coalescence in maritime air."
            }
        ],
        "anomalies_detected": [
            "Negative model bias exceeds -50mm (-58mm deficit)",
            "Windward rain gauges show intense convective bands missed by raw GFS",
            "Integrated vapor transport exceeds 650 kg/m/s"
        ],
        "recommended_action": "Elevate precipitation forecast from 88mm to 146mm; activate high-alert landslide warnings across ghat passes.",
    },
    "GANGA-10": {
        "region_id": "GANGA-10",
        "name": "GANGETIC TROUGH AXIS",
        "latitude": 25.4,
        "longitude": 83.0,
        "radar_radius_meters": 250000,
        "synoptic_regime": "ACTIVE_TROUGH",
        "climate_zone": "Subtropical Humid Continental",
        "data_mode": "DEMO",
        "raw_precipitation_mm": 62.0,
        "corrected_precipitation_mm": 54.0,
        "bust_probability": 0.34,
        "confidence_score": 0.66,
        "risk_level": "MODERATE",
        "exceedance_probabilities": {
            "heavy_rain_gt_64_5mm": 0.42,
            "very_heavy_rain_gt_115_5mm": 0.14,
            "extremely_heavy_rain_gt_204_5mm": 0.03,
        },
        "diagnostic_note": "MERIDIONAL TROUGH OSCILLATION WITHIN NORMAL ENSEMBLE SPREAD",
        "primary_driver": "SYNOPTIC_TROUGH_OSCILLATION",
        "summary": "Monsoon trough oscillation is well-captured across ensemble members with moderate confidence and low probability of severe bust.",
        "key_factors": [
            {
                "factor_name": "Trough Axis Meridional Displacement",
                "contribution_score": 0.55,
                "direction": "POSITION_ERROR",
                "description": "Trough position remains within 30km of climatological normal; ensemble spread is narrow."
            },
            {
                "factor_name": "Diurnal Boundary-Layer Heating",
                "contribution_score": 0.45,
                "direction": "OVERESTIMATION_BIAS",
                "description": "Slight afternoon boundary layer heating overestimation (-8mm correction)."
            }
        ],
        "anomalies_detected": [
            "Minor boundary layer temperature bias (+1.1°C)"
        ],
        "recommended_action": "Maintain standard operational monitoring; confidence in raw guidance remains satisfactory.",
    },
    "DECCAN-31": {
        "region_id": "DECCAN-31",
        "name": "LEEWARD DECCAN CORE",
        "latitude": 15.6,
        "longitude": 76.8,
        "radar_radius_meters": 200000,
        "synoptic_regime": "RAIN_SHADOW_QUIESCENCE",
        "climate_zone": "Semi-Arid Leeward Plateau",
        "data_mode": "DEMO",
        "raw_precipitation_mm": 14.0,
        "corrected_precipitation_mm": 12.0,
        "bust_probability": 0.14,
        "confidence_score": 0.86,
        "risk_level": "LOW",
        "exceedance_probabilities": {
            "heavy_rain_gt_64_5mm": 0.06,
            "very_heavy_rain_gt_115_5mm": 0.01,
            "extremely_heavy_rain_gt_204_5mm": 0.00,
        },
        "diagnostic_note": "QUIESCENT SYNOPTIC FLOW // LOW HISTORICAL ERROR VARIANCE",
        "primary_driver": "STABLE_SUBSIDENCE",
        "summary": "Leeward rain shadow subsidence dominates. Model error variance is historically minimal and bust probability is very low.",
        "key_factors": [
            {
                "factor_name": "Orographic Leeward Subsidence",
                "contribution_score": 0.80,
                "direction": "POSITION_ERROR",
                "description": "Strong mid-tropospheric adiabatic warming effectively suppresses convective clouds."
            },
            {
                "factor_name": "Surface Roughness Sensitivity",
                "contribution_score": 0.20,
                "direction": "OVERESTIMATION_BIAS",
                "description": "Negligible impact on rain totals (-2mm correction)."
            }
        ],
        "anomalies_detected": [],
        "recommended_action": "No intervention needed; raw numerical forecast guidance is stable and dependable.",
    },
}


# ==========================================
# 3. VERIFICATION METRICS & TIME-SERIES
# ==========================================
DEMO_VERIFICATION_SUMMARY: Dict[str, Any] = {
    "is_simulated": True,
    "verification_status": "SYNTHETIC_BENCHMARK_DEMO",
    "evaluation_dataset": "Demonstration Synthetic Retrospective Monsoon Cycle (50 Case Windows)",
    "sample_size_events": 50,
    "disclaimer": (
        "Demonstration Data Notice: Verification scores presented here are synthetic illustrative "
        "examples designed for system integration testing. They are not scientifically validated against "
        "calibrated operational IMD observations."
    ),
    "metrics": {
        "raw_nwp_mae_mm": 28.4,
        "ai_corrected_mae_mm": 12.1,
        "raw_nwp_rmse_mm": 36.8,
        "ai_corrected_rmse_mm": 16.5,
        "bust_detection_precision": 0.82,
        "bust_detection_recall": 0.78,
        "critical_success_index": 0.68,
        "brier_score": 0.14,
    },
    "data_mode": "DEMO",
}

DEMO_VERIFICATION_SERIES: List[Dict[str, Any]] = [
    {
        "day": 1,
        "lead_time_hours": 24,
        "regime": "ACTIVE_TROUGH",
        "raw_forecast_mm": 82.0,
        "ai_corrected_forecast_mm": 96.0,
        "observed_precipitation_mm": 94.0,
        "bust_risk_probability": 0.18,
        "observation_status": "VERIFIED_DEMO_RECORD",
        "is_simulated": True,
    },
    {
        "day": 2,
        "lead_time_hours": 48,
        "regime": "ACTIVE_TROUGH",
        "raw_forecast_mm": 110.0,
        "ai_corrected_forecast_mm": 134.0,
        "observed_precipitation_mm": 129.0,
        "bust_risk_probability": 0.25,
        "observation_status": "VERIFIED_DEMO_RECORD",
        "is_simulated": True,
    },
    {
        "day": 3,
        "lead_time_hours": 72,
        "regime": "BAY_DEPRESSION",
        "raw_forecast_mm": 175.0,
        "ai_corrected_forecast_mm": 130.0,
        "observed_precipitation_mm": 124.0,
        "bust_risk_probability": 0.54,
        "observation_status": "VERIFIED_DEMO_RECORD",
        "is_simulated": True,
    },
    {
        "day": 4,
        "lead_time_hours": 96,
        "regime": "DEEP_DEPRESSION",
        "raw_forecast_mm": 210.0,
        "ai_corrected_forecast_mm": 145.0,
        "observed_precipitation_mm": 138.0,
        "bust_risk_probability": 0.76,
        "observation_status": "VERIFIED_DEMO_RECORD",
        "is_simulated": True,
    },
    {
        "day": 5,
        "lead_time_hours": 120,
        "regime": "CYCLONIC_SURGE",
        "raw_forecast_mm": 160.0,
        "ai_corrected_forecast_mm": 115.0,
        "observed_precipitation_mm": 112.0,
        "bust_risk_probability": 0.68,
        "observation_status": "VERIFIED_DEMO_RECORD",
        "is_simulated": True,
    },
    {
        "day": 6,
        "lead_time_hours": 144,
        "regime": "WD_INTERACTION",
        "raw_forecast_mm": 95.0,
        "ai_corrected_forecast_mm": 80.0,
        "observed_precipitation_mm": None,  # Future lead time
        "bust_risk_probability": 0.49,
        "observation_status": "UNAVAILABLE_FUTURE_LEAD",
        "is_simulated": True,
    },
    {
        "day": 7,
        "lead_time_hours": 168,
        "regime": "BREAK_ONSET",
        "raw_forecast_mm": 45.0,
        "ai_corrected_forecast_mm": 38.0,
        "observed_precipitation_mm": None,
        "bust_risk_probability": 0.42,
        "observation_status": "UNAVAILABLE_FUTURE_LEAD",
        "is_simulated": True,
    },
    {
        "day": 8,
        "lead_time_hours": 192,
        "regime": "MONSOON_BREAK",
        "raw_forecast_mm": 25.0,
        "ai_corrected_forecast_mm": 22.0,
        "observed_precipitation_mm": None,
        "bust_risk_probability": 0.35,
        "observation_status": "UNAVAILABLE_FUTURE_LEAD",
        "is_simulated": True,
    },
    {
        "day": 9,
        "lead_time_hours": 216,
        "regime": "FOOTHILL_LOCK",
        "raw_forecast_mm": 60.0,
        "ai_corrected_forecast_mm": 88.0,
        "observed_precipitation_mm": None,
        "bust_risk_probability": 0.64,
        "observation_status": "UNAVAILABLE_FUTURE_LEAD",
        "is_simulated": True,
    },
    {
        "day": 10,
        "lead_time_hours": 240,
        "regime": "EASTERLY_WAVE",
        "raw_forecast_mm": 70.0,
        "ai_corrected_forecast_mm": 62.0,
        "observed_precipitation_mm": None,
        "bust_risk_probability": 0.72,
        "observation_status": "UNAVAILABLE_FUTURE_LEAD",
        "is_simulated": True,
    },
]


# ==========================================
# 4. UPSTREAM SOURCES & PROVENANCE
# ==========================================
DEMO_UPSTREAM_SOURCES: List[Dict[str, Any]] = [
    {
        "name": "NOAA Global Forecast System (GFS)",
        "feed_type": "NWP_FORECAST",
        "status": "SYNTHETIC_DEMO",
        "spatial_resolution": "0.25° (~27 km)",
        "update_frequency": "6-Hourly (00Z, 06Z, 12Z, 18Z)",
        "description": "Baseline global numerical weather model providing 10-day raw forecasts.",
    },
    {
        "name": "IMD High-Resolution Gridded Rainfall Analysis",
        "feed_type": "GRIDDED_OBSERVATION",
        "status": "SYNTHETIC_DEMO",
        "spatial_resolution": "0.25° (~27 km)",
        "update_frequency": "Daily 24h Accumulation",
        "description": "Spatial interpolation of operational raingauge observations across India.",
    },
    {
        "name": "INSAT-3D/3DR Hydro-Estimator Precipitation",
        "feed_type": "GRIDDED_OBSERVATION",
        "status": "MOCK_INTEGRATION",
        "spatial_resolution": "4 km",
        "update_frequency": "15 Minutes",
        "description": "Geostationary satellite thermal infrared brightness temperature cloud estimates.",
    },
    {
        "name": "IMD Doppler Weather Radar (DWR) Network",
        "feed_type": "RADAR_MOCK",
        "status": "MOCK_INTEGRATION",
        "spatial_resolution": "1 km radial bin",
        "update_frequency": "10 Minutes",
        "description": "Coastal and inland S/C-band polarimetric radar reflectivity composite.",
    },
]


# ==========================================
# 5. HISTORICAL BUST CASE STUDIES
# ==========================================
DEMO_CASES: List[Dict[str, Any]] = [
    {
        "case_id": "CASE-2018-KERALA",
        "title": "2018 Kerala Orographic Amplification Bust",
        "event_date": "2018-08-15",
        "region": "Western Ghats, Kerala",
        "synoptic_situation": "Intense Arabian Sea low-level jet intersecting steep Western Ghats during active monsoon surge.",
        "raw_model_prediction": "Global NWP forecast indicated 120-150 mm/day moderate-to-heavy precipitation.",
        "observed_outcome": "Station gauges recorded unprecedented torrential rainfall exceeding 350-420 mm/day.",
        "forecast_error_magnitude": "-200mm to -270mm severe negative bias",
        "failure_mechanism": "Coarse model topography smoothed 1500m mountain peaks to 500m, completely missing forced orographic upslope condensation.",
        "lessons_learned": "ForecastGuard sub-grid orographic enhancement flags high bust risk and corrects precipitation under strong low-level westerly winds.",
        "data_mode": "DEMO",
    },
    {
        "case_id": "CASE-2023-NORTH-INDIA",
        "title": "July 2023 Western Disturbance & Monsoon Trough Collision",
        "event_date": "2023-07-09",
        "region": "Himachal Pradesh & Delhi-NCR",
        "synoptic_situation": "Unusual mid-latitude westerly trough interacting with active monsoon trough over Northwest India.",
        "raw_model_prediction": "NWP predicted primary rainfall core over Central India and Foothills (<50mm in plain sectors).",
        "observed_outcome": "Record cloudburst and 24h rainfall exceeding 250mm across Himachal and Yamuna catchment.",
        "forecast_error_magnitude": "+160km position displacement error and -180mm local underestimation",
        "failure_mechanism": "Ensemble members failed to capture the non-linear vortex interaction between the subtropical jet and monsoon low.",
        "lessons_learned": "Ensemble spread and upper-tropospheric PV anomaly tracking enables 48h advance warning of high bust probability.",
        "data_mode": "DEMO",
    },
    {
        "case_id": "CASE-2021-GULAB",
        "title": "September 2021 Cyclone Gulab Landfall & In-land Persistence",
        "event_date": "2021-09-26",
        "region": "North Andhra Pradesh & South Odisha",
        "synoptic_situation": "Rapidly organizing cyclonic storm in Bay of Bengal making landfall near Kalingapatnam.",
        "raw_model_prediction": "Raw NWP predicted rapid dissipation within 12 hours of crossing the coast.",
        "observed_outcome": "Vortex maintained cyclonic structure across the Deccan peninsula and re-emerged as Cyclone Shaheen in Arabian Sea.",
        "forecast_error_magnitude": "Dissipation timing error of 36 hours; rainfall spatial swath missed by 120km",
        "failure_mechanism": "Soil moisture feedback and boundary-layer latent heat release sustained inland vortex longer than parameterized.",
        "lessons_learned": "Coupled land-surface moisture diagnostics in ForecastGuard identify inland persistence risks.",
        "data_mode": "DEMO",
    },
]


# ==========================================
# 6. MODEL METADATA
# ==========================================
DEMO_MODELS: List[Dict[str, Any]] = [
    {
        "model_id": "fg-bust-detector-v1",
        "name": "ForecastGuard Synoptic Bust Classifier",
        "version": "1.0.0-demo",
        "status": "PROTOTYPE_DEMO",
        "architecture": "Gradient-Boosted Trees (LightGBM) + Temporal Convolutional Network (TCN)",
        "target_variable": "Binary bust indicator (|Forecast - Obs| > 50mm or > 2σ error)",
        "input_features": [
            "GFS Raw Precipitation (mm)",
            "850hPa Zonal & Meridional Wind Shear",
            "500hPa Geopotential Height Anomaly",
            "Integrated Vapor Transport (IVT)",
            "Convective Available Potential Energy (CAPE)",
            "Topographic Variance & Subgrid Slope",
            "Ensemble Standard Deviation"
        ],
        "forecast_horizons": ["24h", "48h", "72h", "96h", "120h", "144h", "168h", "192h", "216h", "240h"],
        "baseline_comparison": "Raw NOAA GFS 0.25° vs ForecastGuard AI Post-Processor",
        "is_scientifically_calibrated": False,
        "disclaimer": "Model metadata represents demonstration architecture. Weights and feature matrices are illustrative mock components.",
        "data_mode": "DEMO",
    },
    {
        "model_id": "fg-orographic-bias-corrector",
        "name": "ForecastGuard High-Res Orographic Bias Corrector",
        "version": "0.9.4-demo",
        "status": "PROTOTYPE_DEMO",
        "architecture": "Fourier Neural Operator (FNO) with Topographic Embedding",
        "target_variable": "Continuous Precipitation Correction Delta (mm)",
        "input_features": [
            "Raw 0.25° NWP Rain Grid",
            "High-Resolution Digital Elevation Model (SRTM 90m)",
            "Wind Vector Orientation vs Ridge Azimuth",
            "Boundary Layer Moisture Flux"
        ],
        "forecast_horizons": ["24h", "48h", "72h"],
        "baseline_comparison": "Uncorrected NWP Grid vs Corrected Surface Downscale",
        "is_scientifically_calibrated": False,
        "disclaimer": "Prototype downscaler designed to correct sub-grid Ghats/Himalayan precipitation deficits.",
        "data_mode": "DEMO",
    },
]

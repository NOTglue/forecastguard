# ForecastGuard — Backend API (SIH26079)
### Severe Forecast Bust Detection & AI Bias Correction for Numerical Weather Prediction (NWP)

Backend service built with **FastAPI**, **Pydantic v2**, and **Python 3.14+**.
Monitors operational NWP runs (e.g. NOAA GFS 0.25°), flags extreme precipitation bust risks, computes AI bias-correction deltas, provides physical diagnostic explanations, and serves geospatial confidence map data for frontend radar overlays.

---

## 1. Quick Start (Windows PowerShell)

### Step 1: Open PowerShell in the project directory
```powershell
cd "c:\Users\D NANDHINI\Downloads\forecastguard-backend\forecastguard-backend"
```

### Step 2: (Optional) Create & Activate a Virtual Environment
```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
```

### Step 3: Install Required Dependencies
```powershell
py -m pip install -r backend/requirements.txt
```

### Step 4: Run the FastAPI Development Server
You can launch the backend from the project root using either of these commands:

**Option A (Using app-dir):**
```powershell
py -m uvicorn app.main:app --reload --app-dir backend --port 8000
```

**Option B (From root package path):**
```powershell
py -m uvicorn backend.app.main:app --reload --port 8000
```

Once running, the backend is accessible at:
- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### Step 5: Run Automated Tests
Execute the pytest suite covering all endpoints, 404 handlers, probability bounds, and CSV exports:

```powershell
# From project root:
py -m pytest backend/tests -v

# Or from inside the backend folder:
cd backend
py -m pytest tests -v
```

---

## 2. Environment Variables & Configuration

The application uses standard environment variables with sensible development defaults in `backend/app/core/config.py`:

| Variable | Default Value | Description |
|---|---|---|
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000` | Comma-separated allowed frontend origins, or `*` for open development access. |
| `FORECASTGUARD_DATA_MODE` | `DEMO` | Operational data mode (`DEMO` or `LIVE_OPERATIONAL`). |

Example PowerShell invocation with custom settings:
```powershell
$env:CORS_ORIGINS="http://localhost:3000,https://myproductionapp.com"
$env:FORECASTGUARD_DATA_MODE="DEMO"
py -m uvicorn app.main:app --reload --app-dir backend --port 8000
```

---

## 3. Architecture & Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # App initialization, CORS middleware, route registration, /health
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py            # Environment-driven configuration and CORS settings
│   ├── data/
│   │   ├── __init__.py
│   │   └── demo_store.py        # Central demonstration data store (monsoon regimes, radar sectors)
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── common.py            # BaseDemoModel, UTC timestamp utilities
│   │   ├── forecast_run.py      # NWP run schemas (ForecastRun, ForecastRunsListResponse)
│   │   ├── region.py            # Sector, Risk, and Diagnostic Explanation models
│   │   ├── confidence_map.py    # Geospatial radar sector and GeoJSON schemas
│   │   ├── verification.py      # Summary metrics and 10-day time-series models
│   │   ├── data_status.py       # Data provenance and upstream source models
│   │   └── cases_models.py      # Case study records and ML model architecture metadata
│   ├── services/
│   │   ├── __init__.py
│   │   ├── forecast_service.py  # Forecast run queries and filtering
│   │   ├── region_service.py    # Region risk calculations, explanations, and CSV generator
│   │   ├── confidence_map_service.py # GeoJSON and radar layer assembly
│   │   ├── verification_service.py   # Historical verification vs future lead separation
│   │   └── metadata_service.py  # Provenance, case study, and model architectures
│   └── routers/
│       ├── __init__.py
│       ├── forecast_runs.py     # /api/v1/forecast-runs...
│       ├── regions.py           # /api/v1/regions...
│       ├── confidence_map.py    # /api/v1/confidence-map
│       ├── verification.py      # /api/v1/verification...
│       ├── data_status.py       # /api/v1/data-status
│       ├── cases_models.py      # /api/v1/cases, /api/v1/models
│       └── exports.py           # /api/v1/exports/regions.csv
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # TestClient session fixture
│   ├── test_health.py           # Health check and schema validation tests
│   ├── test_forecast_runs.py    # Forecast run listing, retrieval, and 404 tests
│   ├── test_regions.py          # Sector risks, explanations, and 404 tests
│   ├── test_confidence_map.py   # Radar sectors, probabilities, and GeoJSON tests
│   ├── test_verification.py     # Metrics verification and future lead separation
│   ├── test_data_status.py      # Data provenance and freshness tests
│   ├── test_cases_and_models.py # Case studies and model metadata tests
│   └── test_exports.py          # CSV format, headers, and download tests
├── requirements.txt             # Python dependencies
└── README.md                    # Backend documentation and developer manual
```

---

## 4. Complete API Reference

Base URL: `http://localhost:8000`

### A. Health & System Overview
- **`GET /health`**
  - Response: `{"status": "healthy", "project": "ForecastGuard"}`
- **`GET /`**
  - Welcome endpoint listing status, active data mode, and discovery URLs.

### B. Forecast Runs
- **`GET /api/v1/forecast-runs`**
  - Returns paginated list of NWP cycles (`RUN-20261020-00Z`, etc.), initialization times, model versions, and monitored sector counts.
- **`GET /api/v1/forecast-runs/latest`**
  - Returns the latest active operational forecast cycle.
- **`GET /api/v1/forecast-runs/{run_id}`**
  - Returns metadata for a specific cycle (returns 404 if not found).

### C. Regions & Bust Risk
- **`GET /api/v1/regions`**
  - Lists all 4 monitored radar zones (`ODISHA-07`, `KONKAN-23`, `GANGA-10`, `DECCAN-31`) with centroid coordinates and synoptic regimes.
- **`GET /api/v1/regions/{region_id}`**
  - Returns details for a single region (returns 404 for unknown IDs).
- **`GET /api/v1/regions/{region_id}/risk`**
  - Returns bust probability ($0.0 \le p \le 1.0$), confidence score, raw vs AI-corrected precipitation ($mm$), bias delta shift ($mm$), and IMD heavy rainfall exceedance probabilities ($>64.5mm$, $>115.5mm$, $>204.5mm$).
- **`GET /api/v1/regions/{region_id}/explanations`**
  - Diagnostic breakdown explaining physical failure mechanisms (e.g. convective parameterization blowup, subgrid Ghats terrain smoothing), contributing factors with relative weight, anomalies detected, and recommended operational actions.

### D. Confidence Map Layer
- **`GET /api/v1/confidence-map`**
  - Serves coordinates, radar radii (meters), confidence values, bust probabilities, and a complete RFC 7946 **GeoJSON FeatureCollection** ready to feed directly into Leaflet or Mapbox map layers.

### E. Verification
- **`GET /api/v1/verification/summary`**
  - Aggregate accuracy metrics comparing Raw NWP vs AI-corrected output (MAE, RMSE, Hit-Rate/Recall, CSI Threat Score, Brier Score). Explicitly flagged with `is_simulated: true` and disclaimer.
- **`GET /api/v1/verification/series`**
  - 10-day synoptic timeline (`monsoonTimeline`). Days 1–5 include synthetic observations (`VERIFIED_DEMO_RECORD`); Days 6–10 have `observed_precipitation_mm: null` and `observation_status: "UNAVAILABLE_FUTURE_LEAD"` as future observations have not yet occurred.

### F. Data Provenance & Freshness
- **`GET /api/v1/data-status`**
  - Confirms system status (`is_real_data: false`, `is_demonstration: true`, `data_mode: "DEMO"`), data freshness in seconds, refresh schedule (6-hourly), and upstream feeds (NOAA GFS, IMD Gridded Analysis, INSAT-3D, DWR).

### G. Case Studies & Model Architectures
- **`GET /api/v1/cases`**
  - Historical forecast bust case studies:
    - `CASE-2018-KERALA`: Western Ghats orographic amplification bust
    - `CASE-2023-NORTH-INDIA`: Western Disturbance and monsoon trough collision
    - `CASE-2021-GULAB`: Cyclone Gulab inland persistence
- **`GET /api/v1/models`**
  - Model architecture metadata:
    - `fg-bust-detector-v1`: LightGBM + Temporal Convolutional Network
    - `fg-orographic-bias-corrector`: Fourier Neural Operator (FNO)

### H. CSV Export
- **`GET /api/v1/exports/regions.csv`**
  - Streams a downloadable CSV file (`forecastguard_regions.csv`) containing current regional precipitation readings, bias deltas, risk levels, and exceedance probabilities.

---

## 5. Next.js Frontend Integration Guide

The existing frontend located in the parent directory (`app/page.tsx`) can consume these endpoints directly:

| Frontend UI Component | Corresponding Backend Endpoint |
|---|---|
| **Fullscreen Radar Scope Map** | `GET /api/v1/confidence-map` |
| **Monsoon Regime & Locked Sector Telemetry** | `GET /api/v1/regions/{region_id}/risk` |
| **Diagnostic Anomaly Strip & Guidance** | `GET /api/v1/regions/{region_id}/explanations` |
| **Oscilloscope Waveform Chart (Raw vs Corr vs Obs)** | `GET /api/v1/verification/series` |
| **10-Day Radial Synoptic Dial** | `GET /api/v1/verification/series` |
| **System Header Badge** | `GET /health` or `GET /api/v1/data-status` |
| **CSV Download Button** | `GET /api/v1/exports/regions.csv` |

Example frontend fetch snippet (TypeScript):
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Fetch radar map points and bust probabilities
async function fetchConfidenceMap() {
  const res = await fetch(`${BACKEND_URL}/api/v1/confidence-map`);
  const data = await res.json();
  return data.regions;
}

// Fetch 10-day verification timeline for the chart
async function fetchVerificationSeries() {
  const res = await fetch(`${BACKEND_URL}/api/v1/verification/series`);
  const data = await res.json();
  return data.series;
}
```

---

## 6. Data Integrity & Scientific Transparency
1. **DEMO Mode**: Every endpoint response includes `data_mode: "DEMO"`.
2. **Probability Constraints**: All bust probabilities, confidence scores, and exceedances are strictly bounded between `0.0` and `1.0`.
3. **No Fabricated Real-World Calibration**: Synthetic values are transparently documented as prototype demonstration data.
4. **Separation of Concerns**: Prediction and verification services are isolated from data storage, allowing easy drop-in integration of real operational NWP feeds (e.g. GRIB2 decoders or IMD OPeNDAP streams) in future development phases.

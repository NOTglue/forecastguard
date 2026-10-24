/**
 * Typed client for the ForecastGuard FastAPI backend.
 *
 * The backend is a separate service (see `forecastguard-backend-v1/`). It is
 * optional at runtime: the UI falls back to the bundled synthetic dataset when
 * the API is unreachable, so the site still works when only Next.js is running.
 */

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export type BackendExceedance = {
  heavy_rain_gt_64_5mm: number;
  very_heavy_rain_gt_115_5mm: number;
  extremely_heavy_rain_gt_204_5mm: number;
};

export type BackendHealth = {
  status: string;
  project: string;
};

export type BackendConfidenceRegion = {
  region_id: string;
  name: string;
  coordinates: [number, number] | number[];
  radius_meters: number;
  confidence_value: number;
  bust_probability: number;
  risk_level: string;
  raw_rain_mm: number;
  corrected_rain_mm: number;
  bias_shift_mm: number;
  exceedance_probabilities: BackendExceedance;
  data_status: string;
  diagnostic_note: string;
};

export type BackendConfidenceMap = {
  forecast_run_id: string;
  generated_at: string;
  total_regions: number;
  regions: BackendConfidenceRegion[];
  legend_reference: Record<string, string>;
};

export type BackendVerificationPoint = {
  day: number;
  lead_time_hours: number;
  regime: string;
  raw_forecast_mm: number;
  ai_corrected_forecast_mm: number;
  observed_precipitation_mm: number | null;
  bust_risk_probability: number;
  observation_status: string;
  is_simulated: boolean;
};

export type BackendVerificationSeries = {
  forecast_run_id: string;
  is_simulated: boolean;
  total_points: number;
  verified_points_count: number;
  unverified_points_count: number;
  disclaimer: string;
  series: BackendVerificationPoint[];
};

export type BackendVerificationMetrics = {
  raw_nwp_mae_mm: number;
  ai_corrected_mae_mm: number;
  raw_nwp_rmse_mm: number;
  ai_corrected_rmse_mm: number;
  bust_detection_precision: number;
  bust_detection_recall: number;
  critical_success_index: number;
  brier_score: number;
};

export type BackendVerificationSummary = {
  is_simulated: boolean;
  verification_status: string;
  evaluation_dataset: string;
  sample_size_events: number;
  disclaimer: string;
  metrics: BackendVerificationMetrics;
};

export type BackendForecastRun = {
  run_id: string;
  model_name: string;
  model_version: string;
  initialization_time: string;
  forecast_horizon_hours: number;
  status: string;
  data_source: string;
  cycle_regime: string;
  total_regions_monitored: number;
  high_risk_regions_count: number;
  notes: string | null;
};

export type BackendRegionRisk = {
  region_id: string;
  region_name: string;
  forecast_run_id: string;
  forecast_horizon_hours: number;
  bust_probability: number;
  confidence_score: number;
  risk_level: string;
  raw_precipitation_mm: number;
  corrected_precipitation_mm: number;
  bias_delta_mm: number;
  exceedance_probabilities: BackendExceedance;
  diagnostic_note: string;
  computation_method: string;
  updated_at: string;
};

export type BackendExplanationFactor = {
  factor_name: string;
  contribution_score: number;
  direction: string;
  description: string;
};

export type BackendRegionExplanation = {
  region_id: string;
  region_name: string;
  bust_risk_level: string;
  bust_probability: number;
  primary_driver: string;
  summary: string;
  key_factors: BackendExplanationFactor[];
  anomalies_detected: string[];
  recommended_action: string;
  disclaimer: string;
};

export type BackendDataStatus = {
  is_real_data: boolean;
  is_demonstration: boolean;
  data_source: string;
  active_forecast_run_id: string;
  last_updated: string;
  data_freshness_seconds: number;
  refresh_cadence: string;
  system_notice: string;
};

const DEFAULT_TIMEOUT = 6000;

async function getJson<T>(path: string, timeoutMs = DEFAULT_TIMEOUT): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`${path} returned ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export const backendApi = {
  baseUrl: API_BASE,
  health: () => getJson<BackendHealth>("/health", 3500),
  dataStatus: () => getJson<BackendDataStatus>("/api/v1/data-status"),
  latestRun: () => getJson<BackendForecastRun>("/api/v1/forecast-runs/latest"),
  confidenceMap: () =>
    getJson<BackendConfidenceMap>("/api/v1/confidence-map"),
  verificationSeries: () =>
    getJson<BackendVerificationSeries>("/api/v1/verification/series"),
  verificationSummary: () =>
    getJson<BackendVerificationSummary>("/api/v1/verification/summary"),
  regionRisk: (regionId: string) =>
    getJson<BackendRegionRisk>(`/api/v1/regions/${encodeURIComponent(regionId)}/risk`),
  regionExplanation: (regionId: string) =>
    getJson<BackendRegionExplanation>(
      `/api/v1/regions/${encodeURIComponent(regionId)}/explanations`,
    ),
  regionsCsvUrl: `${API_BASE}/api/v1/exports/regions.csv`,
};

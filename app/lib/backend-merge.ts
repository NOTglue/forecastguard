import type { DayInfo } from "@/app/lib/timeline";
import type { BackendConfidenceRegion } from "@/app/lib/api";

/**
 * The backend publishes a single "current lead" snapshot per region plus a
 * run-level 10-day verification series. The frontend keeps its synthetic
 * day-by-day shape, and the backend snapshot replaces the day it describes
 * (the backend reports `forecast_horizon_hours`, currently 96h = Day 4).
 */
export function backendLeadDay(horizonHours: number): number {
  const day = Math.round(horizonHours / 24);
  return Math.min(10, Math.max(1, day));
}

const pct = (value: number) => Math.round(Math.max(0, Math.min(1, value)) * 100);
const mm = (value: number) => Math.round(value * 10) / 10;

export function overlayBackendTimeline(
  timeline: DayInfo[],
  region: BackendConfidenceRegion,
  horizonHours = 96,
): DayInfo[] {
  const day = backendLeadDay(horizonHours);

  return timeline.map((entry) =>
    entry.day === day
      ? {
          ...entry,
          raw: mm(region.raw_rain_mm),
          corr: mm(region.corrected_rain_mm),
          bust: pct(region.bust_probability),
          ex64: pct(region.exceedance_probabilities.heavy_rain_gt_64_5mm),
          ex115: pct(region.exceedance_probabilities.very_heavy_rain_gt_115_5mm),
          ex204: pct(region.exceedance_probabilities.extremely_heavy_rain_gt_204_5mm),
          hasData: true,
          quality: "OK",
          source: "backend",
        }
      : entry,
  );
}

/** Convert the backend's run-level series into the chart's DayInfo shape. */
export function backendSeriesToTimeline(
  points: {
    day: number;
    raw_forecast_mm: number;
    ai_corrected_forecast_mm: number;
    observed_precipitation_mm: number | null;
    bust_risk_probability: number;
    regime: string;
  }[],
): DayInfo[] {
  return points
    .slice()
    .sort((a, b) => a.day - b.day)
    .map((p) => {
      const corr = mm(p.ai_corrected_forecast_mm);
      return {
        day: p.day,
        regime: p.regime,
        raw: mm(p.raw_forecast_mm),
        corr,
        obs: p.observed_precipitation_mm == null ? null : mm(p.observed_precipitation_mm),
        bust: pct(p.bust_risk_probability),
        ex64: Math.min(99, Math.round((corr / 220) * 100)),
        ex115: Math.min(96, Math.round((corr / 290) * 85)),
        ex204: Math.max(0, Math.min(88, Math.round(((corr - 70) / 260) * 65))),
        quality: "OK",
        hasData: true,
        source: "backend",
      } satisfies DayInfo;
    });
}

import { DATA_GAPS, type DataQuality, type Zone } from "@/app/data/zones";

export type DayInfo = {
  day: number;
  regime: string;
  raw: number;
  corr: number;
  obs: number | null;
  bust: number;
  ex64: number;
  ex115: number;
  ex204: number;
  quality: DataQuality;
  /** True when no usable input exists for this region/day. */
  hasData: boolean;
  /** Where this point came from: local synthetic series or the FastAPI backend. */
  source?: "local" | "backend";
};

/* Shape multipliers used to give the demo a plausible 10-day evolution. */
const RAW_WAVE = [0.7, 0.9, 1.3, 1.6, 1.2, 0.9, 0.6, 0.4, 0.7, 0.8];
const CORR_WAVE = [0.8, 1.0, 1.2, 1.4, 1.1, 0.8, 0.5, 0.35, 0.75, 0.7];
const BUST_WAVE = [25, 32, 58, 75, 62, 45, 30, 20, 50, 55];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function getDataQuality(zoneId: string, day: number): DataQuality {
  return DATA_GAPS[zoneId]?.[day] ?? "OK";
}

/**
 * Build the 10-day synthetic timeline for one subdivision.
 *
 * IMPORTANT: these are illustrative weights, not a model output. There is no
 * trained model behind the numbers in this prototype.
 */
export function getZoneTimeline(zone: Zone, regimes: readonly string[]): DayInfo[] {
  return regimes.map((regime, idx) => {
    const day = idx + 1;
    const raw = Math.max(4, Math.round(zone.baseRaw * RAW_WAVE[idx]));
    const corr = Math.max(4, Math.round(zone.baseCorr * CORR_WAVE[idx]));
    const obs = day <= 5 ? Math.max(2, Math.round(corr * (0.92 + (idx % 2) * 0.08))) : null;
    const bust = clamp(Math.round(zone.baseBust * (BUST_WAVE[idx] / 50)), 10, 99);
    const ex64 = clamp(Math.round((corr / 220) * 100), 2, 99);
    const ex115 = clamp(Math.round((corr / 290) * 85), 1, 96);
    const ex204 = clamp(Math.round(((corr - 70) / 260) * 65), 0, 88);
    const quality = getDataQuality(zone.id, day);
    const hasData = quality !== "MISSING";

    return {
      day,
      regime,
      raw,
      corr,
      obs,
      bust: hasData ? bust : 0,
      ex64: hasData ? ex64 : 0,
      ex115: hasData ? ex115 : 0,
      ex204: hasData ? ex204 : 0,
      quality,
      hasData,
    };
  });
}

/**
 * Confidence band from PRD §9.1. The mapping is a UI default only — it is
 * not calibrated, and the UI must say so.
 */
export function confidenceLabel(bustPct: number): string {
  if (bustPct <= 20) return "Higher confidence";
  if (bustPct <= 40) return "Moderate confidence";
  if (bustPct <= 60) return "Reduced confidence";
  return "Low confidence";
}

export function confidenceTone(bustPct: number): "ok" | "cool" | "warn" | "danger" {
  if (bustPct <= 20) return "ok";
  if (bustPct <= 40) return "cool";
  if (bustPct <= 60) return "warn";
  return "danger";
}

export const TONE_COLOR: Record<string, string> = {
  ok: "#1d6f47",
  cool: "#236d7b",
  warn: "#8a5a09",
  danger: "#a9221d",
  muted: "#6e7a71",
};

/* --- colour helpers ------------------------------------------------- */

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * Math.min(1, Math.max(0, t)));
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
}

/** Four-band bust ramp, shared by the map, legend, table and cards. */
export function bustColor(bustPct: number): string {
  if (bustPct <= 20) return "#1d6f47";
  if (bustPct <= 40) return "#236d7b";
  if (bustPct <= 60) return "#8a5a09";
  return "#a9221d";
}

/** Sequential marine ramp for rainfall depth (0–250 mm). */
export function rainColor(mm: number): string {
  return mix("#e4dbc6", "#1f7a86", Math.min(1, Math.max(0, mm / 230)));
}

export const fmtDelta = (n: number) => `${n > 0 ? "+" : ""}${n}mm`;

export const fmtPct = (n: number) => `${n}%`;

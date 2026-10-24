/**
 * Static reference data for the ForecastGuard prototype.
 *
 * Everything here is SYNTHETIC. The numbers are illustrative weights used
 * to shape the demo experience; they are not derived from any NWP run,
 * observation archive or trained model. The UI surfaces this as
 * "SIMULATED" everywhere it matters (see RUN_META.dataMode).
 */

export type Tone = "hot" | "warm" | "cold" | "calm";

export type Zone = {
  id: string;
  name: string;
  /** [latitude, longitude] — used by Leaflet and by the generated map art. */
  coords: [number, number];
  /** Circle radius in metres for the map overlay. */
  radius: number;
  baseRaw: number;
  baseCorr: number;
  baseBust: number;
  /**
   * Synoptic character of the subdivision. Drives the shaded rain cells in
   * the generated atlas artwork (scripts/generate-assets.mjs).
   */
  tone: Tone;
  /**
   * Human-readable diagnostic. NOTE: this is authored copy, not a computed
   * model explanation — the prototype has no model behind it yet.
   */
  reason: string;
};

/** The ten medium-range weather regimes tracked per lead day. */
export const REGIMES = [
  "ACTIVE_TROUGHS",
  "MONSOON_PULSE",
  "BAY_DEPRESSION",
  "DEEP_DEPRESSION",
  "CYCLONIC_SURGE",
  "WD_INTERACTION",
  "BREAK_ONSET",
  "MONSOON_BREAK",
  "FOOTHILL_LOCK",
  "EASTERLY_WAVE",
] as const;

export type Regime = (typeof REGIMES)[number];

/** The 15 IMD meteorological subdivisions under watch. */
export const ZONES: Zone[] = [
  {
    id: "GANGA-10",
    name: "Gangetic Plain Sector",
    coords: [25.4, 83.0],
    radius: 170000,
    baseRaw: 62,
    baseCorr: 54,
    baseBust: 34,
    tone: "calm",
    reason:
      "The trough axis is shifting slightly within normal ensemble limits, keeping totals close to typical seasonal averages.",
  },
  {
    id: "ODISHA-07",
    name: "Coastal Odisha & North Bay",
    coords: [20.3, 85.8],
    radius: 165000,
    baseRaw: 194,
    baseCorr: 138,
    baseBust: 76,
    tone: "hot",
    reason:
      "The raw model is heavily overestimating convective strength here, pumping up numbers by about 56mm compared to actual IMD observations.",
  },
  {
    id: "KONKAN-23",
    name: "Konkan, Goa & Western Ghats",
    coords: [18.2, 73.4],
    radius: 155000,
    baseRaw: 88,
    baseCorr: 146,
    baseBust: 68,
    tone: "hot",
    reason:
      "Because of its coarse grid resolution, the raw model completely misses the intense orographic lift happening along the Ghats, falling short by nearly 58mm.",
  },
  {
    id: "DECCAN-31",
    name: "Deccan Interior Plateau",
    coords: [15.6, 76.8],
    radius: 160000,
    baseRaw: 14,
    baseCorr: 12,
    baseBust: 14,
    tone: "calm",
    reason:
      "Stable leeward winds are keeping conditions dry and predictable, showing almost no historical forecast variance.",
  },
  {
    id: "ASSAM-02",
    name: "Assam & Meghalaya",
    coords: [26.1, 91.7],
    radius: 160000,
    baseRaw: 145,
    baseCorr: 218,
    baseBust: 82,
    tone: "hot",
    reason:
      "Severe underestimation of southerly moisture flux channeling into the Khasi Hills box canyon.",
  },
  {
    id: "KERALA-34",
    name: "Kerala & Mahe",
    coords: [10.8, 76.2],
    radius: 145000,
    baseRaw: 112,
    baseCorr: 149,
    baseBust: 58,
    tone: "warm",
    reason:
      "Offshore vortex formation along the Malabar coast intensifies localized low-level jet convergence.",
  },
  {
    id: "GUJARAT-21",
    name: "Saurashtra & Kutch",
    coords: [22.3, 70.8],
    radius: 175000,
    baseRaw: 132,
    baseCorr: 84,
    baseBust: 64,
    tone: "cold",
    reason:
      "Mid-tropospheric dry air intrusion from the northwest suppresses predicted deep convection cells.",
  },
  {
    id: "PUNJAB-14",
    name: "Punjab & Haryana Plains",
    coords: [30.8, 75.8],
    radius: 155000,
    baseRaw: 48,
    baseCorr: 76,
    baseBust: 51,
    tone: "cold",
    reason:
      "Western Disturbance interaction with lower monsoonal easterlies triggers unmodeled squall lines.",
  },
  {
    id: "RAJ-17",
    name: "West Rajasthan Arid Zone",
    coords: [26.9, 71.9],
    radius: 195000,
    baseRaw: 22,
    baseCorr: 9,
    baseBust: 19,
    tone: "calm",
    reason:
      "Strong anticyclonic subsidence caps boundary layer moisture below convective trigger thresholds.",
  },
  {
    id: "MP-19",
    name: "East Madhya Pradesh",
    coords: [23.2, 79.9],
    radius: 180000,
    baseRaw: 118,
    baseCorr: 136,
    baseBust: 47,
    tone: "warm",
    reason:
      "Monsoon depression track bias shifts core vorticity 80km south of raw deterministic guidance.",
  },
  {
    id: "BIHAR-09",
    name: "Bihar & Sub-Himalayan Foothills",
    coords: [25.8, 86.1],
    radius: 155000,
    baseRaw: 76,
    baseCorr: 128,
    baseBust: 71,
    tone: "hot",
    reason:
      "Foothill lock regime traps moisture against the Nepal border, driving extreme localized cloudburst risk.",
  },
  {
    id: "TAMIL-33",
    name: "Coastal Tamil Nadu & Puducherry",
    coords: [11.9, 79.8],
    radius: 155000,
    baseRaw: 68,
    baseCorr: 98,
    baseBust: 61,
    tone: "warm",
    reason:
      "Easterly wave trough passage enhances nocturnal coastal convergence beyond coarse model resolution.",
  },
  {
    id: "ANDHRA-28",
    name: "Coastal Andhra & Yanam",
    coords: [16.5, 81.1],
    radius: 160000,
    baseRaw: 162,
    baseCorr: 121,
    baseBust: 56,
    tone: "warm",
    reason:
      "Raw guidance over-deepens the shear zone; bias correction tempers coastal surge totals.",
  },
  {
    id: "HIMACHAL-12",
    name: "Himachal & Uttarakhand",
    coords: [31.1, 77.6],
    radius: 150000,
    baseRaw: 64,
    baseCorr: 132,
    baseBust: 79,
    tone: "cold",
    reason:
      "Steep Himalayan valley gradients force rapid parcel ascent uncaptured by 25km global spectral grids.",
  },
  {
    id: "BENGAL-06",
    name: "Gangetic West Bengal",
    coords: [22.9, 87.8],
    radius: 150000,
    baseRaw: 178,
    baseCorr: 144,
    baseBust: 66,
    tone: "warm",
    reason:
      "North Bay cyclonic circulation entrains drier continental air on its western periphery.",
  },
];

/**
 * Lead days where a subdivision's upstream feed is degraded.
 * Used to exercise the "no data" and "stale" UI states (PRD AC-03, AC-08).
 */
export const DATA_GAPS: Record<string, Record<number, "MISSING" | "STALE">> = {
  "GUJARAT-21": { 7: "STALE", 8: "MISSING" },
  "HIMACHAL-12": { 6: "STALE" },
  "KERALA-34": { 9: "MISSING", 10: "STALE" },
  "RAJ-17": { 4: "STALE" },
};

export type DataQuality = "OK" | "STALE" | "MISSING";

export const TEAM = [
  { name: "Naveen Venkat S", role: "1st Year — Frontend", avatar: "/img/avatar-1.svg" },
  { name: "Nadini De Gala", role: "2nd Year — Backend", avatar: "/img/avatar-2.svg" },
  { name: "Abhishek Vinod", role: "2nd Year — Backend", avatar: "/img/avatar-3.svg" },
];

/**
 * Provenance block. Deliberately mirrors the response envelope described in
 * PRD §14.1 so the UI can be wired to a real API without a redesign.
 */
export const RUN_META = {
  requestId: "req_demo_001",
  runId: "run_demo_2026_10_18_00",
  modelVersion: "baseline-demo-0.1",
  dataMode: "SIMULATED" as const,
  initTime: "2026-10-18T00:00:00Z",
  initTimeIst: "18 Oct 2026 · 05:30 IST",
  generatedAt: "2026-10-18T00:12:41Z",
  generatedAtIst: "18 Oct 2026 · 05:42 IST",
  thresholdDefinition:
    "DEMO ONLY: absolute forecast error exceeds a configured per-zone threshold",
  dataSource: "Synthetic demo dataset — no live NWP or observation feed",
} as const;

/** The three exceedance levels the dashboard reports (IMD heavy-rain bands). */
export const EXCEEDANCE_LEVELS = [
  { key: "ex64" as const, label: ">64.5mm", caption: "HEAVY" },
  { key: "ex115" as const, label: ">115.5mm", caption: "VERY HEAVY" },
  { key: "ex204" as const, label: ">204.5mm", caption: "EXTREME" },
];

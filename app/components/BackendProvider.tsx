"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { REGIMES, ZONES, type Zone } from "@/app/data/zones";
import { getZoneTimeline, type DayInfo } from "@/app/lib/timeline";
import { overlayBackendTimeline } from "@/app/lib/backend-merge";
import {
  API_BASE,
  backendApi,
  type BackendConfidenceMap,
  type BackendDataStatus,
  type BackendForecastRun,
  type BackendHealth,
  type BackendRegionExplanation,
  type BackendRegionRisk,
  type BackendVerificationSeries,
  type BackendVerificationSummary,
} from "@/app/lib/api";

export type BackendSnapshot = {
  health: BackendHealth;
  dataStatus?: BackendDataStatus;
  latestRun?: BackendForecastRun;
  confidenceMap?: BackendConfidenceMap;
  series?: BackendVerificationSeries;
  summary?: BackendVerificationSummary;
  regionRisks: Record<string, BackendRegionRisk>;
};

type BackendContextValue = {
  status: "loading" | "online" | "offline";
  snapshot: BackendSnapshot | null;
  error: string | null;
  lastSync: number | null;
  explanations: Record<string, BackendRegionExplanation>;
  loadExplanation: (regionId: string) => void;
  refresh: () => void;
};

const BackendContext = createContext<BackendContextValue | null>(null);

const POLL_MS = 60_000;

async function collectSnapshot(): Promise<BackendSnapshot> {
  const health = await backendApi.health();

  const [statusResult, runResult, mapResult, seriesResult, summaryResult] =
    await Promise.allSettled([
      backendApi.dataStatus(),
      backendApi.latestRun(),
      backendApi.confidenceMap(),
      backendApi.verificationSeries(),
      backendApi.verificationSummary(),
    ]);

  const value = <T,>(result: PromiseSettledResult<T>): T | undefined =>
    result.status === "fulfilled" ? result.value : undefined;

  const dataStatus = value(statusResult);
  const latestRun = value(runResult);
  const confidenceMap = value(mapResult);
  const series = value(seriesResult);
  const summary = value(summaryResult);

  // Region risks carry the forecast horizon that tells us which day the
  // backend snapshot describes (96h = Day 4 today).
  const regionRisks: Record<string, BackendRegionRisk> = {};
  if (confidenceMap) {
    const risks = await Promise.allSettled(
      confidenceMap.regions.map((region) => backendApi.regionRisk(region.region_id)),
    );
    risks.forEach((result) => {
      if (result.status === "fulfilled") {
        regionRisks[result.value.region_id] = result.value;
      }
    });
  }

  return { health, dataStatus, latestRun, confidenceMap, series, summary, regionRisks };
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<BackendContextValue["status"]>("loading");
  const [snapshot, setSnapshot] = useState<BackendSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [explanations, setExplanations] = useState<
    Record<string, BackendRegionExplanation>
  >({});

  const mounted = useRef(true);
  const inFlight = useRef(false);
  const requested = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    try {
      const next = await collectSnapshot();
      if (!mounted.current) return;
      setSnapshot(next);
      setStatus("online");
      setError(null);
      setLastSync(Date.now());
    } catch (err) {
      if (!mounted.current) return;
      setStatus("offline");
      setError(err instanceof Error ? err.message : "Backend unreachable");
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_MS);

    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [refresh]);

  const loadExplanation = useCallback(
    (regionId: string) => {
      if (!regionId || requested.current.has(regionId)) return;
      requested.current.add(regionId);

      backendApi
        .regionExplanation(regionId)
        .then((explanation) => {
          if (!mounted.current) return;
          setExplanations((prev) => ({ ...prev, [regionId]: explanation }));
        })
        .catch(() => {
          requested.current.delete(regionId);
        });
    },
    [],
  );

  const value = useMemo<BackendContextValue>(
    () => ({
      status,
      snapshot,
      error,
      lastSync,
      explanations,
      loadExplanation,
      refresh: () => void refresh(),
    }),
    [status, snapshot, error, lastSync, explanations, loadExplanation, refresh],
  );

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}

export function useBackend(): BackendContextValue {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error("useBackend must be used inside <BackendProvider>");
  }
  return context;
}

/** True when the API published a snapshot for this subdivision. */
export function useBackendRegion(zoneId: string) {
  const { status, snapshot } = useBackend();
  const region = snapshot?.confidenceMap?.regions.find((r) => r.region_id === zoneId);
  const risk = snapshot?.regionRisks[zoneId];

  return { status, region, risk, isBackendRegion: Boolean(region) };
}

/**
 * Merge backend snapshots into the bundled synthetic timelines.
 * One hook call returns every zone so tables and maps avoid per-row hooks.
 */
export function useBackendTimelines(): Map<string, DayInfo[]> {
  const { snapshot } = useBackend();

  return useMemo(() => {
    const timelines = new Map<string, DayInfo[]>();

    for (const zone of ZONES) {
      const local = getZoneTimeline(zone, REGIMES);
      const region = snapshot?.confidenceMap?.regions.find(
        (r) => r.region_id === zone.id,
      );

      if (!region) {
        timelines.set(zone.id, local);
        continue;
      }

      const horizon = snapshot?.regionRisks[zone.id]?.forecast_horizon_hours ?? 96;
      timelines.set(zone.id, overlayBackendTimeline(local, region, horizon));
    }

    return timelines;
  }, [snapshot]);
}

export function useBackendZoneTimeline(zone: Zone): DayInfo[] {
  const timelines = useBackendTimelines();
  return timelines.get(zone.id) ?? getZoneTimeline(zone, REGIMES);
}

export { API_BASE };

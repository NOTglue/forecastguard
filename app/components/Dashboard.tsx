"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EXCEEDANCE_LEVELS, REGIMES, ZONES } from "@/app/data/zones";
import {
  confidenceLabel,
  confidenceTone,
  getZoneTimeline,
  TONE_COLOR,
} from "@/app/lib/timeline";
import ForecastChart from "./ForecastChart";
import MapPanel from "./MapPanel";
import { RunStrip, StatusStrip } from "./Chrome";
import { AnimatedNumber, EASE } from "./motion";
import { Caveat, Chip, DaySelector, MetricToggle, Panel, PanelHeader, ProgressBar, Backdrop } from "./ui";

type Props = {
  day: number;
  onDayChange: (d: number) => void;
  metric: "RAW" | "CORR" | "BUST";
  onMetricChange: (m: "RAW" | "CORR" | "BUST") => void;
  selectedId: string;
  onSelect: (id: string) => void;
};

type SortKey = "bust" | "raw" | "corr" | "delta" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "bust", label: "Bust %" },
  { key: "raw", label: "Raw" },
  { key: "corr", label: "Corr" },
  { key: "delta", label: "Delta" },
  { key: "name", label: "Zone" },
];

export default function Dashboard({
  day,
  onDayChange,
  metric,
  onMetricChange,
  selectedId,
  onSelect,
}: Props) {
  const [view, setView] = useState<"map" | "table">("map");
  const [sortKey, setSortKey] = useState<SortKey>("bust");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const base = ZONES.map((z) => {
      const info = getZoneTimeline(z, REGIMES)[day - 1];
      return { zone: z, info, delta: info.corr - info.raw };
    });
    const usable = base.filter((r) => r.info.hasData);
    const dir = sortDir === "asc" ? 1 : -1;
    return usable.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.zone.id.localeCompare(b.zone.id) * dir;
        case "raw":
          return (a.info.raw - b.info.raw) * dir;
        case "corr":
          return (a.info.corr - b.info.corr) * dir;
        case "delta":
          return (a.delta - b.delta) * dir;
        default:
          return (a.info.bust - b.info.bust) * dir;
      }
    });
  }, [day, sortKey, sortDir]);

  const zone = ZONES.find((z) => z.id === selectedId) ?? ZONES[0];
  const timeline = useMemo(() => getZoneTimeline(zone, REGIMES), [zone]);
  const current = timeline[day - 1];
  const tone = confidenceTone(current.bust);

  const priorityCount = ZONES.filter((z) => {
    const info = getZoneTimeline(z, REGIMES)[day - 1];
    return info.hasData && info.bust > 60;
  }).length;
  const noDataCount = ZONES.filter((z) => !getZoneTimeline(z, REGIMES)[day - 1].hasData).length;

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "name" ? "asc" : "desc");
    }
  };

  const reduce = useReducedMotion();

  return (
    <>
      <div className="shadow-xs">
        <StatusStrip
          day={day}
          zoneId={zone.id}
          priorityCount={priorityCount}
          noDataCount={noDataCount}
        />
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto max-w-[1240px] px-5 sm:px-8 py-8 md:py-10 space-y-6"
      >
        {/* Control bar / Hero Command Panel */}
        <Panel className="relative overflow-hidden rounded-2xl shadow-sm border border-[var(--ink)]/20">
          <Backdrop
            src="/img/bg-strip-pix.jpg"
            opacity={1}
            position="50% 42%"
            wash="none"
            pixelated
            pixelAnim
          />
          <div
            className="absolute inset-0 z-[1] bg-[linear-gradient(100deg,rgba(251,246,233,.97)_0%,rgba(251,246,233,.93)_38%,rgba(251,246,233,.58)_100%)]"
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-[2] pixel-grid-bg opacity-70" aria-hidden="true" />
          <div
            className="absolute -right-20 -top-24 z-[2] h-72 w-72 radar-rings opacity-80"
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-[2] pixel-dither-accent opacity-20" aria-hidden="true" />
          <span
            className="absolute inset-x-0 top-0 z-[5] h-2 bg-[var(--accent)]"
            aria-hidden="true"
          />
          <div className="relative z-[4] px-6 pb-5 pt-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-pixel text-[10px] uppercase tracking-wider text-[var(--accent)] font-semibold">
                Field terminal // dashboard
              </div>
              <h1 className="font-display mt-2 text-[1.75rem] sm:text-[2rem] uppercase leading-[1.1] truncate drop-shadow-xs text-[var(--ink)]">
                {zone.id} · {zone.name}
              </h1>
              <div className="mt-3">
                <RunStrip day={day} regime={current.regime} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <MetricToggle metric={metric} onChange={onMetricChange} />
              <DaySelector day={day} onChange={onDayChange} compact />
            </div>
          </div>
        </Panel>

        {/* Zone selector */}
        <Panel className="rounded-2xl shadow-xs border border-[var(--ink)]/20">
          <PanelHeader
            title="Monitored subdivisions"
            meta={`${ZONES.length} zones`}
            right={
              noDataCount > 0 ? <Chip tone="warn">{noDataCount} no data</Chip> : undefined
            }
          />
          <div className="p-3.5 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 xl:grid-cols-[repeat(15,minmax(0,1fr))] gap-2">
            {ZONES.map((z) => {
              const active = z.id === selectedId;
              const info = getZoneTimeline(z, REGIMES)[day - 1];
              const t = confidenceTone(info.bust);
              return (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => onSelect(z.id)}
                  aria-pressed={active}
                  title={`${z.name} — ${info.hasData ? `${info.bust}% bust` : "no data"}`}
                  className={`px-1.5 py-2 font-mono-code text-[10px] border rounded-lg truncate cursor-pointer transition-all duration-150 active:scale-95 ${
                    active
                      ? "accent-bg font-bold shadow-xs scale-105 z-10"
                      : info.hasData
                        ? "bg-[var(--surface)] text-[var(--muted)] border-[var(--ink)]/30 hover:bg-[var(--surface-2)] hover:text-[var(--ink)] hover:border-[var(--ink)]"
                        : "hatch-nodata bg-[var(--surface-2)] text-[var(--muted-dim)] border-[var(--ink)]/20"
                  }`}
                  style={
                    active
                      ? undefined
                      : info.hasData
                        ? { borderLeftColor: TONE_COLOR[t], borderLeftWidth: 3.5 }
                        : undefined
                  }
                >
                  {z.id}
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Map / table */}
          <Panel className="xl:col-span-7 flex flex-col rounded-2xl shadow-xs border border-[var(--ink)]/20 overflow-hidden">
            <PanelHeader
              title={view === "map" ? "Spatial map" : "Ranked table"}
              meta={`Day ${day} · ${metric}`}
              right={
                <div className="inline-flex border rounded-lg overflow-hidden shadow-xs border-[var(--ink)]">
                  {(["map", "table"] as const).map((v, i) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      aria-pressed={view === v}
                      className={`font-pixel text-[9px] uppercase tracking-[0.04em] px-3.5 py-2 cursor-pointer transition-colors active:scale-95 capitalize ${
                        view === v
                          ? "accent-bg font-bold"
                          : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                      } ${i > 0 ? "border-l border-[var(--ink)]" : ""}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              }
            />

            <AnimatePresence mode="wait" initial={false}>
              {view === "map" ? (
                <motion.div
                  key="map"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex-1 min-h-[440px]"
                >
                  <MapPanel
                    metric={metric}
                    day={day}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex-1 overflow-auto max-h-[520px]"
                >
                <table className="w-full text-left font-mono-code text-[11px] border-collapse">
                  <caption className="sr-only">
                    Monitored subdivisions for lead day {day}, sorted by {sortKey}
                  </caption>
                  <thead className="sticky top-0 bg-[var(--surface-2)] z-10 shadow-xs">
                    <tr className="text-[var(--muted-dim)] uppercase tracking-[0.08em] text-[9px]">
                      <th scope="col" className="px-3 py-3 font-normal border-b border-[var(--rule)]">
                        No.
                      </th>
                      {SORTS.map((s) => (
                        <th
                          key={s.key}
                          scope="col"
                          className="px-3 py-3 font-normal border-b border-[var(--rule)]"
                          aria-sort={
                            sortKey === s.key
                              ? sortDir === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            type="button"
                            onClick={() => toggleSort(s.key)}
                            className="hover:text-[var(--accent)] transition-colors cursor-pointer uppercase tracking-[0.08em] font-medium"
                          >
                            {s.label}
                            {sortKey === s.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                          </button>
                        </th>
                      ))}
                      <th scope="col" className="px-3 py-3 font-normal border-b border-[var(--rule)]">
                        Confidence
                      </th>
                      <th scope="col" className="px-3 py-3 font-normal border-b border-[var(--rule)]">
                        Quality
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => {
                      const t = confidenceTone(r.info.bust);
                      return (
                        <tr
                          key={r.zone.id}
                          onClick={() => onSelect(r.zone.id)}
                          className={`border-b border-[var(--rule-soft)] cursor-pointer transition-colors ${
                            r.zone.id === selectedId
                              ? "bg-[var(--surface-2)] font-semibold"
                              : "hover:bg-[var(--surface-2)]"
                          }`}
                        >
                          <td className="px-3 py-3 text-[var(--muted-dim)] tnum">
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td className="px-3 py-3 text-[var(--accent)] font-bold">
                            {r.zone.id}
                          </td>
                          <td className="px-3 py-3 text-[var(--muted)] max-w-[190px] truncate">
                            {r.zone.name}
                          </td>
                          <td className="px-3 py-3 tnum text-[var(--ink)]">{r.info.raw}mm</td>
                          <td className="px-3 py-3 tnum text-[var(--ink)]">{r.info.corr}mm</td>
                          <td className="px-3 py-3 tnum text-[var(--muted)]">
                            {r.delta > 0 ? "+" : ""}
                            {r.delta}mm
                          </td>
                          <td
                            className="px-3 py-3 tnum font-bold"
                            style={{ color: TONE_COLOR[t] }}
                          >
                            {r.info.bust}%
                          </td>
                          <td
                            className="px-3 py-3 text-[9px] uppercase tracking-[0.05em] font-medium"
                            style={{ color: TONE_COLOR[t] }}
                          >
                            {confidenceLabel(r.info.bust)}
                          </td>
                          <td className="px-3 py-3 text-[9px] uppercase tracking-[0.05em] text-[var(--muted-dim)]">
                            {r.info.quality}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--rule-soft)] border-t border-[var(--ink)]/20 bg-[var(--surface-2)]/50">
              {[
                ["Zone", zone.id],
                ["Raw → corrected", `${current.raw} → ${current.corr} mm`],
                [
                  "Bias delta",
                  `${current.corr - current.raw > 0 ? "+" : ""}${current.corr - current.raw} mm`,
                ],
                ["Bust probability", current.hasData ? `${current.bust}%` : "—"],
              ].map(([label, value]) => (
                <div key={label} className="px-4 py-3.5">
                  <div className="label uppercase tracking-wider text-[9px] text-[var(--muted-dim)]">{label}</div>
                  <div className="mt-1 font-mono-code text-[12px] text-[var(--ink)] tnum truncate font-bold">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Right column */}
          <div className="xl:col-span-5 flex flex-col gap-6">
            <Panel className="rounded-2xl shadow-xs border border-[var(--ink)]/20">
              <PanelHeader
                title="Heavy-rain exceedance"
                meta={`${zone.id} · D${day}`}
                right={
                  <Chip tone={tone}>
                    {current.hasData ? `${current.bust}% bust` : "no data"}
                  </Chip>
                }
              />
              <div className="p-4.5">
                <div className="grid grid-cols-3 gap-3">
                  {EXCEEDANCE_LEVELS.map((l) => (
                    <div
                      key={l.key}
                      className="border border-[var(--ink)]/25 bg-[var(--surface-2)] p-3.5 text-center shadow-[2px_2px_0_rgba(23,32,29,.08)] rounded-xl"
                    >
                      <div className="font-mono-code text-[10px] text-[var(--muted)] font-medium">
                        {l.label}
                      </div>
                      <div className="mt-1.5 font-display text-[1.5rem] leading-none text-[var(--ink)] tnum">
                        {current.hasData ? (
                          <AnimatedNumber value={current[l.key]} suffix="%" />
                        ) : (
                          "—"
                        )}
                      </div>
                      <ProgressBar
                        value={current.hasData ? current[l.key] : 0}
                        color="var(--accent)"
                        className="mt-2.5"
                      />
                      <div className="mt-2 font-pixel text-[7px] uppercase tracking-[0.02em] text-[var(--muted-dim)]">
                        {l.caption}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-[var(--rule-soft)] pt-4">
                  <div className="label uppercase tracking-wider text-[9px] text-[var(--muted-dim)]">Diagnostic note</div>
                  <p className="mt-2 text-[13px] leading-[1.7] text-[var(--ink-2)] font-medium">
                    {zone.reason}
                  </p>
                  <Caveat className="mt-3">
                    Authored demo copy — not a computed attribution.
                  </Caveat>
                </div>
              </div>
            </Panel>

            <Panel className="flex-1 flex flex-col rounded-2xl shadow-xs border border-[var(--ink)]/20">
              <PanelHeader title="Forecast vs verifying obs" meta={`${zone.id} · mm`} />
              <div className="p-4.5 flex-1">
                <ForecastChart data={timeline} />
              </div>
            </Panel>
          </div>
        </div>

        {/* Horizon scrubber */}
        <Panel className="rounded-2xl shadow-xs border border-[var(--ink)]/20">
          <PanelHeader
            title="Ten-day horizon"
            meta={`${zone.name} (${zone.id})`}
            right={
              noDataCount > 0 ? (
                <Chip tone="warn">
                  {noDataCount} zone{noDataCount > 1 ? "s" : ""} no data
                </Chip>
              ) : undefined
            }
          />
          <div className="p-3.5 grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {timeline.map((d) => {
              const active = d.day === day;
              const t = confidenceTone(d.bust);
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => onDayChange(d.day)}
                  aria-pressed={active}
                  className={`p-3 text-left border rounded-xl transition-all active:scale-95 cursor-pointer ${
                    active
                      ? "accent-bg border-[var(--ink)] shadow-xs scale-[1.02] z-10"
                      : d.hasData
                        ? "bg-[var(--surface)] border-[var(--ink)]/20 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:border-[var(--ink)]/40"
                        : "hatch-nodata bg-[var(--surface-2)] border-[var(--ink)]/20 text-[var(--muted-dim)]"
                  }`}
                >
                  <div className="flex items-baseline justify-between font-mono-code text-[11px]">
                    <span className={active ? "font-bold" : "font-semibold text-[var(--ink)]"}>D{d.day}</span>
                    <span className={active ? "font-semibold" : "font-medium"}>
                      {d.hasData ? `${d.bust}%` : "no data"}
                    </span>
                  </div>
                  {d.hasData ? (
                    <>
                      <div className="mt-1 font-mono-code text-[10px] tnum text-[var(--ink-2)] font-medium">
                        {d.raw} → {d.corr} mm
                      </div>
                      <ProgressBar
                        value={d.bust}
                        color={active ? "var(--paper)" : TONE_COLOR[t]}
                        className="mt-2.5"
                      />
                    </>
                  ) : (
                    <div className="mt-1 font-mono-code text-[9px] uppercase font-medium">{d.quality}</div>
                  )}
                  <div className="mt-2 font-mono-code text-[9px] truncate opacity-75 font-medium">
                    {d.regime}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Caveat className="max-w-3xl">
          Probability bands follow the prototype default only and are not calibrated. Day 6–10
          has no verifying observation available, so bust risk for those days is an estimate
          without a verification signal.
        </Caveat>
      </motion.div>
    </>
  );
}
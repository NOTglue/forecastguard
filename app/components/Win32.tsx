"use client";

import { EXCEEDANCE_LEVELS, REGIMES, ZONES } from "@/app/data/zones";
import { confidenceLabel, getZoneTimeline } from "@/app/lib/timeline";
import ForecastChart from "./ForecastChart";
import MapPanel from "./MapPanel";
import { Caveat, MetricToggle } from "./ui";

type Props = {
  day: number;
  onDayChange: (d: number) => void;
  metric: "RAW" | "CORR" | "BUST";
  onMetricChange: (m: "RAW" | "CORR" | "BUST") => void;
  selectedId: string;
  onSelect: (id: string) => void;
};

const CRT = "border border-[#2b4a45] bg-[#081311]";
const CRT_HEAD = "border-b border-[#2b4a45] bg-[#0d1c1a]";
const MINT = "text-[var(--mint)]";
const DIM = "text-[var(--mint-dim)]";

export default function Win32({
  day,
  onDayChange,
  metric,
  onMetricChange,
  selectedId,
  onSelect,
}: Props) {
  const zone = ZONES.find((z) => z.id === selectedId) ?? ZONES[0];
  const timeline = getZoneTimeline(zone, REGIMES);
  const current = timeline[day - 1];

  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-8 md:py-10">
      <div className="mb-5">
        <div className="font-pixel text-[9px] uppercase text-[var(--accent)]">
          Wall display mode
        </div>
        <h1 className="font-display mt-1 text-[1.6rem] sm:text-[1.9rem] uppercase leading-none text-[var(--ink)]">
          OPS-9 CRT console
        </h1>
        <p className="mt-2 max-w-2xl text-[12px] leading-[1.8] text-[var(--muted)]">
          A dense phosphor terminal over the same synthetic dataset. Every panel here reads
          from the identical series as the field dashboard, formatted for a wall display.
        </p>
      </div>

      <div className="screen-dark relative overflow-hidden border-2 border-[var(--ink)] shadow-[6px_6px_0_var(--ink)]">
        <span
          className="pointer-events-none absolute inset-0 z-30 scanlines"
          aria-hidden="true"
        />

        <div className="relative z-20">
          {/* Title bar */}
          <div className="flex items-center justify-between gap-3 border-b-2 border-[#2b4a45] bg-[#101f22] px-3 py-2 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-block h-2.5 w-2.5 shrink-0 bg-[var(--coral)] blink" />
              <span className="font-pixel text-[10px] uppercase tracking-[0.03em] text-[var(--mint)] truncate">
                FG_OPS-9 // {zone.id} · DAY {day}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline font-mono-code text-[9px] text-[var(--signal)]">
                PHOSPHOR AMBER
              </span>
              <span className="flex gap-1" aria-hidden="true">
                {["_", "□", "×"].map((g) => (
                  <span
                    key={g}
                    className="grid h-4 w-5 place-items-center border border-[#2b4a45] font-mono-code text-[9px] text-[var(--mint-dim)]"
                  >
                    {g}
                  </span>
                ))}
              </span>
            </div>
          </div>

          {/* Menu bar */}
          <div className="flex flex-wrap gap-4 border-b border-[#2b4a45] px-3 py-1.5 font-pixel text-[8px] uppercase tracking-[0.03em]">
            {["File", "View", "Metrics", "Zones", "Help"].map((m) => (
              <span key={m} className="cursor-default text-[var(--mint-dim)] hover:text-[var(--mint)]">
                {m}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 p-3">
            {/* Toolbar */}
            <div className={`${CRT} flex flex-wrap items-center justify-between gap-2 p-2`}>
              <MetricToggle metric={metric} onChange={onMetricChange} tone="retro" />
              <div className="font-mono-code text-[10px] uppercase tracking-[0.04em] text-[var(--signal)]">
                ZONE {zone.id} · DAY {day} · {current.regime}
              </div>
            </div>

            {/* Zone selector */}
            <div className={`${CRT} p-2`}>
              <div className="mb-1.5 font-pixel text-[8px] uppercase tracking-[0.03em] text-[var(--mint-dim)]">
                Subdivision selector / 15 zones
              </div>
              <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 md:grid-cols-8 xl:grid-cols-[repeat(15,minmax(0,1fr))]">
                {ZONES.map((z) => {
                  const active = z.id === selectedId;
                  const info = getZoneTimeline(z, REGIMES)[day - 1];
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => onSelect(z.id)}
                      aria-pressed={active}
                      title={z.name}
                      className={`border px-1 py-1 font-mono-code text-[10px] truncate cursor-pointer transition-colors ${
                        active
                          ? "border-[var(--mint)] bg-[var(--mint)] font-bold text-[#06100d]"
                          : info.hasData
                            ? "border-[#2b4a45] bg-[#0b1a18] text-[var(--mint-dim)] hover:border-[var(--mint-dim)] hover:text-[var(--mint)]"
                            : "border-[#243a36] bg-[#0a1412] text-[#46615a] line-through"
                      }`}
                    >
                      {z.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className={`${CRT} flex min-h-[420px] flex-col lg:col-span-7`}>
                <div className="w-full min-h-[300px] flex-1">
                  <MapPanel
                    metric={metric}
                    day={day}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    variant="retro"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-[#2b4a45] bg-[#0d1c1a] p-2 font-mono-code text-[10px] sm:grid-cols-4">
                  <div>
                    <span className={DIM}>ZONE </span>
                    <span className={MINT}>{zone.id}</span>
                  </div>
                  <div>
                    <span className={DIM}>RAW→CORR </span>
                    <span className={MINT}>
                      {current.raw}→{current.corr}mm
                    </span>
                  </div>
                  <div>
                    <span className={DIM}>DELTA </span>
                    <span className={MINT}>{current.corr - current.raw}mm</span>
                  </div>
                  <div>
                    <span className={DIM}>BUST </span>
                    <span className="font-bold text-[var(--signal)]">
                      {current.hasData ? `${current.bust}%` : "NO DATA"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-5">
                <div className={CRT}>
                  <div className={`${CRT_HEAD} px-3 py-1.5 font-pixel text-[8px] uppercase tracking-[0.03em] ${DIM}`}>
                    Heavy rain exceedance · {zone.id} · D{day}
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2 text-center">
                    {EXCEEDANCE_LEVELS.map((l) => (
                      <div key={l.key} className="border border-[#2b4a45] bg-[#0b1a18] p-1.5">
                        <div className="font-mono-code text-[9px] text-[var(--mint-dim)]">
                          {l.label}
                        </div>
                        <div className="font-display text-[1.15rem] leading-none text-[var(--signal)]">
                          {current.hasData ? `${current[l.key]}%` : "—"}
                        </div>
                        <div className="mt-1 font-pixel text-[6px] uppercase tracking-[0.02em] text-[#46615a]">
                          {l.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mx-2 mb-2 border border-[#2b4a45] bg-[#0b1a18] p-2 font-mono-code text-[10px] leading-[1.7] text-[var(--mint-dim)]">
                    <span className="text-[var(--signal)]">DIAG&gt;</span> {zone.reason}
                  </div>
                </div>

                <div className={`${CRT} flex min-h-[200px] flex-1 flex-col p-2`}>
                  <div className="mb-1 font-pixel text-[8px] uppercase tracking-[0.03em] text-[var(--mint-dim)]">
                    {zone.id} rainfall waveform (mm)
                  </div>
                  <div className="w-full flex-1">
                    <ForecastChart data={timeline} variant="retro" />
                  </div>
                </div>
              </div>
            </div>

            {/* Horizon */}
            <div className={`${CRT} p-2`}>
              <div className="mb-1.5 font-pixel text-[8px] uppercase tracking-[0.03em] text-[var(--mint-dim)]">
                Select horizon lead day · {zone.id}
              </div>
              <div className="grid grid-cols-5 gap-1 sm:grid-cols-10">
                {timeline.map((d) => {
                  const active = d.day === day;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => onDayChange(d.day)}
                      aria-pressed={active}
                      className={`border p-1 text-center font-mono-code cursor-pointer transition-colors ${
                        active
                          ? "border-[var(--signal)] bg-[var(--signal)] text-[#1a1200]"
                          : d.hasData
                            ? "border-[#2b4a45] bg-[#0b1a18] text-[var(--mint-dim)] hover:border-[var(--mint-dim)] hover:text-[var(--mint)]"
                            : "border-[#243a36] bg-[#0a1412] text-[#46615a]"
                      }`}
                    >
                      <div className="text-[10px] font-bold">
                        D{d.day} ({d.hasData ? `${d.bust}%` : "n/a"})
                      </div>
                      <div className="text-[9px] opacity-80">
                        {d.hasData ? `${d.raw}→${d.corr}` : d.quality}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-2 border-t border-[#2b4a45] bg-[#101f22] px-3 py-1.5 font-mono-code text-[9px]">
            <div className="flex-1 truncate text-[var(--mint-dim)]">
              {zone.id} · D{day} · {current.regime} ·{" "}
              <span className={MINT}>
                {current.hasData ? confidenceLabel(current.bust) : "no data"}
              </span>
            </div>
            <div className="shrink-0 border border-[var(--signal)] px-1.5 py-0.5 font-pixel text-[7px] uppercase text-[var(--signal)]">
              Simulated data — demo build
            </div>
          </div>
        </div>
      </div>

      <Caveat className="mt-4">
        Ops console mode is a presentation skin over the same synthetic dataset. Values are not
        derived from a live NWP run and no model is connected.
      </Caveat>
    </div>
  );
}

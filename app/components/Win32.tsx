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

/* Win95-style bevels */
const SUNKEN = "border border-t-[#7a7a7a] border-l-[#7a7a7a] border-r-white border-b-white";
const RAISED = "border border-t-white border-l-white border-r-[#7a7a7a] border-b-[#7a7a7a]";

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
        <div className="label text-[var(--accent)]">Retro interface</div>
        <h1 className="font-display mt-1 text-[1.55rem] sm:text-[1.8rem] leading-tight text-[var(--ink)]">
          Win32 telemetry console
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">
          A dense, high-contrast skin over the same synthetic dataset. Every panel here reads
          from the identical series as the web dashboard.
        </p>
      </div>

      <div className="bg-[#c3c3c3] border border-t-white border-l-white border-r-[#7a7a7a] border-b-[#7a7a7a] shadow-[2px_2px_0_rgba(20,23,26,0.12)] flex flex-col font-mono text-black text-[12px]">
        {/* Title bar */}
        <div className="bg-[#243a63] text-white px-2 py-1.5 flex justify-between items-center text-[12px] font-bold select-none">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-3.5 h-3.5 bg-[#962a26] inline-block border border-black shrink-0" />
            <span className="truncate">
              ForecastGuard_v2.exe — [{zone.id} · Day {day} telemetry analyzer]
            </span>
          </div>
          <div className="flex gap-1 shrink-0" aria-hidden="true">
            {["_", "□", "✕"].map((g) => (
              <span
                key={g}
                className="bg-[#c3c3c3] text-black w-6 h-5 leading-[18px] text-center border border-t-white border-l-white border-r-[#7a7a7a] border-b-[#7a7a7a] text-[10px] font-bold"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <div className="bg-[#c3c3c3] border-b border-[#7a7a7a] px-2 py-1 flex flex-wrap gap-1">
          {["File", "Edit", "View", "Metrics", "Help"].map((m) => (
            <span
              key={m}
              className="cursor-default px-1.5 hover:bg-[#243a63] hover:text-white"
            >
              <u>{m[0]}</u>
              {m.slice(1)}
            </span>
          ))}
        </div>

        <div className="p-3 flex flex-col gap-3">
          {/* Toolbar */}
          <div className={`${SUNKEN} p-2 flex flex-wrap items-center justify-between gap-2`}>
            <MetricToggle metric={metric} onChange={onMetricChange} tone="retro" />
            <div className="font-bold text-[#243a63]">
              ZONE: {zone.id} · DAY {day} · {current.regime}
            </div>
          </div>

          {/* Zone selector */}
          <div className={`${SUNKEN} p-2`}>
            <div className="font-bold mb-1">Subdivision selector (15 zones):</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 xl:grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
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
                    className={`px-1 py-1 border text-[10px] truncate cursor-pointer ${
                      active
                        ? "bg-[#243a63] text-white font-bold border-[#1b2c4d]"
                        : info.hasData
                          ? "bg-[#c3c3c3] text-black border-[#7a7a7a] hover:bg-[#d2d2d2]"
                          : "bg-[#c3c3c3] text-[#6f6f6f] border-[#7a7a7a]"
                    }`}
                  >
                    {z.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className={`${SUNKEN} lg:col-span-7 bg-white flex flex-col min-h-[420px]`}>
              <div className="flex-1 w-full min-h-[300px]">
                <MapPanel
                  metric={metric}
                  day={day}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  variant="retro"
                />
              </div>
              <div className="bg-[#c3c3c3] p-2 border-t border-t-[#7a7a7a] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <b>Zone:</b> {zone.id}
                </div>
                <div>
                  <b>Raw→Corr:</b> {current.raw}→{current.corr}mm
                </div>
                <div>
                  <b>Delta:</b> {current.corr - current.raw}mm
                </div>
                <div>
                  <b>Bust:</b>{" "}
                  <span className="text-[#962a26] font-bold">
                    {current.hasData ? `${current.bust}%` : "NO DATA"}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className={`${SUNKEN} p-3 bg-[#c3c3c3]`}>
                <div className="font-bold border-b border-[#7a7a7a] pb-1 mb-2">
                  IMD heavy rain exceedance · {zone.id} · Day {day}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {EXCEEDANCE_LEVELS.map((l) => (
                    <div key={l.key} className="bg-white border border-[#7a7a7a] p-1.5">
                      <div className="text-[9px]">{l.label}</div>
                      <div className="font-bold text-[14px]">
                        {current.hasData ? `${current[l.key]}%` : "—"}
                      </div>
                      <div className="text-[8px] uppercase opacity-60">{l.caption}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] bg-white border border-[#7a7a7a] p-2 leading-relaxed">
                  <b>Diagnostic:</b> {zone.reason}
                </div>
              </div>

              <div className={`${SUNKEN} bg-white p-2 flex-1 flex flex-col min-h-[200px]`}>
                <div className="text-[11px] font-bold mb-1">
                  {zone.id} rainfall forecast waveform (mm)
                </div>
                <div className="flex-1 w-full">
                  <ForecastChart data={timeline} variant="retro" />
                </div>
              </div>
            </div>
          </div>

          {/* Horizon */}
          <div className={`${SUNKEN} p-2`}>
            <div className="text-[11px] font-bold mb-1">
              Select horizon lead day · {zone.id}:
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
              {timeline.map((d) => {
                const active = d.day === day;
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => onDayChange(d.day)}
                    aria-pressed={active}
                    className={`p-1 text-center text-[11px] border cursor-pointer ${
                      active
                        ? "bg-[#243a63] text-white border-[#1b2c4d] font-bold"
                        : d.hasData
                          ? "bg-[#c3c3c3] border-[#7a7a7a] text-black hover:bg-[#d2d2d2]"
                          : "bg-[#c3c3c3] border-[#7a7a7a] text-[#6f6f6f]"
                    }`}
                  >
                    <div>
                      D{d.day} ({d.hasData ? `${d.bust}%` : "n/a"})
                    </div>
                    <div className="text-[9px]">
                      {d.hasData ? `${d.raw}→${d.corr}` : d.quality}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="bg-[#c3c3c3] border-t border-t-white flex items-center gap-2 p-1.5 text-[10px]">
          <div className={`${RAISED} px-2 py-0.5 flex-1 truncate`}>
            {zone.id} · D{day} · {current.regime} ·{" "}
            {current.hasData ? confidenceLabel(current.bust) : "no data"}
          </div>
          <div className={`${RAISED} px-2 py-0.5 shrink-0 text-[#243a63] font-bold`}>
            SIMULATED DATA — DEMO BUILD
          </div>
        </div>
      </div>

      <Caveat className="mt-4">
        Retro mode is a presentation skin over the same synthetic dataset. Values are not
        derived from a live NWP run and no model is connected.
      </Caveat>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// pure local mock data - no api keys or fetches needed
const monsoonTimeline = [
  { day: 1, regime: "ACTIVE_TROUGH", raw: 82, corr: 96, obs: 94, bust: 18 },
  { day: 2, regime: "ACTIVE_TROUGH", raw: 110, corr: 134, obs: 129, bust: 25 },
  { day: 3, regime: "BAY_DEPRESSION", raw: 175, corr: 130, obs: 124, bust: 54 },
  { day: 4, regime: "DEEP_DEPRESSION", raw: 210, corr: 145, obs: 138, bust: 76 },
  { day: 5, regime: "CYCLONIC_SURGE", raw: 160, corr: 115, obs: 112, bust: 68 },
  { day: 6, regime: "WD_INTERACTION", raw: 95, corr: 80, obs: null, bust: 49 },
  { day: 7, regime: "BREAK_ONSET", raw: 45, corr: 38, obs: null, bust: 42 },
  { day: 8, regime: "MONSOON_BREAK", raw: 25, corr: 22, obs: null, bust: 35 },
  { day: 9, regime: "FOOTHILL_LOCK", raw: 60, corr: 88, obs: null, bust: 64 },
  { day: 10, regime: "EASTERLY_WAVE", raw: 70, corr: 62, obs: null, bust: 72 },
];

// circular radar zones (radius in meters)
const radarZones = [
  {
    id: "ODISHA-07",
    name: "NORTH BAY // ODISHA",
    coords: [20.3, 85.8] as [number, number],
    radius: 230000,
    rawRain: 194,
    corrRain: 138,
    bustProb: 76,
    ex64: 91,
    ex115: 72,
    ex204: 28,
    note: "GFS CONVECTIVE CORE OVER-PREDICTION (+56MM BIAS VS IMD GRID)",
  },
  {
    id: "KONKAN-23",
    name: "WESTERN GHATS // KONKAN",
    coords: [18.2, 73.4] as [number, number],
    radius: 210000,
    rawRain: 88,
    corrRain: 146,
    bustProb: 68,
    ex64: 86,
    ex115: 64,
    ex204: 19,
    note: "OROGRAPHIC LIFT UNDER-RESOLVED IN RAW 0.25 DEG RUN (-58MM)",
  },
  {
    id: "GANGA-10",
    name: "GANGETIC TROUGH AXIS",
    coords: [25.4, 83.0] as [number, number],
    radius: 250000,
    rawRain: 62,
    corrRain: 54,
    bustProb: 34,
    ex64: 42,
    ex115: 14,
    ex204: 3,
    note: "MERIDIONAL TROUGH OSCILLATION WITHIN NORMAL ENSEMBLE SPREAD",
  },
  {
    id: "DECCAN-31",
    name: "LEEWARD DECCAN CORE",
    coords: [15.6, 76.8] as [number, number],
    radius: 200000,
    rawRain: 14,
    corrRain: 12,
    bustProb: 14,
    ex64: 6,
    ex115: 1,
    ex204: 0,
    note: "QUIESCENT SYNOPTIC FLOW // LOW HISTORICAL ERROR VARIANCE",
  },
];

export default function RadarScopeUI() {
  const [day, setDay] = useState<number>(4);
  const [layer, setLayer] = useState<"RAW" | "CORR" | "BUST">("RAW");
  const [target, setTarget] = useState(radarZones[0]);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const circlesRef = useRef<any>(null);

  const activeDay = monsoonTimeline[day - 1];

  useEffect(() => {
    if (typeof window === "undefined" || !mapEl.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (!mapRef.current && mapEl.current) {
        const m = L.map(mapEl.current, {
          center: [21.0, 80.0],
          zoom: 5,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png").addTo(m);
        circlesRef.current = L.layerGroup().addTo(m);
        mapRef.current = m;
      }

      if (circlesRef.current) {
        circlesRef.current.clearLayers();

        radarZones.forEach((z) => {
          const isLocked = z.id === target.id;
          const color =
            layer === "RAW"
              ? "#00f5d4"
              : layer === "CORR"
              ? "#aacc00"
              : z.bustProb > 60
              ? "#ff0055"
              : "#ffbe0b";

          const valText =
            layer === "RAW"
              ? `${z.rawRain}MM`
              : layer === "CORR"
              ? `${z.corrRain}MM`
              : `${z.bustProb}% BUST`;

          // outer range circle
          const outerCircle = L.circle(z.coords, {
            radius: z.radius,
            color: isLocked ? "#ffffff" : color,
            weight: isLocked ? 2.5 : 1.2,
            dashArray: isLocked ? undefined : "6 6",
            fillColor: color,
            fillOpacity: isLocked ? 0.28 : 0.1,
          });

          // inner bullseye core circle
          const innerCore = L.circle(z.coords, {
            radius: z.radius * 0.35,
            color: color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.45,
          });

          outerCircle.bindTooltip(
            `<div style="font-family:monospace;font-size:11px;color:${color};background:rgba(2,6,4,0.92);padding:3px 8px;border-left:3px solid ${color};letter-spacing:1px;">
              [${z.id}] <b>${valText}</b>
            </div>`,
            { permanent: true, direction: "right", className: "bg-transparent border-0 shadow-none" }
          );

          outerCircle.on("click", () => {
            setTarget(z);
            mapRef.current?.flyTo(z.coords, 6, { duration: 0.8 });
          });
          innerCore.on("click", () => {
            setTarget(z);
            mapRef.current?.flyTo(z.coords, 6, { duration: 0.8 });
          });

          outerCircle.addTo(circlesRef.current);
          innerCore.addTo(circlesRef.current);
        });
      }
    });
  }, [layer, target, day]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020504] text-[#d8f3dc] font-mono select-none">
      {/* FULLSCREEN LEAFLET MAP WITH DOPPLER CRT TINT */}
      <div
        ref={mapEl}
        className="
          absolute inset-0 w-full h-full z-0
          [filter:contrast(1.25)_brightness(0.85)_hue-rotate(15deg)]
        "
      />

      {/* DECORATIVE POLAR RADAR CROSSHAIRS OVERLAY */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
        <div className="w-[780px] h-[780px] rounded-full border border-[#00f5d4]/15 flex items-center justify-center">
          <div className="w-[520px] h-[520px] rounded-full border border-dashed border-[#00f5d4]/20 flex items-center justify-center">
            <div className="w-[260px] h-[260px] rounded-full border border-[#ff0055]/20" />
          </div>
        </div>
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f5d4]/15 to-transparent" />
        <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[#00f5d4]/15 to-transparent" />
      </div>

      {/* TOP-LEFT ANGLED BLADE: SYSTEM LOCK & MONSOON REGIME */}
      <div
        className="absolute top-5 left-5 z-20 bg-[#040b08]/90 backdrop-blur-md border-l-4 border-[#00f5d4] p-4 w-[370px] shadow-[0_0_40px_rgba(0,245,212,0.12)]"
        style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
      >
        <div className="text-[10px] tracking-[0.25em] text-[#00f5d4] flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00f5d4] animate-ping" />
          SIH26079 // DOPPLER BUST INTERCEPTOR
        </div>
        <div className="text-xl font-black tracking-tight text-white mt-0.5">
          {activeDay.regime}
        </div>
        <div className="text-[11px] text-[#74c69d] mt-1">
          LEAD: <b className="text-white">DAY 0{day} (+{day * 24}H)</b> // SECTOR:{" "}
          <b className="text-[#ffbe0b]">{target.id}</b>
        </div>
      </div>

      {/* TOP-CENTER FLOATING PILL: RAW vs CORRECTED vs BUST SWITCH */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#040b08]/90 border border-[#00f5d4]/30 px-3 py-2 rounded-full backdrop-blur-md">
        {(
          [
            { id: "RAW", label: "01. RAW_GFS_FIELD", color: "bg-[#00f5d4] text-black" },
            { id: "CORR", label: "02. AI_CORRECTED", color: "bg-[#aacc00] text-black" },
            { id: "BUST", label: "03. BUST_RISK_RADAR", color: "bg-[#ff0055] text-white" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => setLayer(m.id)}
            className={`px-4 py-1 rounded-full text-xs font-bold tracking-wider transition-all ${
              layer === m.id
                ? `${m.color} shadow-[0_0_15px_currentColor]`
                : "text-[#74c69d] hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}
        <button
          onClick={() => mapRef.current?.flyTo([21.0, 80.0], 5, { duration: 0.7 })}
          className="ml-2 px-2.5 py-1 text-[10px] border border-[#00f5d4]/40 rounded-full text-[#00f5d4] hover:bg-[#00f5d4]/10"
        >
          RESET_OPTICS
        </button>
      </div>

      {/* BOTTOM-LEFT RADIAL DIAL: 10-DAY MONSOON HORIZON */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
        <div className="text-[10px] tracking-[0.2em] text-[#74c69d] uppercase">
          // 10-DAY SYNOPTIC RING [CLICK NODE]
        </div>
        <div className="flex items-center gap-2 bg-[#040b08]/90 border border-[#00f5d4]/30 p-2.5 rounded-full backdrop-blur-md">
          {monsoonTimeline.map((item) => {
            const selected = item.day === day;
            const danger = item.bust >= 60;
            return (
              <button
                key={item.day}
                onClick={() => setDay(item.day)}
                className={`w-11 h-11 rounded-full flex flex-col items-center justify-center text-[10px] font-bold transition-all border ${
                  selected
                    ? "bg-[#00f5d4] text-black border-white scale-110 shadow-[0_0_20px_#00f5d4]"
                    : danger
                    ? "bg-[#ff0055]/15 text-[#ff0055] border-[#ff0055]/50 hover:scale-105"
                    : "bg-[#081c15] text-[#95d5b2] border-[#00f5d4]/20 hover:border-[#00f5d4]"
                }`}
              >
                <span>D{item.day}</span>
                <span className="text-[8px] opacity-80">{item.bust}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT FLOATING ANGLED TELEMETRY HUD: GAUGES + OSCILLOSCOPE CHART */}
      <div
        className="absolute top-5 right-5 bottom-5 z-20 w-[410px] bg-[#040b08]/92 backdrop-blur-md border-r-4 border-[#ff0055] p-5 flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.9)]"
        style={{ clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0 100%, 0 6%)" }}
      >
        {/* TARGET HEADER & RAW VS CORRECTED DELTA */}
        <div>
          <div className="flex items-center justify-between border-b border-[#00f5d4]/20 pb-2">
            <div>
              <span className="text-[10px] text-[#ffbe0b] tracking-widest">LOCKED_SECTOR</span>
              <h2 className="text-base font-black text-white">{target.name}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#ff0055] block">BUST PROB</span>
              <span className="text-2xl font-black text-[#ff0055]">{target.bustProb}%</span>
            </div>
          </div>

          {/* TRI-METRIC RAW vs CORRECTED READOUT */}
          <div className="grid grid-cols-3 gap-2 my-3 text-center">
            <div className="bg-[#081c15]/70 border border-[#00f5d4]/30 p-2">
              <span className="text-[9px] text-[#74c69d] block">RAW GFS</span>
              <span className="text-lg font-black text-[#00f5d4]">{target.rawRain}mm</span>
            </div>
            <div className="bg-[#081c15]/70 border border-[#aacc00]/40 p-2">
              <span className="text-[9px] text-[#74c69d] block">AI CORRECTED</span>
              <span className="text-lg font-black text-[#aacc00]">{target.corrRain}mm</span>
            </div>
            <div className="bg-[#081c15]/70 border border-[#ffbe0b]/40 p-2">
              <span className="text-[9px] text-[#74c69d] block">BIAS SHIFT</span>
              <span className="text-lg font-black text-[#ffbe0b]">
                {target.corrRain - target.rawRain > 0 ? "+" : ""}
                {target.corrRain - target.rawRain}mm
              </span>
            </div>
          </div>
        </div>

        {/* CIRCULAR EXCEEDANCE RINGS (>64.5mm, >115.5mm, >204.5mm) */}
        <div>
          <div className="text-[10px] tracking-widest text-[#74c69d] mb-2">
            // HEAVY-RAIN EXCEEDANCE RINGS (IMD)
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: ">64.5MM", sub: "HEAVY", val: target.ex64, stroke: "#00f5d4" },
              { label: ">115.5MM", sub: "V.HEAVY", val: target.ex115, stroke: "#ffbe0b" },
              { label: ">204.5MM", sub: "EXTREME", val: target.ex204, stroke: "#ff0055" },
            ].map((ring) => {
              const r = 26;
              const circ = 2 * Math.PI * r;
              const offset = circ - (ring.val / 100) * circ;
              return (
                <div
                  key={ring.label}
                  className="bg-[#071510] border border-[#00f5d4]/15 py-2 flex flex-col items-center"
                >
                  <svg className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r={r}
                      stroke="#1b4332"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={r}
                      stroke={ring.stroke}
                      strokeWidth="5"
                      strokeDasharray={circ}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="text-xs font-black text-white -mt-10 mb-5">{ring.val}%</span>
                  <span className="text-[10px] font-bold" style={{ color: ring.stroke }}>
                    {ring.label}
                  </span>
                  <span className="text-[8px] text-[#74c69d]">{ring.sub}</span>
                </div>
              );
            })}
          </div>

          {/* DIAGNOSTIC TELEMETRY STRIP */}
          <div className="mt-3 p-2.5 bg-[#ff0055]/10 border-l-2 border-[#ff0055] text-[11px] text-[#ffccd5]">
            <b className="text-[#ff0055]">SIGNAL_ANOMALY:</b> {target.note}
          </div>
        </div>

        {/* OSCILLOSCOPE WAVEFORM: FORECAST VS IMD OBSERVED */}
        <div className="h-[195px] flex flex-col">
          <div className="text-[10px] tracking-widest text-[#74c69d] mb-1">
            // WAVEFORM: RAW (CYAN) vs CORR (LIME) vs IMD_OBS (WHITE)
          </div>
          <div className="flex-1 bg-[#020806] border border-[#00f5d4]/20 p-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monsoonTimeline}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  tickFormatter={(d) => `D${d}`}
                  stroke="#52b788"
                  fontSize={10}
                />
                <YAxis stroke="#52b788" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020504",
                    borderColor: "#00f5d4",
                    fontSize: "10px",
                  }}
                />
                <ReferenceLine y={115.5} stroke="#ff0055" strokeDasharray="2 2" />
                <Bar dataKey="raw" name="Raw GFS" fill="#00f5d4" fillOpacity={0.35} barSize={10} />
                <Line
                  type="stepAfter"
                  dataKey="corr"
                  name="AI Corrected"
                  stroke="#aacc00"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="obs"
                  name="IMD Gridded Obs"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
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

const timelineData = [
  { day: 1, regime: "ACTIVE_TROUGHS", raw: 82, corr: 96, obs: 94, bust: 18 },
  { day: 2, regime: "ACTIVE_TROUGHS", raw: 110, corr: 134, obs: 129, bust: 25 },
  { day: 3, regime: "BAY_DEPRESSION", raw: 175, corr: 130, obs: 124, bust: 54 },
  { day: 4, regime: "DEEP_DEPRESSION", raw: 210, corr: 145, obs: 138, bust: 76 },
  { day: 5, regime: "CYCLONIC_SURGE", raw: 160, corr: 115, obs: 112, bust: 68 },
  { day: 6, regime: "WD_INTERACTION", raw: 95, corr: 80, obs: null, bust: 49 },
  { day: 7, regime: "BREAK_ONSET", raw: 45, corr: 38, obs: null, bust: 42 },
  { day: 8, regime: "MONSOON_BREAK", raw: 25, corr: 22, obs: null, bust: 35 },
  { day: 9, regime: "FOOTHILL_LOCK", raw: 60, corr: 88, obs: null, bust: 64 },
  { day: 10, regime: "EASTERLY_WAVE", raw: 70, corr: 62, obs: null, bust: 72 },
];

const subdivisionZones = [
  {
    id: "GANGA-10",
    name: "Gangetic Plain Sector",
    coords: [25.4, 83.0] as [number, number],
    radius: 240000,
    rawRain: 62,
    corrRain: 54,
    bustProb: 34,
    ex64: 42,
    ex115: 14,
    ex204: 3,
    reason: "The trough axis is shifting slightly within normal ensemble limits, keeping totals close to typical seasonal averages.",
  },
  {
    id: "ODISHA-07",
    name: "Coastal Odisha & North Bay",
    coords: [20.3, 85.8] as [number, number],
    radius: 220000,
    rawRain: 194,
    corrRain: 138,
    bustProb: 76,
    ex64: 91,
    ex115: 72,
    ex204: 28,
    reason: "The raw GFS model is heavily overestimating convective strength here, pumping up numbers by about 56mm compared to actual IMD observations.",
  },
  {
    id: "KONKAN-23",
    name: "Konkan, Goa & Western Ghats",
    coords: [18.2, 73.4] as [number, number],
    radius: 200000,
    rawRain: 88,
    corrRain: 146,
    bustProb: 68,
    ex64: 86,
    ex115: 64,
    ex204: 19,
    reason: "Because of its coarse grid resolution, the raw model completely misses the intense orographic lift happening along the Ghats, falling short by nearly 58mm.",
  },
  {
    id: "DECCAN-31",
    name: "Deccan Interior Plateau",
    coords: [15.6, 76.8] as [number, number],
    radius: 190000,
    rawRain: 14,
    corrRain: 12,
    bustProb: 14,
    ex64: 6,
    ex115: 1,
    ex204: 0,
    reason: "Stable leeward winds are keeping conditions dry and predictable, showing almost no historical forecast variance.",
  },
];

export default function ForecastGuardApp() {
  const [viewMode, setViewMode] = useState<"WIN32" | "WEB">("WEB");
  const [day, setDay] = useState<number>(4);
  const [metric, setMetric] = useState<"RAW" | "CORR" | "BUST">("RAW");
  const [zone, setZone] = useState(subdivisionZones[1]);

  const [mapCenter, setMapCenter] = useState<[number, number]>([23.0, 82.0]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  const mapNode = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<any>(null);

  const currentDayInfo = timelineData[day - 1];

  useEffect(() => {
    if (typeof window === "undefined" || !mapNode.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }

      const m = L.map(mapNode.current!, {
        center: mapCenter,
        zoom: mapZoom,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
      }).addTo(m);

      const group = L.layerGroup().addTo(m);
      leafletMap.current = m;

      m.on("moveend", () => {
        const center = m.getCenter();
        setMapCenter([center.lat, center.lng]);
      });

      m.on("zoomend", () => {
        setMapZoom(m.getZoom());
      });

      subdivisionZones.forEach((z) => {
        const selected = z.id === zone.id;

        const circle = L.circle(z.coords, {
          radius: z.radius,
          color: selected ? (viewMode === "WIN32" ? "#000080" : "#ffffff") : "#666666",
          weight: selected ? 2 : 1,
          fillColor: selected ? (viewMode === "WIN32" ? "#000080" : "#f59e0b") : "#222222",
          fillOpacity: selected ? 0.6 : 0.25,
        });

        circle.bindTooltip(
          `<div style="font-family:monospace;font-size:11px;font-weight:bold;background:#000000;color:#ffffff;padding:2px 6px;border:1px solid #ffffff;">
            ${z.id}
          </div>`,
          { permanent: true, direction: "center", className: "bg-transparent border-0 shadow-none" }
        );

        circle.on("click", () => {
          setZone(z);
          m.flyTo(z.coords, 6, { duration: 0.5 });
        });

        circle.addTo(group);
      });

      setTimeout(() => {
        m.invalidateSize();
      }, 100);
    });
  }, [viewMode, metric, zone]);

  return (
    <div
      className={`min-h-screen font-sans p-3 md:p-6 flex flex-col justify-between transition-all ${
        viewMode === "WIN32"
          ? "bg-[#008080] text-black font-mono"
          : "bg-[#000000] text-[#ffffff]"
      }`}
    >
      <div className="bg-[#000000] text-white p-2.5 mb-5 flex justify-between items-center text-xs border border-white/20 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">DISPLAY_MODE:</span>{" "}
          <b className="text-[#f59e0b]">[{viewMode}_MODE]</b>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("WIN32")}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
              viewMode === "WIN32" ? "bg-white text-black font-bold" : "bg-[#111111] text-gray-300 hover:bg-[#222222] border border-white/10"
            }`}
          >
            Win32 Desktop App
          </button>
          <button
            onClick={() => setViewMode("WEB")}
            className={`px-3 py-1 rounded-lg text-xs font-sans transition ${
              viewMode === "WEB" ? "bg-white text-black font-bold shadow-lg" : "bg-[#111111] text-gray-300 hover:bg-[#222222] border border-white/10"
            }`}
          >
            Weather Web
          </button>
        </div>
      </div>

      {viewMode === "WIN32" && (
        <div className="flex-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-[4px_4px_10px_rgba(0,0,0,0.5)] flex flex-col font-mono">
          <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center text-xs font-bold select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 inline-block border border-black" />
              <span>ForecastGuard_v2.exe - [Subdivision Telemetry Analyzer]</span>
            </div>
            <div className="flex gap-1">
              <button className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold">_</button>
              <button className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold">□</button>
              <button className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold">✕</button>
            </div>
          </div>

          <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-1 text-xs flex gap-4 text-black">
            <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>F</u>ile</span>
            <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>E</u>dit</span>
            <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>V</u>iew</span>
            <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>M</u>etrics</span>
            <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>H</u>elp</span>
          </div>

          <div className="p-3 flex-1 flex flex-col gap-3 bg-[#c0c0c0]">
            <div className="bg-[#c0c0c0] border border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>Metric View:</span>
                {(["RAW", "CORR", "BUST"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`px-2 py-0.5 border text-xs ${
                      metric === m ? "bg-white border-black font-bold shadow-inner" : "bg-[#c0c0c0]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="font-bold text-blue-900">ACTIVE REGIME: {currentDayInfo.regime}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
              <div className="lg:col-span-7 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white flex flex-col min-h-[400px]">
                <div ref={mapNode} className="flex-1 w-full" />
                <div className="bg-[#c0c0c0] p-2 border-t border-[#808080] text-[11px] grid grid-cols-4 gap-2 text-black">
                  <div><b>Zone:</b> {zone.id}</div>
                  <div><b>Raw→Corr:</b> {zone.rawRain}→{zone.corrRain}mm</div>
                  <div><b>Delta:</b> {zone.corrRain - zone.rawRain}mm</div>
                  <div><b>Bust:</b> <span className="text-red-700 font-bold">{zone.bustProb}%</span></div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#c0c0c0] p-3 text-xs">
                  <div className="font-bold border-b border-[#808080] pb-1 mb-2">IMD Heavy Rain Exceedance</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white border border-[#808080] p-1.5">
                      <div className="text-[9px]">GT 64.5MM</div>
                      <div className="font-bold text-sm">{zone.ex64}%</div>
                    </div>
                    <div className="bg-white border border-[#808080] p-1.5">
                      <div className="text-[9px]">GT 115.5MM</div>
                      <div className="font-bold text-sm">{zone.ex115}%</div>
                    </div>
                    <div className="bg-white border border-[#808080] p-1.5">
                      <div className="text-[9px]">GT 204.5MM</div>
                      <div className="font-bold text-sm">{zone.ex204}%</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] bg-white border border-[#808080] p-2">
                    <b>Diagnostic:</b> {zone.reason}
                  </div>
                </div>

                <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-2 flex-1 flex flex-col min-h-[180px]">
                  <div className="text-xs font-bold mb-1">Rainfall Forecast Waveform (mm)</div>
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="day" tickFormatter={(d) => `D${d}`} stroke="#000" fontSize={10} />
                        <YAxis stroke="#000" fontSize={10} />
                        <Tooltip />
                        <ReferenceLine y={115.5} stroke="red" strokeDasharray="2 2" />
                        <Bar dataKey="raw" fill="#808080" barSize={10} />
                        <Line type="monotone" dataKey="corr" stroke="#000080" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="obs" stroke="#ff0000" strokeWidth={1.5} strokeDasharray="2 2" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#c0c0c0] p-2">
              <div className="text-[11px] font-bold mb-1">Select Horizon Lead Day:</div>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
                {timelineData.map((d) => {
                  const active = d.day === day;
                  return (
                    <button
                      key={d.day}
                      onClick={() => setDay(d.day)}
                      className={`p-1 text-center text-xs border ${
                        active ? "bg-[#000080] text-white border-black font-bold" : "bg-[#c0c0c0] border text-black"
                      }`}
                    >
                      D{d.day} ({d.bust}%)
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "WEB" && (
        <div className="flex-1 flex flex-col justify-between gap-6 max-w-7xl mx-auto w-full">
          <header className="bg-[#000000] border border-white/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-white mb-1">FORECAST GUARD</h1>
              <p className="text-sm text-gray-400">
                Selected Zone: <span className="text-white font-medium">{zone.name}</span> || Active Regime: <span className="text-[#f59e0b] font-medium">{currentDayInfo.regime}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-gray-400 mr-2">Metric View:</div>
              {(["RAW", "CORR", "BUST"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    metric === m
                      ? "bg-white text-black font-bold shadow-lg"
                      : "bg-[#111111] text-gray-300 hover:bg-[#222222] border border-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 bg-[#000000] border border-white/20 rounded-3xl p-5 flex flex-col min-h-[480px] shadow-2xl">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">Spatial Subdivisions</span>
              </div>
              <div ref={mapNode} className="flex-1 w-full rounded-2xl overflow-hidden border border-white/15 min-h-[360px]" />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0a0a0a] p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">ZONE ID</span>
                  <span className="font-semibold text-white text-sm">{zone.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">RAW vs CORR</span>
                  <span className="text-sm text-gray-200">{zone.rawRain}mm → <b className="text-[#f59e0b]">{zone.corrRain}mm</b></span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">BIAS DELTA</span>
                  <span className="text-sm text-gray-200">
                    {zone.corrRain - zone.rawRain > 0 ? "+" : ""}{zone.corrRain - zone.rawRain}mm
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">BUST PROB</span>
                  <span className="text-[#f59e0b] font-bold text-sm">{zone.bustProb}%</span>
                </div>
              </div>
            </section>

            <section className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#000000] border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-4 flex justify-between">
                  <span>IMD Heavy-Rain Exceedance</span>
                  <span className="text-gray-400">{zone.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl text-center">
                    <div className="text-[10px] text-gray-400">&gt;64.5mm</div>
                    <div className="text-xl font-semibold text-white mt-1">{zone.ex64}%</div>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl text-center">
                    <div className="text-[10px] text-gray-400">&gt;115.5mm</div>
                    <div className="text-xl font-semibold text-white mt-1">{zone.ex115}%</div>
                  </div>
                  <div className="bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl text-center">
                    <div className="text-[10px] text-gray-400">&gt;204.5mm</div>
                    <div className="text-xl font-semibold text-[#f59e0b] mt-1">{zone.ex204}%</div>
                  </div>
                </div>
                <div className="mt-4 p-3.5 bg-[#0a0a0a] rounded-2xl border border-white/10 text-xs text-gray-300 leading-relaxed">
                  <span className="text-[#f59e0b] font-semibold">Diagnostic: </span>
                  {zone.reason}
                </div>
              </div>

              <div className="bg-[#000000] border border-white/20 rounded-3xl p-6 flex-1 flex flex-col shadow-2xl min-h-[240px]">
                <div className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-3">
                  Forecast vs Verifying Obs (mm)
                </div>
                <div className="flex-1 w-full min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="day" tickFormatter={(d) => `D${d}`} stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000000",
                          borderColor: "#ffffff",
                          borderRadius: "12px",
                          fontSize: "11px",
                          color: "#fff",
                        }}
                      />
                      <ReferenceLine y={115.5} stroke="#888888" strokeDasharray="3 3" />
                      <Bar dataKey="raw" name="Raw GFS" fill="#222222" barSize={10} radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="corr" name="Model Corrected" stroke="#ffffff" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="obs" name="IMD Obs" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </div>

          <footer className="bg-[#000000] border border-white/20 rounded-3xl p-5 shadow-2xl">
            <div className="text-xs font-medium text-gray-300 mb-3 uppercase tracking-wider">
              10-Day Medium-Range Horizon Scrubber
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2.5">
              {timelineData.map((d) => {
                const active = d.day === day;
                return (
                  <button
                    key={d.day}
                    onClick={() => setDay(d.day)}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      active
                        ? "bg-white text-black border-white font-bold shadow-lg scale-105"
                        : "bg-[#0a0a0a] border-white/10 text-gray-300 hover:bg-[#111111] hover:border-white/30"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span>D{d.day}</span>
                      <span className="text-[10px] opacity-80">{d.bust}%</span>
                    </div>
                    <div className="text-[9px] truncate opacity-70 mt-1">{d.regime}</div>
                  </button>
                );
              })}
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
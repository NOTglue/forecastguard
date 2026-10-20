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
  const [activeTab, setActiveTab] = useState<'poster' | 'dashboard' | 'win32'>('poster');
  const [day, setDay] = useState<number>(4);
  const [metric, setMetric] = useState<"RAW" | "CORR" | "BUST">("RAW");
  const [zone, setZone] = useState(subdivisionZones[1]);

  const [mapCenter, setMapCenter] = useState<[number, number]>([23.0, 82.0]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  const mapNode = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<any>(null);

  const currentDayInfo = timelineData[day - 1];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setActiveTab('poster');
      if (e.key === '2') setActiveTab('dashboard');
      if (e.key === '3') setActiveTab('win32');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          color: selected ? (activeTab === 'win32' ? "#000080" : "#ccff00") : "#666666",
          weight: selected ? 3 : 1,
          fillColor: selected ? (activeTab === 'win32' ? "#000080" : "#ccff00") : "#222222",
          fillOpacity: selected ? 0.5 : 0.25,
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
  }, [activeTab, metric, zone]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f4f4f0] font-sans selection:bg-[#ccff00] selection:text-black overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .font-brutal {
          font-family: 'Space Grotesk', sans-serif;
        }
        .font-mono-code {
          font-family: 'JetBrains Mono', monospace;
        }
        .marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 25s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .glitch-hover:hover {
          text-shadow: 3px 3px 0px #ccff00, -3px -3px 0px #ff0055;
        }
      `}</style>

      <div className="bg-[#ccff00] text-black font-mono-code text-xs uppercase font-bold py-2 overflow-hidden border-b-2 border-black tracking-widest">
        <div className="marquee">
          <span>LIVE SYSTEM TELEMETRY ACTIVE // 100% ACCURACY TARGET // NO COMPROMISE // </span>
          <span>LIVE SYSTEM TELEMETRY ACTIVE // 100% ACCURACY TARGET // NO COMPROMISE // </span>
          <span>LIVE SYSTEM TELEMETRY ACTIVE // 100% ACCURACY TARGET // NO COMPROMISE // </span>
        </div>
      </div>

      <header className="border-b-4 border-[#222] px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0d0d12]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#ccff00] border-2 border-white animate-pulse" />
          <h1 className="font-brutal font-900 text-3xl md:text-4xl tracking-tighter uppercase text-white">
            FORECAST<span className="text-[#ccff00]">GUARD</span>
          </h1>
        </div>

        <nav className="mt-4 md:mt-0 flex flex-wrap gap-2 font-mono-code text-xs">
          <button 
            onClick={() => setActiveTab('poster')} 
            className={`px-4 py-2 uppercase font-bold border-2 transition-all cursor-pointer ${activeTab === 'poster' ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'bg-[#1a1a24] text-zinc-300 border-[#333] hover:border-white'}`}
          >
            [1] Poster Home
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 uppercase font-bold border-2 transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#ccff00] text-black border-[#ccff00]' : 'bg-[#1a1a24] text-zinc-300 border-[#333] hover:border-white'}`}
          >
            [2] Web Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('win32')} 
            className={`px-4 py-2 uppercase font-bold border-2 transition-all cursor-pointer ${activeTab === 'win32' ? 'bg-[#ff0055] text-white border-[#ff0055]' : 'bg-[#1a1a24] text-zinc-300 border-[#333] hover:border-white'}`}
          >
            [3] Win32 Mode
          </button>
        </nav>
      </header>

      {activeTab === 'poster' && (
        <main>
          <section className="relative px-6 py-16 md:py-24 border-b-4 border-[#222] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-8">
              <div className="inline-block border border-[#ccff00] text-[#ccff00] font-mono-code text-xs px-3 py-1 uppercase tracking-widest bg-[#ccff00]/10">
                Next-Gen Meteorological Shield
              </div>
              <h2 className="font-brutal font-900 text-5xl md:text-8xl uppercase tracking-tighter leading-none glitch-hover">
                WEATHER <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px #ccff00' }}>WITHOUT</span> <br />LIMITS.
              </h2>
              <p className="font-mono-code text-zinc-400 text-base md:text-xl max-w-2xl leading-relaxed">
                High-precision atmospheric forecasting engine built for extreme environments. Real-time telemetry, advanced chart diagnostics, and localized map feeds delivered instantly.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button onClick={() => setActiveTab('dashboard')} className="bg-[#ccff00] text-black font-brutal font-900 text-lg px-8 py-4 uppercase border-4 border-[#ccff00] hover:bg-transparent hover:text-[#ccff00] transition-all cursor-pointer">
                  Launch Web Dashboard
                </button>
                <button onClick={() => setActiveTab('win32')} className="bg-transparent text-white font-brutal font-900 text-lg px-8 py-4 uppercase border-4 border-white hover:bg-white hover:text-black transition-all cursor-pointer">
                  Activate Win32 Mode
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#121218] border-4 border-[#2a2a38] p-6 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 bg-[#ff0055] text-white font-mono-code text-xs px-2 py-1 uppercase font-bold">
                Live Feed
              </div>
              <h3 className="font-brutal text-2xl font-bold uppercase mb-4 text-[#ccff00]">System Telemetry</h3>
              <div className="space-y-4 font-mono-code text-sm">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">CORE STATUS</span>
                  <span className="text-[#ccff00]">ONLINE</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">LATENCY</span>
                  <span className="text-white">14MS</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">RADAR NODES</span>
                  <span className="text-white">64 ACTIVE</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-zinc-500">SECURITY</span>
                  <span className="text-[#ff0055]">ENCRYPTED</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                <span className="inline-block w-3 h-3 bg-[#ccff00] rounded-full animate-ping mr-2"></span>
                <span className="font-mono-code text-xs text-zinc-400">Syncing with satellite feed</span>
              </div>
            </div>
          </section>

          <section className="px-6 py-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border-b-4 border-[#222]">
            <div className="bg-[#121218] border-4 border-[#222] p-8">
              <div className="font-brutal text-5xl font-900 text-[#ccff00] mb-4">01</div>
              <h4 className="font-brutal text-2xl font-bold uppercase mb-2">Real-Time Charts</h4>
              <p className="font-mono-code text-zinc-400 text-sm">
                Dynamic charting components built to render high-frequency climate changes instantly without stutter.
              </p>
            </div>
            <div className="bg-[#121218] border-4 border-[#222] p-8">
              <div className="font-brutal text-5xl font-900 text-white mb-4">02</div>
              <h4 className="font-brutal text-2xl font-bold uppercase mb-2">Map Integration</h4>
              <p className="font-mono-code text-zinc-400 text-sm">
                Precision geospatial overlays mapping atmospheric shifts across multiple regions simultaneously.
              </p>
            </div>
            <div className="bg-[#121218] border-4 border-[#222] p-8">
              <div className="font-brutal text-5xl font-900 text-[#ff0055] mb-4">03</div>
              <h4 className="font-brutal text-2xl font-bold uppercase mb-2">Dual Mode Engine</h4>
              <p className="font-mono-code text-zinc-400 text-sm">
                Seamlessly switch between modern web dashboards and high-performance Win32 native environments.
              </p>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'dashboard' && (
        <section className="px-6 py-12 max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-[#121218] border-4 border-[#2a2a38] p-4">
            <div>
              <span className="font-mono-code text-xs text-[#ccff00] uppercase font-bold tracking-widest">Active View: Web Dashboard</span>
              <h3 className="font-brutal text-2xl font-bold uppercase mt-1">Zone: {zone.name}</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-400">Metric View:</div>
              {(["RAW", "CORR", "BUST"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1 font-mono-code text-xs uppercase font-bold border-2 cursor-pointer transition-all ${
                    metric === m ? "bg-[#ccff00] text-black border-[#ccff00]" : "bg-zinc-900 text-zinc-300 border-zinc-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#121218] border-4 border-[#2a2a38] p-5 flex flex-col min-h-[480px]">
              <div className="text-xs font-mono-code uppercase tracking-wider mb-3 text-zinc-400">Spatial Subdivisions Map</div>
              <div ref={mapNode} className="flex-1 w-full rounded border-2 border-zinc-800 min-h-[360px]" />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0a0a0c] p-4 border-2 border-zinc-800 font-mono-code text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px]">ZONE ID</span>
                  <span className="font-bold text-white text-sm">{zone.id}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">RAW vs CORR</span>
                  <span className="text-sm text-zinc-200">{zone.rawRain}mm → <b className="text-[#ccff00]">{zone.corrRain}mm</b></span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">BIAS DELTA</span>
                  <span className="text-sm text-zinc-200">
                    {zone.corrRain - zone.rawRain > 0 ? "+" : ""}{zone.corrRain - zone.rawRain}mm
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">BUST PROB</span>
                  <span className="text-[#ccff00] font-bold text-sm">{zone.bustProb}%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#121218] border-4 border-[#2a2a38] p-6">
                <div className="text-xs font-mono-code uppercase tracking-wider mb-4 flex justify-between">
                  <span>IMD Heavy-Rain Exceedance</span>
                  <span className="text-zinc-400">{zone.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-4 text-center">
                    <div className="text-[10px] text-zinc-500 font-mono-code">&gt;64.5mm</div>
                    <div className="text-xl font-bold font-brutal text-white mt-1">{zone.ex64}%</div>
                  </div>
                  <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-4 text-center">
                    <div className="text-[10px] text-zinc-500 font-mono-code">&gt;115.5mm</div>
                    <div className="text-xl font-bold font-brutal text-white mt-1">{zone.ex115}%</div>
                  </div>
                  <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-4 text-center">
                    <div className="text-[10px] text-zinc-500 font-mono-code">&gt;204.5mm</div>
                    <div className="text-xl font-bold font-brutal text-[#ccff00] mt-1">{zone.ex204}%</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[#0a0a0c] border-2 border-zinc-800 font-mono-code text-xs text-zinc-300 leading-relaxed">
                  <span className="text-[#ccff00] font-bold">Diagnostic: </span>
                  {zone.reason}
                </div>
              </div>

              <div className="bg-[#121218] border-4 border-[#2a2a38] p-6 flex-1 flex flex-col min-h-[240px]">
                <div className="text-xs font-mono-code uppercase tracking-wider mb-3 text-zinc-400">
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
                          borderColor: "#ccff00",
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: "#fff",
                        }}
                      />
                      <ReferenceLine y={115.5} stroke="#ff0055" strokeDasharray="3 3" />
                      <Bar dataKey="raw" name="Raw GFS" fill="#222222" barSize={10} />
                      <Line type="monotone" dataKey="corr" name="Model Corrected" stroke="#ccff00" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="obs" name="IMD Obs" stroke="#ff0055" strokeWidth={1.5} strokeDasharray="3 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121218] border-4 border-[#2a2a38] p-5">
            <div className="text-xs font-mono-code mb-3 uppercase tracking-wider text-zinc-400">
              10-Day Medium-Range Horizon Scrubber
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2.5">
              {timelineData.map((d) => {
                const active = d.day === day;
                return (
                  <button
                    key={d.day}
                    onClick={() => setDay(d.day)}
                    className={`p-3 text-left transition-all border-2 cursor-pointer ${
                      active
                        ? "bg-[#ccff00] text-black border-[#ccff00] font-bold"
                        : "bg-[#0a0a0c] border-zinc-800 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-mono-code">
                      <span>D{d.day}</span>
                      <span className="text-[10px]">{d.bust}%</span>
                    </div>
                    <div className="text-[9px] truncate opacity-70 mt-1 font-mono-code">{d.regime}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'win32' && (
        <section className="px-6 py-12 max-w-7xl mx-auto min-h-[70vh]">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-2xl flex flex-col font-mono text-black">
            <div className="bg-[#000080] text-white px-2 py-1.5 flex justify-between items-center text-xs font-bold select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 inline-block border border-black" />
                <span>ForecastGuard_v2.exe - [Subdivision Telemetry Analyzer]</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setActiveTab('poster')} className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold cursor-pointer">_</button>
                <button onClick={() => setActiveTab('dashboard')} className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold cursor-pointer">□</button>
                <button onClick={() => setActiveTab('poster')} className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold cursor-pointer">✕</button>
              </div>
            </div>

            <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-1 text-xs flex gap-4">
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>F</u>ile</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>E</u>dit</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>V</u>iew</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>M</u>etrics</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1" onClick={() => setActiveTab('poster')}><u>H</u>ome</span>
            </div>

            <div className="p-3 flex flex-col gap-3 bg-[#c0c0c0]">
              <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span>Metric View:</span>
                  {(["RAW", "CORR", "BUST"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetric(m)}
                      className={`px-2 py-0.5 border text-xs cursor-pointer ${
                        metric === m ? "bg-white border-black font-bold shadow-inner" : "bg-[#c0c0c0]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="font-bold text-blue-900">ACTIVE REGIME: {currentDayInfo.regime}</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-7 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white flex flex-col min-h-[400px]">
                  <div ref={mapNode} className="flex-1 w-full" />
                  <div className="bg-[#c0c0c0] p-2 border-t border-[#808080] text-[11px] grid grid-cols-4 gap-2">
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
                        className={`p-1 text-center text-xs border cursor-pointer ${
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
        </section>
      )}

      <footer className="border-t-4 border-[#222] bg-[#0d0d12] px-6 py-12 text-center mt-20">
        <h2 className="font-brutal text-3xl font-900 uppercase tracking-tighter mb-4">FORECASTGUARD</h2>
        <p className="font-mono-code text-xs text-zinc-500 uppercase tracking-widest">Team 2</p>
      </footer>
    </div>
  );
}
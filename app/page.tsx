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

const baseRegimes = [
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
];

const subdivisionZones = [
  {
    id: "GANGA-10",
    name: "Gangetic Plain Sector",
    coords: [25.4, 83.0] as [number, number],
    radius: 170000,
    baseRaw: 62,
    baseCorr: 54,
    baseBust: 34,
    reason: "The trough axis is shifting slightly within normal ensemble limits, keeping totals close to typical seasonal averages.",
  },
  {
    id: "ODISHA-07",
    name: "Coastal Odisha & North Bay",
    coords: [20.3, 85.8] as [number, number],
    radius: 165000,
    baseRaw: 194,
    baseCorr: 138,
    baseBust: 76,
    reason: "The raw GFS model is heavily overestimating convective strength here, pumping up numbers by about 56mm compared to actual IMD observations.",
  },
  {
    id: "KONKAN-23",
    name: "Konkan, Goa & Western Ghats",
    coords: [18.2, 73.4] as [number, number],
    radius: 155000,
    baseRaw: 88,
    baseCorr: 146,
    baseBust: 68,
    reason: "Because of its coarse grid resolution, the raw model completely misses the intense orographic lift happening along the Ghats, falling short by nearly 58mm.",
  },
  {
    id: "DECCAN-31",
    name: "Deccan Interior Plateau",
    coords: [15.6, 76.8] as [number, number],
    radius: 160000,
    baseRaw: 14,
    baseCorr: 12,
    baseBust: 14,
    reason: "Stable leeward winds are keeping conditions dry and predictable, showing almost no historical forecast variance.",
  },
  {
    id: "ASSAM-02",
    name: "Assam & Meghalaya",
    coords: [26.1, 91.7] as [number, number],
    radius: 160000,
    baseRaw: 145,
    baseCorr: 218,
    baseBust: 82,
    reason: "Severe underestimation of southerly moisture flux channeling into the Khasi Hills box canyon.",
  },
  {
    id: "KERALA-34",
    name: "Kerala & Mahe",
    coords: [10.8, 76.2] as [number, number],
    radius: 145000,
    baseRaw: 112,
    baseCorr: 149,
    baseBust: 58,
    reason: "Offshore vortex formation along the Malabar coast intensifies localized low-level jet convergence.",
  },
  {
    id: "GUJARAT-21",
    name: "Saurashtra & Kutch",
    coords: [22.3, 70.8] as [number, number],
    radius: 175000,
    baseRaw: 132,
    baseCorr: 84,
    baseBust: 64,
    reason: "Mid-tropospheric dry air intrusion from the northwest suppresses predicted deep convection cells.",
  },
  {
    id: "PUNJAB-14",
    name: "Punjab & Haryana Plains",
    coords: [30.8, 75.8] as [number, number],
    radius: 155000,
    baseRaw: 48,
    baseCorr: 76,
    baseBust: 51,
    reason: "Western Disturbance interaction with lower monsoonal easterlies triggers unmodeled squall lines.",
  },
  {
    id: "RAJ-17",
    name: "West Rajasthan Arid Zone",
    coords: [26.9, 71.9] as [number, number],
    radius: 195000,
    baseRaw: 22,
    baseCorr: 9,
    baseBust: 19,
    reason: "Strong anticyclonic subsidence caps boundary layer moisture below convective trigger thresholds.",
  },
  {
    id: "MP-19",
    name: "East Madhya Pradesh",
    coords: [23.2, 79.9] as [number, number],
    radius: 180000,
    baseRaw: 118,
    baseCorr: 136,
    baseBust: 47,
    reason: "Monsoon depression track bias shifts core vorticity 80km south of raw deterministic guidance.",
  },
  {
    id: "BIHAR-09",
    name: "Bihar & Sub-Himalayan Foothills",
    coords: [25.8, 86.1] as [number, number],
    radius: 155000,
    baseRaw: 76,
    baseCorr: 128,
    baseBust: 71,
    reason: "Foothill lock regime traps moisture against the Nepal border, driving extreme localized cloudburst risk.",
  },
  {
    id: "TAMIL-33",
    name: "Coastal Tamil Nadu & Puducherry",
    coords: [11.9, 79.8] as [number, number],
    radius: 155000,
    baseRaw: 68,
    baseCorr: 98,
    baseBust: 61,
    reason: "Easterly wave trough passage enhances nocturnal coastal convergence beyond coarse model resolution.",
  },
  {
    id: "ANDHRA-28",
    name: "Coastal Andhra & Yanam",
    coords: [16.5, 81.1] as [number, number],
    radius: 160000,
    baseRaw: 162,
    baseCorr: 121,
    baseBust: 56,
    reason: "Raw guidance over-deepens the shear zone; bias correction tempers coastal surge totals.",
  },
  {
    id: "HIMACHAL-12",
    name: "Himachal & Uttarakhand",
    coords: [31.1, 77.6] as [number, number],
    radius: 150000,
    baseRaw: 64,
    baseCorr: 132,
    baseBust: 79,
    reason: "Steep Himalayan valley gradients force rapid parcel ascent uncaptured by 25km global spectral grids.",
  },
  {
    id: "BENGAL-06",
    name: "Gangetic West Bengal",
    coords: [22.9, 87.8] as [number, number],
    radius: 150000,
    baseRaw: 178,
    baseCorr: 144,
    baseBust: 66,
    reason: "North Bay cyclonic circulation entrains drier continental air on its western periphery.",
  },
];

const manualVibrantTones = ["#00f0ff", "#ff007f", "#ffe600", "#ff5500", "#00ff66", "#bd00ff", "#00ffcc"];

function getZoneTimeline(z: typeof subdivisionZones[0]) {
  const rawWave = [0.7, 0.9, 1.3, 1.6, 1.2, 0.9, 0.6, 0.4, 0.7, 0.8];
  const corrWave = [0.8, 1.0, 1.2, 1.4, 1.1, 0.8, 0.5, 0.35, 0.75, 0.7];
  const bustWave = [25, 32, 58, 75, 62, 45, 30, 20, 50, 55];

  return baseRegimes.map((regime, idx) => {
    const d = idx + 1;
    const raw = Math.max(4, Math.round(z.baseRaw * rawWave[idx]));
    const corr = Math.max(4, Math.round(z.baseCorr * corrWave[idx]));
    const obs = d <= 5 ? Math.max(2, Math.round(corr * (0.92 + (idx % 2) * 0.08))) : null;
    const bust = Math.min(99, Math.max(10, Math.round(z.baseBust * (bustWave[idx] / 50))));
    const ex64 = Math.min(99, Math.max(2, Math.round((corr / 220) * 100)));
    const ex115 = Math.min(96, Math.max(1, Math.round((corr / 290) * 85)));
    const ex204 = Math.min(88, Math.max(0, Math.round(((corr - 70) / 260) * 65)));

    return {
      day: d,
      regime,
      raw,
      corr,
      obs,
      bust,
      ex64,
      ex115,
      ex204,
    };
  });
}

export default function ForecastGuardApp() {
  const [activeTab, setActiveTab] = useState<"poster" | "dashboard" | "win32">("poster");
  const [day, setDay] = useState<number>(4);
  const [metric, setMetric] = useState<"RAW" | "CORR" | "BUST">("RAW");
  const [zone, setZone] = useState(subdivisionZones[1]);
  const [accentColor, setAccentColor] = useState<string>("#ccff00");

  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5, 80.5]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  const mapNode = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<any>(null);

  const zoneTimeline = getZoneTimeline(zone);
  const currentDayInfo = zoneTimeline[day - 1];

  useEffect(() => {
    document.title = "ForecastGuard";
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") setActiveTab("poster");
      if (e.key === "2") setActiveTab("dashboard");
      if (e.key === "3") setActiveTab("win32");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapNode.current || activeTab === "poster") return;

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
        const zDay = getZoneTimeline(z)[day - 1];
        const metricVal =
          metric === "RAW"
            ? `${zDay.raw}mm`
            : metric === "CORR"
            ? `${zDay.corr}mm`
            : `${zDay.bust}%`;

        const circle = L.circle(z.coords, {
          radius: z.radius,
          color: selected ? (activeTab === "win32" ? "#000080" : accentColor) : "#555555",
          weight: selected ? 3 : 1.5,
          fillColor: selected
            ? activeTab === "win32"
              ? "#000080"
              : accentColor
            : zDay.bust > 60
            ? "#ff0055"
            : "#222222",
          fillOpacity: selected ? 0.6 : 0.35,
        });

        circle.bindTooltip(
          `<div style="font-family:monospace;font-size:10px;font-weight:bold;background:#000000;color:${
            selected ? accentColor : "#ffffff"
          };padding:2px 5px;border:1px solid ${selected ? accentColor : "#ffffff"};white-space:nowrap;">
            ${z.id} [${metricVal}]
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
  }, [activeTab, metric, zone, day, accentColor]);

  const handleRandomizeAccent = () => {
    const currentIndex = manualVibrantTones.indexOf(accentColor);
    let nextIndex = Math.floor(Math.random() * manualVibrantTones.length);
    if (nextIndex === currentIndex) {
      nextIndex = (currentIndex + 1) % manualVibrantTones.length;
    }
    setAccentColor(manualVibrantTones[nextIndex]);
  };

  const handleResetAccent = () => {
    setAccentColor("#ccff00");
  };

  const tickerItems = subdivisionZones.map((z) => {
    const dInfo = getZoneTimeline(z)[day - 1];
    const delta = dInfo.corr - dInfo.raw;
    return `${z.id} [${z.name.toUpperCase()}] :: D${day} RAW ${dInfo.raw}MM -> CORR ${dInfo.corr}MM (DELTA ${delta >= 0 ? "+" : ""}${delta}MM | BUST ${dInfo.bust}%)`;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f4f4f0] font-sans overflow-x-hidden" style={{ "--dynamic-accent": accentColor } as React.CSSProperties}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        .font-brutal {
          font-family: 'Space Grotesk', sans-serif;
        }
        .font-mono-code {
          font-family: 'JetBrains Mono', monospace;
        }
        .marquee-wrapper {
          display: flex;
          width: max-content;
          animation: marquee-continuous 180s linear infinite;
        }
        .marquee-wrapper:hover {
          animation-play-state: paused;
        }
        @keyframes marquee-continuous {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .glitch-hover:hover {
          text-shadow: 3px 3px 0px var(--dynamic-accent), -3px -3px 0px #ff0055;
        }
        .dynamic-accent-bg {
          background-color: var(--dynamic-accent) !important;
        }
        .dynamic-accent-text {
          color: var(--dynamic-accent) !important;
        }
        .dynamic-accent-border {
          border-color: var(--dynamic-accent) !important;
        }
      `}</style>

      <div className="dynamic-accent-bg text-black font-mono-code text-xs uppercase font-bold py-2.5 overflow-hidden border-b-2 border-black tracking-widest sticky top-0 z-50">
        <div className="marquee-wrapper">
          <div className="flex items-center shrink-0">
            {tickerItems.map((item, idx) => (
              <span key={`a-${idx}`} className="mx-8 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-black" />
                {item}
              </span>
            ))}
          </div>
          <div className="flex items-center shrink-0">
            {tickerItems.map((item, idx) => (
              <span key={`b-${idx}`} className="mx-8 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-black" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="border-b-4 border-[#222] px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0d0d12]">
        <div className="flex items-center gap-3 flex-wrap">
          <div
            onClick={handleRandomizeAccent}
            title="Click to randomize accent color"
            className="w-6 h-6 dynamic-accent-bg border-2 border-white animate-pulse cursor-pointer hover:scale-125 transition-transform"
          />
          <h1 className="font-brutal font-900 text-3xl md:text-4xl tracking-tighter uppercase text-white glitch-hover cursor-pointer">
            FORECAST<span className="dynamic-accent-text">GUARD</span>
          </h1>
          <span
            onClick={handleResetAccent}
            title="Click to reset accent to default"
            className="font-mono-code text-[10px] bg-[#1a1a24] border border-zinc-700 px-2 py-0.5 dynamic-accent-text font-bold cursor-pointer hover:border-white transition-colors"
          >
            15 IMD SUBDIVISIONS
          </span>
        </div>

        <nav className="mt-4 md:mt-0 flex flex-wrap gap-2 font-mono-code text-xs">
          <button 
            onClick={() => setActiveTab("poster")} 
            className={`px-4 py-2 uppercase font-bold border-2 transition-all cursor-pointer ${activeTab === "poster" ? "dynamic-accent-bg text-black dynamic-accent-border" : "bg-[#1a1a24] text-zinc-300 border-[#333] hover:border-white"}`}
          >
            [1] Home
          </button>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`px-4 py-2 uppercase font-bold border-2 transition-all cursor-pointer ${activeTab === "dashboard" ? "dynamic-accent-bg text-black dynamic-accent-border" : "bg-[#1a1a24] text-zinc-300 border-[#333] hover:border-white"}`}
          >
            [2] Web Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("win32")} 
            className={`px-4 py-2 uppercase font-bold border-2 transition-all cursor-pointer ${activeTab === "win32" ? "bg-[#ff0055] text-white border-[#ff0055]" : "bg-[#1a1a24] text-zinc-300 border-[#333] hover:border-white"}`}
          >
            [3] Win32 Mode
          </button>
        </nav>
      </header>

      {activeTab === "poster" && (
        <main>
          <section className="relative px-6 py-16 md:py-24 border-b-4 border-[#222] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-8">
              <div className="inline-block border dynamic-accent-border dynamic-accent-text font-mono-code text-xs px-3 py-1 uppercase tracking-widest bg-white/5">
                Next-Gen Meteorological Shield // 15 Subdivisions
              </div>
              <h2 className="font-brutal font-900 text-5xl md:text-8xl uppercase tracking-tighter leading-none glitch-hover">
                WEATHER <br /><span className="text-transparent" style={{ WebkitTextStroke: "2px var(--dynamic-accent)" }}>WITHOUT</span> <br />LIMITS.
              </h2>
              <p className="font-mono-code text-zinc-400 text-base md:text-xl max-w-2xl leading-relaxed">
                High-precision atmospheric forecasting engine built for extreme environments. Real-time GFS bias correction, 10-day horizon scrubbing, and 15 localized IMD subdivision feeds delivered instantly.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button onClick={() => setActiveTab("dashboard")} className="dynamic-accent-bg text-black font-brutal font-900 text-lg px-8 py-4 uppercase border-4 dynamic-accent-border hover:bg-transparent hover:text-white transition-all cursor-pointer">
                  Launch Web Dashboard
                </button>
                <button onClick={() => setActiveTab("win32")} className="bg-transparent text-white font-brutal font-900 text-lg px-8 py-4 uppercase border-4 border-white hover:bg-white hover:text-black transition-all cursor-pointer">
                  Activate Win32 Mode
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#121218] border-4 border-[#2a2a38] p-6 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 bg-[#ff0055] text-white font-mono-code text-xs px-2 py-1 uppercase font-bold">
                Day {day} Stream
              </div>
              <h3 className="font-brutal text-2xl font-bold uppercase mb-4 dynamic-accent-text">{zone.id} Telemetry</h3>
              <div className="space-y-4 font-mono-code text-sm">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">SECTOR</span>
                  <span className="text-white text-right">{zone.name}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">RAW vs CORR (D{day})</span>
                  <span className="dynamic-accent-text">{currentDayInfo.raw}mm → {currentDayInfo.corr}mm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">ACTIVE REGIME</span>
                  <span className="text-white">{currentDayInfo.regime}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-zinc-500">BUST RISK</span>
                  <span className="text-[#ff0055] font-bold">{currentDayInfo.bust}%</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                <span className="inline-block w-3 h-3 dynamic-accent-bg rounded-full animate-ping mr-2"></span>
                <span className="font-mono-code text-xs text-zinc-400">Click any zone below to inspect</span>
              </div>
            </div>
          </section>

          <section className="px-6 py-12 max-w-7xl mx-auto border-b-4 border-[#222]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="font-brutal text-3xl font-900 uppercase text-white glitch-hover">
                  FORECASTGUARD // 15 IMD SUBDIVISIONS
                </h3>
                <p className="font-mono-code text-xs text-zinc-400 mt-1">Select a zone to lock telemetry and jump straight into diagnostics</p>
              </div>
              <div className="flex gap-1.5 flex-wrap font-mono-code text-xs">
                {baseRegimes.map((_, idx) => {
                  const d = idx + 1;
                  return (
                    <button
                      key={d}
                      onClick={() => setDay(d)}
                      className={`px-2.5 py-1 border cursor-pointer ${
                        day === d ? "dynamic-accent-bg text-black dynamic-accent-border font-bold" : "bg-[#121218] text-zinc-400 border-zinc-700"
                      }`}
                    >
                      D{d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {subdivisionZones.map((z) => {
                const zInfo = getZoneTimeline(z)[day - 1];
                const isSelected = z.id === zone.id;
                return (
                  <div
                    key={z.id}
                    onClick={() => setZone(z)}
                    className={`p-4 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1a1a24] dynamic-accent-border"
                        : "bg-[#121218] border-[#222] hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono-code text-xs mb-1">
                      <span className="font-bold dynamic-accent-text">{z.id}</span>
                      <span className={zInfo.bust > 60 ? "text-[#ff0055] font-bold" : "text-zinc-400"}>
                        BUST {zInfo.bust}%
                      </span>
                    </div>
                    <div className="font-brutal text-sm font-bold text-white truncate mb-2">{z.name}</div>
                    <div className="font-mono-code text-xs text-zinc-300 flex justify-between border-t border-zinc-800 pt-2">
                      <span>RAW: {zInfo.raw}mm</span>
                      <span className="dynamic-accent-text font-bold">CORR: {zInfo.corr}mm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="px-6 py-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 border-b-4 border-[#222]">
            <div className="bg-[#121218] border-4 border-[#222] p-8">
              <div className="font-brutal text-5xl font-900 dynamic-accent-text mb-4">01</div>
              <h4 className="font-brutal text-2xl font-bold uppercase mb-2">10-Day Dynamic Horizon</h4>
              <p className="font-mono-code text-zinc-400 text-sm">
                Scrub across D1 through D10 to watch raw GFS vs bias-corrected rainfall and bust probabilities evolve per subdivision.
              </p>
            </div>
            <div className="bg-[#121218] border-4 border-[#2a2a38] p-8">
              <div className="font-brutal text-5xl font-900 text-white mb-4">02</div>
              <h4 className="font-brutal text-2xl font-bold uppercase mb-2 glitch-hover cursor-pointer inline-block">
                FORECASTGUARD 15 IMD SUBDIVISIONS
              </h4>
              <p className="font-mono-code text-zinc-400 text-sm mt-2">
                Full national coverage spanning Assam, Odisha, Konkan, Kerala, Himachal, Rajasthan, Gangetic plains, and Deccan sectors.
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

          <section className="px-6 py-16 max-w-7xl mx-auto border-b-4 border-[#222]">
            <div className="bg-[#121218] border-4 border-[#2a2a38] p-8">
              <h3 className="font-brutal text-2xl md:text-3xl font-900 uppercase dynamic-accent-text mb-6 tracking-tight">
                Meet the Creators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono-code">
                <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-5">
                  <div className="text-white font-bold text-base mb-1">Naveen Venkat S</div>
                  <div className="text-xs dynamic-accent-text">1st Year - Frontend</div>
                </div>
                <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-5">
                  <div className="text-white font-bold text-base mb-1">Nadini De Gala</div>
                  <div className="text-xs text-[#ffb703]">2nd Year - Backend</div>
                </div>
                <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-5">
                  <div className="text-white font-bold text-base mb-1">Abhishek Vinod</div>
                  <div className="text-xs text-[#ff3300]">2nd Year - Backend</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === "dashboard" && (
        <section className="px-6 py-12 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 bg-[#121218] border-4 border-[#2a2a38] p-4">
            <div>
              <span className="font-mono-code text-xs dynamic-accent-text uppercase font-bold tracking-widest">
                Active View: Web Dashboard // Day {day} ({currentDayInfo.regime})
              </span>
              <h3 className="font-brutal text-2xl font-bold uppercase mt-1">
                {zone.id}: {zone.name}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-400 font-mono-code">Metric View:</div>
              {(["RAW", "CORR", "BUST"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1 font-mono-code text-xs uppercase font-bold border-2 cursor-pointer transition-all ${
                    metric === m ? "dynamic-accent-bg text-black dynamic-accent-border" : "bg-zinc-900 text-zinc-300 border-zinc-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#121218] border-4 border-[#2a2a38] p-4">
            <div className="text-xs font-mono-code uppercase tracking-wider mb-2 text-zinc-400">
              Select IMD Subdivision Zone (15 Sectors)
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-15 gap-1.5">
              {subdivisionZones.map((z) => {
                const active = z.id === zone.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => setZone(z)}
                    className={`px-2 py-1.5 font-mono-code text-[10px] border text-left truncate cursor-pointer transition-all ${
                      active
                        ? "dynamic-accent-bg text-black dynamic-accent-border font-bold"
                        : "bg-[#0a0a0c] text-zinc-300 border-zinc-800 hover:border-zinc-500"
                    }`}
                  >
                    {z.id}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#121218] border-4 border-[#2a2a38] p-5 flex flex-col min-h-[480px]">
              <div className="text-xs font-mono-code uppercase tracking-wider mb-3 text-zinc-400">
                Spatial Subdivisions Map (Day {day} Overlay)
              </div>
              <div ref={mapNode} className="flex-1 w-full rounded border-2 border-zinc-800 min-h-[360px]" />
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0a0a0c] p-4 border-2 border-zinc-800 font-mono-code text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px]">ZONE ID (D{day})</span>
                  <span className="font-bold text-white text-sm">{zone.id}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">RAW vs CORR</span>
                  <span className="text-sm text-zinc-200">
                    {currentDayInfo.raw}mm → <b className="dynamic-accent-text">{currentDayInfo.corr}mm</b>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">BIAS DELTA</span>
                  <span className="text-sm text-zinc-200">
                    {currentDayInfo.corr - currentDayInfo.raw > 0 ? "+" : ""}
                    {currentDayInfo.corr - currentDayInfo.raw}mm
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">BUST PROB</span>
                  <span className="dynamic-accent-text font-bold text-sm">{currentDayInfo.bust}%</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#121218] border-4 border-[#2a2a38] p-6">
                <div className="text-xs font-mono-code uppercase tracking-wider mb-4 flex justify-between">
                  <span>IMD Heavy-Rain Exceedance (D{day})</span>
                  <span className="text-zinc-400">{zone.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-4 text-center">
                    <div className="text-[10px] text-zinc-500 font-mono-code">&gt;64.5mm</div>
                    <div className="text-xl font-bold font-brutal text-white mt-1">{currentDayInfo.ex64}%</div>
                  </div>
                  <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-4 text-center">
                    <div className="text-[10px] text-zinc-500 font-mono-code">&gt;115.5mm</div>
                    <div className="text-xl font-bold font-brutal text-white mt-1">{currentDayInfo.ex115}%</div>
                  </div>
                  <div className="bg-[#0a0a0c] border-2 border-zinc-800 p-4 text-center">
                    <div className="text-[10px] text-zinc-500 font-mono-code">&gt;204.5mm</div>
                    <div className="text-xl font-bold font-brutal dynamic-accent-text mt-1">{currentDayInfo.ex204}%</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-[#0a0a0c] border-2 border-zinc-800 font-mono-code text-xs text-zinc-300 leading-relaxed">
                  <span className="dynamic-accent-text font-bold">Diagnostic ({zone.id}): </span>
                  {zone.reason}
                </div>
              </div>

              <div className="bg-[#121218] border-4 border-[#2a2a38] p-6 flex-1 flex flex-col min-h-[240px]">
                <div className="text-xs font-mono-code uppercase tracking-wider mb-3 text-zinc-400">
                  {zone.id} Forecast vs Verifying Obs (mm)
                </div>
                <div className="flex-1 w-full min-h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={zoneTimeline} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="day" tickFormatter={(d) => `D${d}`} stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000000",
                          borderColor: accentColor,
                          borderRadius: "4px",
                          fontSize: "11px",
                          color: "#fff",
                        }}
                      />
                      <ReferenceLine y={115.5} stroke="#ff0055" strokeDasharray="3 3" />
                      <Bar dataKey="raw" name="Raw GFS" fill="#333333" barSize={12} />
                      <Line type="monotone" dataKey="corr" name="Model Corrected" stroke={accentColor} strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="obs" name="IMD Obs" stroke="#ff0055" strokeWidth={2} strokeDasharray="3 3" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121218] border-4 border-[#2a2a38] p-5">
            <div className="text-xs font-mono-code mb-3 uppercase tracking-wider text-zinc-400">
              10-Day Medium-Range Horizon Scrubber — {zone.name} ({zone.id})
            </div>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2.5">
              {zoneTimeline.map((d) => {
                const active = d.day === day;
                return (
                  <button
                    key={d.day}
                    onClick={() => setDay(d.day)}
                    className={`p-3 text-left transition-all border-2 cursor-pointer ${
                      active
                        ? "dynamic-accent-bg text-black dynamic-accent-border font-bold"
                        : "bg-[#0a0a0c] border-zinc-800 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-mono-code">
                      <span>D{d.day}</span>
                      <span className="text-[10px]">{d.bust}%</span>
                    </div>
                    <div className="text-[10px] font-mono-code mt-1">
                      {d.raw}→{d.corr}mm
                    </div>
                    <div className="text-[9px] truncate opacity-70 mt-0.5 font-mono-code">{d.regime}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {activeTab === "win32" && (
        <section className="px-6 py-12 max-w-7xl mx-auto min-h-[70vh]">
          <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-2xl flex flex-col font-mono text-black">
            <div className="bg-[#000080] text-white px-2 py-1.5 flex justify-between items-center text-xs font-bold select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 inline-block border border-black" />
                <span>ForecastGuard_v2.exe - [{zone.id} - Day {day} Telemetry Analyzer]</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setActiveTab("poster")} className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold cursor-pointer">_</button>
                <button onClick={() => setActiveTab("dashboard")} className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold cursor-pointer">□</button>
                <button onClick={() => setActiveTab("poster")} className="bg-[#c0c0c0] text-black px-1.5 border text-[10px] font-bold cursor-pointer">✕</button>
              </div>
            </div>

            <div className="bg-[#c0c0c0] border-b border-[#808080] px-2 py-1 text-xs flex gap-4">
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>F</u>ile</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>E</u>dit</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>V</u>iew</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1"><u>M</u>etrics</span>
              <span className="cursor-pointer hover:bg-blue-800 hover:text-white px-1" onClick={() => setActiveTab("poster")}><u>H</u>ome</span>
            </div>

            <div className="p-3 flex flex-col gap-3 bg-[#c0c0c0]">
              <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 flex flex-wrap items-center justify-between gap-2 text-xs">
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
                <div className="font-bold text-blue-900">
                  ZONE: {zone.id} // DAY {day} REGIME: {currentDayInfo.regime}
                </div>
              </div>

              <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-2 text-xs">
                <div className="font-bold mb-1">Subdivision Selector (15 Zones):</div>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-15 gap-1">
                  {subdivisionZones.map((z) => (
                    <button
                      key={z.id}
                      onClick={() => setZone(z)}
                      className={`px-1 py-0.5 border text-[10px] truncate cursor-pointer ${
                        zone.id === z.id ? "bg-[#000080] text-white font-bold" : "bg-[#c0c0c0] text-black"
                      }`}
                    >
                      {z.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-7 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white flex flex-col min-h-[400px]">
                  <div ref={mapNode} className="flex-1 w-full" />
                  <div className="bg-[#c0c0c0] p-2 border-t border-[#808080] text-[11px] grid grid-cols-4 gap-2">
                    <div><b>Zone:</b> {zone.id} (D{day})</div>
                    <div><b>Raw→Corr:</b> {currentDayInfo.raw}→{currentDayInfo.corr}mm</div>
                    <div><b>Delta:</b> {currentDayInfo.corr - currentDayInfo.raw}mm</div>
                    <div><b>Bust:</b> <span className="text-red-700 font-bold">{currentDayInfo.bust}%</span></div>
                  </div>
                </div>

                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#c0c0c0] p-3 text-xs">
                    <div className="font-bold border-b border-[#808080] pb-1 mb-2">
                      IMD Heavy Rain Exceedance ({zone.id} - Day {day})
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white border border-[#808080] p-1.5">
                        <div className="text-[9px]">GT 64.5MM</div>
                        <div className="font-bold text-sm">{currentDayInfo.ex64}%</div>
                      </div>
                      <div className="bg-white border border-[#808080] p-1.5">
                        <div className="text-[9px]">GT 115.5MM</div>
                        <div className="font-bold text-sm">{currentDayInfo.ex115}%</div>
                      </div>
                      <div className="bg-white border border-[#808080] p-1.5">
                        <div className="text-[9px]">GT 204.5MM</div>
                        <div className="font-bold text-sm">{currentDayInfo.ex204}%</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] bg-white border border-[#808080] p-2">
                      <b>Diagnostic:</b> {zone.reason}
                    </div>
                  </div>

                  <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-2 flex-1 flex flex-col min-h-[180px]">
                    <div className="text-xs font-bold mb-1">{zone.id} Rainfall Forecast Waveform (mm)</div>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={zoneTimeline} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
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

              <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-c0c0c0 p-2">
                <div className="text-[11px] font-bold mb-1">Select Horizon Lead Day ({zone.id}):</div>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
                  {zoneTimeline.map((d) => {
                    const active = d.day === day;
                    return (
                      <button
                        key={d.day}
                        onClick={() => setDay(d.day)}
                        className={`p-1 text-center text-xs border cursor-pointer ${
                          active ? "bg-[#000080] text-white border-black font-bold" : "bg-[#c0c0c0] border text-black"
                        }`}
                      >
                        <div>D{d.day} ({d.bust}%)</div>
                        <div className="text-[9px]">{d.raw}→{d.corr}</div>
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
        <h2 className="font-brutal text-3xl font-900 uppercase tracking-tighter mb-4 glitch-hover inline-block cursor-pointer">
          FORECASTGUARD
        </h2>
        <p className="font-mono-code text-xs text-zinc-500 uppercase tracking-widest">TEAM 2</p>
      </footer>
    </div>
  );
}
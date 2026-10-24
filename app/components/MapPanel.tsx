"use client";

import { useCallback, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as LeafletNS from "leaflet";
import { REGIMES, ZONES } from "@/app/data/zones";
import { bustColor, getZoneTimeline, rainColor } from "@/app/lib/timeline";

type Props = {
  metric: "RAW" | "CORR" | "BUST";
  day: number;
  selectedId: string;
  onSelect: (id: string) => void;
  /** "modern" = web panel, "retro" = Win32 chrome. */
  variant?: "modern" | "retro";
};

const TILE_URL = "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png";
const ACCENT = "#0c6b5c";

type PaintState = Pick<Props, "metric" | "day" | "selectedId" | "variant">;

/**
 * Leaflet overlay for the 15 monitored subdivisions.
 *
 * The map is created once per mount; day/metric/selection changes only restyle
 * the existing layers. Styling is driven by a "latest props" ref and applied
 * once immediately after the circles are created, so the overlay is never left
 * in Leaflet's default grey state while the async import settles.
 */
export default function MapPanel({
  metric,
  day,
  selectedId,
  onSelect,
  variant = "modern",
}: Props) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletNS.Map | null>(null);
  const layerRef = useRef<Map<string, LeafletNS.Circle>>(new Map());

  const paintState = useRef<PaintState>({ metric, day, selectedId, variant });
  const selectRef = useRef(onSelect);

  /* keep the click handler current without recreating the map */
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  /* ---- paint every circle from the current control state ------------- */
  const paint = useCallback(() => {
    const { metric, day, selectedId, variant } = paintState.current;
    const retro = variant === "retro";

    layerRef.current.forEach((circle, id) => {
      const zone = ZONES.find((z) => z.id === id);
      if (!zone) return;

      const info = getZoneTimeline(zone, REGIMES)[day - 1];
      const selected = id === selectedId;
      const noData = !info.hasData;

      const value = metric === "RAW" ? info.raw : metric === "CORR" ? info.corr : info.bust;

      const fill = noData
        ? retro
          ? "#233b36"
          : "#d8cbb2"
        : metric === "BUST"
          ? bustColor(value)
          : rainColor(value);

      circle.setStyle({
        color: selected
          ? retro
            ? "#ffc857"
            : ACCENT
          : noData
            ? retro
              ? "#46615a"
              : "#9a8f78"
            : retro
              ? "#2b4a45"
              : "#6b6152",
        weight: selected ? 2.5 : 1,
        dashArray: noData ? "4 4" : undefined,
        fillColor: fill,
        fillOpacity: selected ? 0.62 : noData ? 0.24 : 0.42,
      });

      const label = noData
        ? `${zone.id} · no data`
        : metric === "BUST"
          ? `${zone.id} · ${value}%`
          : `${zone.id} · ${value} mm`;

      const bg = retro ? "#081311" : "#fbf6e9";
      const fg = retro
        ? selected
          ? "#ffc857"
          : "#7dfcbf"
        : selected
          ? "#074a40"
          : "#17201d";
      const border = retro ? "#2b4a45" : "#17201d";
      const shadow = retro ? "0 0 0 1px #2b4a45" : "2px 2px 0 #17201d";
      const html = `<div style="font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;background:${bg};color:${fg};padding:2px 6px;border:1px solid ${border};white-space:nowrap;letter-spacing:.03em;box-shadow:${shadow};">${label}</div>`;
      circle.setTooltipContent(html);
    });
  }, []);

  /* ---- create the map once ------------------------------------------- */
  useEffect(() => {
    let disposed = false;

    (async () => {
      const leaflet = await import("leaflet");
      if (disposed || !nodeRef.current) return;

      const map = leaflet.map(nodeRef.current, {
        center: [22.5, 80.5],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true,
      });
      mapRef.current = map;

      leaflet.tileLayer(TILE_URL, { maxZoom: 18, crossOrigin: true }).addTo(map);

      const group = leaflet.layerGroup().addTo(map);
      layerRef.current = new Map();

      ZONES.forEach((zone) => {
        const circle = leaflet.circle(zone.coords, {
          radius: zone.radius,
          color: "#6b6152",
          weight: 1,
          fillColor: "#d8cbb2",
          fillOpacity: 0.4,
        });
        circle.bindTooltip("", {
          permanent: true,
          direction: "center",
          className: "fg-tooltip",
        });
        circle.on("click", () => selectRef.current(zone.id));
        circle.addTo(group);
        layerRef.current.set(zone.id, circle);
      });

      // Apply the current metric immediately — the restyle effect already ran
      // once before these circles existed.
      paint();

      setTimeout(() => map.invalidateSize(), 80);
    })();

    return () => {
      disposed = true;
      layerRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [paint]);

  /* ---- restyle when controls change ---------------------------------- */
  useEffect(() => {
    paintState.current = { metric, day, selectedId, variant };
    paint();
  }, [metric, day, selectedId, variant, paint]);

  /* ---- centre on the selected region (skipping the first render) ------ */
  const firstFly = useRef(true);
  useEffect(() => {
    const map = mapRef.current;
    const zone = ZONES.find((z) => z.id === selectedId);
    if (!map || !zone) return;

    if (firstFly.current) {
      firstFly.current = false;
      return;
    }
    map.flyTo(zone.coords, Math.max(map.getZoom(), 6), { duration: 0.5 });
  }, [selectedId]);

  const retro = variant === "retro";

  return (
    <div className="relative w-full h-full">
      <div
        ref={nodeRef}
        className={`w-full h-full ${retro ? "map-retro" : ""}`}
        style={{ minHeight: retro ? 280 : 400 }}
        role="application"
        aria-label={`Interactive map of monitored meteorological subdivisions showing ${
          metric === "BUST" ? "bust probability" : `${metric.toLowerCase()} rainfall`
        }`}
      />

      {/* Legend — always names the metric the colour encodes */}
      <div
        className={`absolute bottom-2 left-2 z-[500] text-[9px] leading-tight pointer-events-none border-2 ${
          retro
            ? "bg-[#081311]/95 text-[var(--mint-dim)] border-[#2b4a45] px-2 py-1.5 font-mono-code"
            : "bg-[var(--surface)]/95 text-[var(--muted)] border-[var(--ink)] px-2.5 py-2 font-mono-code shadow-[2px_2px_0_rgba(23,32,29,.2)]"
        }`}
      >
        <div
          className={`uppercase tracking-[0.06em] mb-1.5 font-pixel text-[8px] ${
            retro ? "text-[var(--mint)]" : "text-[var(--ink)]"
          }`}
        >
          {metric === "BUST"
            ? "Bust probability"
            : metric === "CORR"
              ? "Corrected rainfall"
              : "Raw rainfall"}
        </div>

        {metric === "BUST" ? (
          <div className="flex flex-col gap-1">
            {[
              ["#1d6f47", "0–20%"],
              ["#236d7b", "20–40%"],
              ["#8a5a09", "40–60%"],
              ["#a9221d", "60–100%"],
            ].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-3.5" style={{ background: c }} />
                <span>{l}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-[104px]">
            <div
              className="h-2 w-full"
              style={{ background: "linear-gradient(to right, #e4dbc6, #1f7a86)" }}
            />
            <div className="flex justify-between mt-1 text-[8px]">
              <span>0</span>
              <span>125</span>
              <span>250+ mm</span>
            </div>
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={`inline-block h-2.5 w-3.5 border border-dashed ${
              retro
                ? "bg-[#233b36] border-[var(--mint-dim)]"
                : "bg-[#d8cbb2] border-[#9a8f78]"
            }`}
          />
          <span>no data</span>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute top-2 right-2 z-[500] border px-2 py-1 font-mono-code text-[9px] ${
          retro
            ? "border-[#2b4a45] bg-[#081311]/90 text-[var(--mint-dim)]"
            : "border-[var(--ink)] bg-[var(--surface)]/90 text-[var(--muted-dim)]"
        }`}
      >
        Basemap © OpenStreetMap · overlay simulated
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import gsap from "gsap";
import { REGIMES, RUN_META, ZONES } from "@/app/data/zones";
import { Reveal } from "./motion";
import { Chip, DemoBadge } from "./ui";
import { useBackend } from "./BackendProvider";

export type Tab = "poster" | "dashboard" | "win32";

const NAV: { key: Tab; label: string }[] = [
  { key: "poster", label: "Overview" },
  { key: "dashboard", label: "Dashboard" },
  { key: "win32", label: "Ops console" },
];

/* ------------------------------------------------------------------ *
 * Mark — blocky radar glyph, drawn inline so it inherits currentColor.
 * ------------------------------------------------------------------ */
function Mark({ className = "" }: { className?: string }) {
  const sweep = useRef<SVGGElement>(null);
  const reduce = useReducedMotion();

  /* A slow, stepped sweep: one revolution every eight seconds. */
  useEffect(() => {
    const el = sweep.current;
    if (!el || reduce) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "steps(12)",
        svgOrigin: "16 25",
      });
    }, el);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      shapeRendering="crispEdges"
    >
      <path d="M2 26h5v-6h4v-5h10v5h4v6h5" opacity="0.9" />
      <path d="M9 26h3v-5h8v5h3" opacity="0.55" />
      <g ref={sweep}>
        <path
          d="M16 25 L26 8 L29 25 Z"
          fill="var(--risk-3)"
          fillOpacity="0.2"
          stroke="none"
        />
        <path d="M16 25 L26 8" stroke="var(--risk-3)" strokeWidth="2" />
      </g>
      <rect x="14" y="23" width="4" height="4" fill="currentColor" stroke="none" />
      <rect x="1" y="30" width="3" height="1" fill="currentColor" stroke="none" opacity="0.4" />
      <rect x="28" y="30" width="3" height="1" fill="currentColor" stroke="none" opacity="0.4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * BackendBadge - live connection state for the FastAPI service.
 * ------------------------------------------------------------------ */
function BackendBadge() {
  const { status, snapshot, refresh } = useBackend();

  const label =
    status === "online" ? "API live" : status === "loading" ? "API …" : "API offline";
  const tone =
    status === "online"
      ? "text-[var(--accent)] border-[var(--accent)]"
      : status === "loading"
        ? "text-[var(--muted)] border-[var(--rule-soft)]"
        : "text-[var(--coral)] border-[var(--coral)]";

  return (
    <button
      type="button"
      onClick={refresh}
      title={
        status === "online"
          ? `Connected to ${snapshot?.latestRun?.run_id ?? "backend"}`
          : "Click to retry the backend connection"
      }
      className={`hidden sm:inline-flex items-center gap-1.5 border px-1.5 py-0.5 font-pixel text-[8px] uppercase tracking-[0.03em] cursor-pointer transition-colors ${tone}`}
    >
      <span
        className={`h-1.5 w-1.5 ${
          status === "online" ? "bg-[var(--accent)]" : status === "offline" ? "bg-[var(--coral)]" : "bg-[var(--muted)]"
        } ${status !== "offline" ? "blink" : ""}`}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * AppHeader
 * ------------------------------------------------------------------ */
export function AppHeader({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
}) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <header className="sticky top-0 z-[900] border-b-2 border-[var(--ink)] bg-[var(--paper)]/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => onTabChange("poster")}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            aria-label="ForecastGuard home"
          >
            <Mark className="w-8 h-8 text-[var(--accent)]" />
            <span className="font-display text-[20px] uppercase leading-none tracking-tight text-[var(--ink)]">
              Forecast<span className="text-[var(--accent)]">Guard</span>
            </span>
            <span className="hidden sm:inline font-pixel text-[8px] uppercase text-[var(--muted)] border border-[var(--ink)] px-1 py-0.5">
              v2.1
            </span>
          </button>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-1.5">
            {NAV.map((n) => {
              const active = n.key === activeTab;
              return (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => onTabChange(n.key)}
                  aria-current={active ? "page" : undefined}
                  className={`font-pixel text-[10px] uppercase px-2.5 py-2 border-2 transition-colors cursor-pointer ${
                    active
                      ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)] shadow-[2px_2px_0_var(--accent)]"
                      : "border-transparent text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                  }`}
                >
                  {n.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab === "poster" ? (
              <a
                href="#method"
                className="hidden lg:inline font-pixel text-[9px] uppercase text-[var(--muted)] hover:text-[var(--ink)] transition-colors underline decoration-dotted underline-offset-4"
              >
                Method
              </a>
            ) : null}
            <BackendBadge />
            <DemoBadge />
          </div>
        </div>

        {/* Mobile nav */}
        <nav aria-label="Primary mobile" className="md:hidden flex gap-1.5 pb-2 -mt-1">
          {NAV.map((n) => {
            const active = n.key === activeTab;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => onTabChange(n.key)}
                aria-current={active ? "page" : undefined}
                className={`font-pixel text-[9px] uppercase px-2 py-1.5 border transition-colors cursor-pointer ${
                  active
                    ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                    : "border-[var(--rule-soft)] text-[var(--muted)]"
                }`}
              >
                {n.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Reading position across the long-form overview. */}
      {reduce ? null : (
        <motion.span
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-[-2px] h-[3px] origin-left bg-[var(--accent)]"
        />
      )}
    </header>
  );
}

function formatBackendTime(iso?: string): string {
  if (!iso) return RUN_META.initTimeIst;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return RUN_META.initTimeIst;
  return `${date.toISOString().slice(0, 16).replace("T", " ")}Z`;
}

/* ------------------------------------------------------------------ *
 * StatusStrip — provenance for the current run.
 * ------------------------------------------------------------------ */
export function StatusStrip({
  day,
  zoneId,
  priorityCount,
  noDataCount,
}: {
  day: number;
  zoneId: string;
  priorityCount: number;
  noDataCount: number;
}) {
  const { status, snapshot } = useBackend();
  const online = status === "online" && Boolean(snapshot);
  const runId = snapshot?.latestRun?.run_id ?? RUN_META.runId;
  const model = snapshot?.latestRun?.model_version ?? RUN_META.modelVersion;
  const init = online
    ? formatBackendTime(snapshot?.latestRun?.initialization_time)
    : RUN_META.initTimeIst;
  const regime = snapshot?.latestRun?.cycle_regime;

  return (
    <div className="border-b-2 border-[var(--ink)] bg-[var(--ink)] text-[#d8cfb8]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-1.5 py-2 font-mono-code text-[10px] tracking-[0.03em]">
          <span className="inline-flex items-center gap-2">
            <span
              className={`w-2 h-2 inline-block ${online ? "bg-[var(--mint)] blink" : "bg-[var(--coral)]"}`}
              aria-hidden="true"
            />
            RUN {runId}
          </span>
          <span className="hidden sm:inline">MODEL {model}</span>
          <span className="hidden md:inline">INIT {init}</span>
          {regime ? <span className="hidden xl:inline">REGIME {regime}</span> : null}
          <span>
            LEAD <strong className="font-medium text-[var(--paper)]">D{day}</strong>
          </span>
          <span className="hidden lg:inline">
            FOCUS <strong className="font-medium text-[var(--paper)]">{zoneId}</strong>
          </span>
          <span className="ml-auto inline-flex items-center gap-3">
            <span className={online ? "text-[var(--mint)]" : "text-[#8f876f]"}>
              {online ? "BACKEND LIVE" : "LOCAL FALLBACK"}
            </span>
            <span className="text-[var(--coral)]">{priorityCount} REQUIRE REVIEW</span>
            <span className="text-[#8f876f]">{noDataCount} NO DATA</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * RunStrip — compact provenance line used inside panels.
 * ------------------------------------------------------------------ */
export function RunStrip({ day, regime }: { day: number; regime: string }) {
  const { status, snapshot } = useBackend();
  const online = status === "online" && Boolean(snapshot);
  const runId = snapshot?.latestRun?.run_id ?? RUN_META.runId;
  const generated = online
    ? formatBackendTime(snapshot?.dataStatus?.last_updated)
    : RUN_META.generatedAtIst;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono-code text-[10px] tracking-[0.03em] text-[var(--muted-dim)]">
      <Chip tone="accent">
        D{day} · {regime}
      </Chip>
      <span>
        run <span className="text-[var(--muted)]">{runId}</span>
      </span>
      <span>
        generated <span className="text-[var(--muted)]">{generated}</span>
      </span>
      <span className="hidden sm:inline">
        source{" "}
        <span className="text-[var(--muted)]">
          {online ? "FastAPI /api/v1" : RUN_META.requestId}
        </span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Footer
 * ------------------------------------------------------------------ */
export function Footer() {
  const { status, snapshot } = useBackend();
  const online = status === "online" && Boolean(snapshot);

  return (
    <footer className="mt-auto border-t-2 border-[var(--ink)] bg-[var(--ink)] text-[#d8cfb8]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-4" y={10}>
            <div className="flex items-center gap-2.5">
              <Mark className="w-8 h-8 text-[var(--mint)]" />
              <span className="font-display text-[20px] uppercase text-[var(--paper)]">
                Forecast<span className="text-[var(--mint)]">Guard</span>
              </span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-[#a9a18b] max-w-xs">
              A reliability layer over existing medium-range forecasts. Prototype for
              Smart India Hackathon 2026, problem statement SIH26079.
            </p>
            <div className="mt-4 flex items-center gap-2 font-pixel text-[8px] uppercase text-[#a9a18b]">
              <span
                className={`h-2 w-2 ${online ? "bg-[var(--mint)] blink" : "bg-[var(--coral)]"}`}
                aria-hidden="true"
              />
              {online ? "Ops station online · backend linked" : "Ops station online · local data"}
            </div>
          </Reveal>

          <Reveal className="md:col-span-5" y={10} delay={0.08}>
            <div className="font-pixel text-[9px] uppercase tracking-[0.04em] text-[var(--mint-dim)]">
              Scope and limitations
            </div>
            <div className="mt-3 space-y-3 text-[12px] leading-relaxed text-[#a9a18b]">
              <p>
                <strong className="font-medium text-[var(--paper)]">
                  Every value in this build is synthetic.
                </strong>{" "}
                {online
                  ? "Values for the four backend sectors are served by the FastAPI demo service; no live NWP run, observation archive or trained model is connected."
                  : "No live NWP run, observation archive or trained model is connected."}
              </p>
              <p>
                ForecastGuard does not replace official forecasts or issue warnings. A low
                bust probability does not imply an absence of hazardous weather.
              </p>
            </div>
          </Reveal>

          <Reveal className="md:col-span-3" y={10} delay={0.16}>
            <div className="font-pixel text-[9px] uppercase tracking-[0.04em] text-[var(--mint-dim)]">
              Threshold definition
            </div>
            <p className="mt-3 font-mono-code text-[10px] leading-relaxed text-[#a9a18b]">
              {RUN_META.thresholdDefinition}
            </p>
            <p className="mt-4 font-mono-code text-[10px] leading-relaxed text-[#8f876f]">
              {online ? snapshot?.dataStatus?.data_source ?? RUN_META.dataSource : RUN_META.dataSource}
            </p>
          </Reveal>
        </div>

        <div className="mt-10 pt-5 border-t border-[#3c453f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-mono-code text-[10px] tracking-[0.03em] text-[#8f876f]">
            {ZONES.length} IMD subdivisions · Day 1–10 horizon
          </p>
          <p className="font-mono-code text-[10px] tracking-[0.03em] text-[#8f876f]">
            {online ? (
              <>
                API{" "}
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:text-[var(--mint)]"
                >
                  {snapshot?.latestRun?.run_id ?? "FastAPI"}
                </a>
              </>
            ) : (
              `${REGIMES.length} synoptic regimes tracked`
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}

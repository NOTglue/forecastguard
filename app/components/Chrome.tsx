"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import gsap from "gsap";
import { REGIMES, RUN_META, ZONES } from "@/app/data/zones";
import { Reveal } from "./motion";
import { Chip, DemoBadge } from "./ui";

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
  return (
    <div className="border-b-2 border-[var(--ink)] bg-[var(--ink)] text-[#d8cfb8]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-1.5 py-2 font-mono-code text-[10px] tracking-[0.03em]">
          <span className="inline-flex items-center gap-2">
            <span
              className="w-2 h-2 bg-[var(--mint)] inline-block blink"
              aria-hidden="true"
            />
            RUN {RUN_META.runId}
          </span>
          <span className="hidden sm:inline">MODEL {RUN_META.modelVersion}</span>
          <span className="hidden md:inline">INIT {RUN_META.initTimeIst}</span>
          <span>
            LEAD <strong className="font-medium text-[var(--paper)]">D{day}</strong>
          </span>
          <span className="hidden lg:inline">
            FOCUS <strong className="font-medium text-[var(--paper)]">{zoneId}</strong>
          </span>
          <span className="ml-auto inline-flex items-center gap-3">
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
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono-code text-[10px] tracking-[0.03em] text-[var(--muted-dim)]">
      <Chip tone="accent">
        D{day} · {regime}
      </Chip>
      <span>
        run <span className="text-[var(--muted)]">{RUN_META.runId}</span>
      </span>
      <span>
        generated <span className="text-[var(--muted)]">{RUN_META.generatedAtIst}</span>
      </span>
      <span>
        request <span className="text-[var(--muted)]">{RUN_META.requestId}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Footer
 * ------------------------------------------------------------------ */
export function Footer() {
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
              <span className="h-2 w-2 bg-[var(--mint)] blink" aria-hidden="true" />
              Ops station online
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
                No live NWP run, observation archive or trained model is connected.
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
              {RUN_META.dataSource}
            </p>
          </Reveal>
        </div>

        <div className="mt-10 pt-5 border-t border-[#3c453f]">
          <p className="font-mono-code text-[10px] leading-[1.9] tracking-[0.02em] text-[#8f876f]">
            Pixel artwork, maps and charts are generated locally by{" "}
            <span className="text-[var(--mint-dim)]">scripts/generate-assets.mjs</span>. Type
            set in Pixelify Sans, Silkscreen and IBM Plex Mono. Basemap tiles © OpenStreetMap
            contributors.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-[#3c453f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-mono-code text-[10px] tracking-[0.03em] text-[#8f876f]">
            Team 2 · SIH26079 · {ZONES.length} IMD subdivisions · Day 1–10 horizon
          </p>
          <p className="font-mono-code text-[10px] tracking-[0.03em] text-[#8f876f]">
            {REGIMES.length} synoptic regimes tracked
          </p>
        </div>
      </div>
    </footer>
  );
}

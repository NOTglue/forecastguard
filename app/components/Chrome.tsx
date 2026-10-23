"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import gsap from "gsap";
import { REGIMES, RUN_META, ZONES } from "@/app/data/zones";
import { EASE, Reveal } from "./motion";
import { Chip, DemoBadge } from "./ui";

export type Tab = "poster" | "dashboard" | "win32";

const NAV: { key: Tab; label: string }[] = [
  { key: "poster", label: "Overview" },
  { key: "dashboard", label: "Dashboard" },
  { key: "win32", label: "Win32 console" },
];

/* ------------------------------------------------------------------ *
 * Mark — small radar glyph, drawn inline so it inherits currentColor.
 * ------------------------------------------------------------------ */
function Mark({ className = "" }: { className?: string }) {
  const sweep = useRef<SVGGElement>(null);
  const reduce = useReducedMotion();

  /* A slow sweep, not a loader: one revolution every twelve seconds. */
  useEffect(() => {
    const el = sweep.current;
    if (!el || reduce) return;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: "none",
        svgOrigin: "16 23",
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
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 23a11 11 0 0 1 22 0" opacity="0.55" />
      <path d="M10 23a6 6 0 0 1 12 0" opacity="0.8" />
      <g ref={sweep}>
        <path
          d="M16 23 L22.3 14 A11 11 0 0 1 27 23 Z"
          fill="var(--risk-3)"
          fillOpacity="0.16"
          stroke="none"
        />
        <path d="M16 23 22.3 14" stroke="var(--risk-3)" />
      </g>
      <circle cx="16" cy="23" r="1.8" fill="currentColor" stroke="none" />
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
    <header className="sticky top-0 z-[900] border-b border-[var(--rule)] bg-[var(--paper)]/92 backdrop-blur-md">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => onTabChange("poster")}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            aria-label="ForecastGuard home"
          >
            <Mark className="w-7 h-7 text-[var(--accent)]" />
            <span className="font-display text-[19px] leading-none text-[var(--ink)]">
              Forecast<span className="text-[var(--accent)]">Guard</span>
            </span>
          </button>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-7">
            {NAV.map((n) => {
              const active = n.key === activeTab;
              return (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => onTabChange(n.key)}
                  aria-current={active ? "page" : undefined}
                  className={`relative py-1 text-[13px] transition-colors cursor-pointer ${
                    active
                      ? "text-[var(--ink)]"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {n.label}
                  {active ? (
                    <motion.span
                      layoutId="nav-underline"
                      aria-hidden="true"
                      className="absolute -bottom-[15px] left-0 right-0 h-[2px] bg-[var(--accent)]"
                      transition={{ duration: 0.34, ease: EASE }}
                    />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab === "poster" ? (
              <a
                href="#method"
                className="hidden lg:inline text-[12px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                Method
              </a>
            ) : null}
            <DemoBadge />
          </div>
        </div>

        {/* Mobile nav */}
        <nav aria-label="Primary mobile" className="md:hidden flex gap-5 pb-2 -mt-1">
          {NAV.map((n) => {
            const active = n.key === activeTab;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => onTabChange(n.key)}
                aria-current={active ? "page" : undefined}
                className={`text-[12px] pb-1 border-b-2 transition-colors cursor-pointer ${
                  active
                    ? "border-[var(--accent)] text-[var(--ink)]"
                    : "border-transparent text-[var(--muted)]"
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
          className="absolute inset-x-0 bottom-[-1px] h-[2px] origin-left bg-[var(--accent)]"
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
    <div className="border-b border-[var(--rule)] bg-[var(--surface-2)]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-1.5 py-2 font-mono-code text-[10px] tracking-[0.05em] text-[var(--muted)]">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[var(--risk-0)] inline-block" aria-hidden="true" />
            Run {RUN_META.runId}
          </span>
          <span className="hidden sm:inline">Model {RUN_META.modelVersion}</span>
          <span className="hidden md:inline">Init {RUN_META.initTimeIst}</span>
          <span>
            Lead day <strong className="font-medium text-[var(--ink)]">D{day}</strong>
          </span>
          <span className="hidden lg:inline">
            Focus <strong className="font-medium text-[var(--ink)]">{zoneId}</strong>
          </span>
          <span className="ml-auto inline-flex items-center gap-3">
            <span className="text-[var(--risk-3)]">{priorityCount} require review</span>
            <span className="text-[var(--muted-dim)]">{noDataCount} no data</span>
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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono-code text-[10px] tracking-[0.05em] text-[var(--muted-dim)]">
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
    <footer className="mt-auto border-t border-[var(--rule)] bg-[var(--paper-2)]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <Reveal className="md:col-span-4" y={10}>
            <div className="flex items-center gap-2.5">
              <Mark className="w-7 h-7 text-[var(--accent)]" />
              <span className="font-display text-[19px] text-[var(--ink)]">
                Forecast<span className="text-[var(--accent)]">Guard</span>
              </span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)] max-w-xs">
              A reliability layer over existing medium-range forecasts. Prototype for
              Smart India Hackathon 2026, problem statement SIH26079.
            </p>
          </Reveal>

          <Reveal className="md:col-span-5" y={10} delay={0.08}>
            <div className="label text-[var(--muted-dim)]">Scope and limitations</div>
            <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-[var(--muted)]">
              <p>
                <strong className="font-medium text-[var(--ink)]">
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
            <div className="label text-[var(--muted-dim)]">Threshold definition</div>
            <p className="mt-3 font-mono-code text-[11px] leading-relaxed text-[var(--muted)]">
              {RUN_META.thresholdDefinition}
            </p>
            <p className="mt-4 font-mono-code text-[10px] leading-relaxed text-[var(--muted-dim)]">
              {RUN_META.dataSource}
            </p>
          </Reveal>
        </div>

        <div className="mt-10 pt-5 border-t border-[var(--rule)]">
          <p className="font-mono-code text-[10px] leading-[1.9] tracking-[0.03em] text-[var(--muted-dim)]">
            Background photographs:{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Anvil_Clouds_over_the_Bay_of_Bengal_(NESDIS_2019-06-26).png"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              Anvil clouds over the Bay of Bengal
            </a>{" "}
            (NOAA, public domain) ·{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:Kerala_Monsoon_clouds_over_Western_Ghats_India.jpg"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              Monsoon clouds over the Western Ghats
            </a>{" "}
            by Nagesh Jayaraman (CC BY 2.0) ·{" "}
            <a
              href="https://commons.wikimedia.org/wiki/File:NOAA20.VIISRS.true.daily.20190811.color.India.Bangladesch.full_res.png"
              target="_blank"
              rel="noreferrer noopener"
              className="underline decoration-[var(--rule)] underline-offset-2 hover:text-[var(--accent)] hover:decoration-[var(--accent)]"
            >
              VIIRS true colour, 11 August 2019
            </a>{" "}
            by NOAA (public domain).
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-[var(--rule)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-mono-code text-[10px] tracking-[0.05em] text-[var(--muted-dim)]">
            Team 2 · SIH26079 · {ZONES.length} IMD subdivisions · Day 1–10 horizon
          </p>
          <p className="font-mono-code text-[10px] tracking-[0.05em] text-[var(--muted-dim)]">
            {REGIMES.length} synoptic regimes tracked
          </p>
        </div>
      </div>
    </footer>
  );
}

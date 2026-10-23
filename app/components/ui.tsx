"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { useBackdropParallax } from "./Atmosphere";
import { EASE } from "./motion";

/* ------------------------------------------------------------------ *
 * Panel — a plain white surface separated by a hairline.
 * ------------------------------------------------------------------ */
export function Panel({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={`bg-[var(--surface)] border border-[var(--rule)] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * PanelHeader — quiet caption bar.
 * ------------------------------------------------------------------ */
export function PanelHeader({
  title,
  meta,
  right,
}: {
  title: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--rule-soft)]">
      <div className="flex items-baseline gap-3 min-w-0">
        <span className="font-mono-code text-[10px] uppercase tracking-[0.11em] text-[var(--ink)] truncate">
          {title}
        </span>
        {meta ? (
          <span className="font-mono-code text-[10px] tracking-[0.06em] text-[var(--muted-dim)] truncate">
            {meta}
          </span>
        ) : null}
      </div>
      {right ? <div className="shrink-0 flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Eyebrow — a label with a leading rule, no pill.
 * ------------------------------------------------------------------ */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-mono-code text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] ${className}`}
    >
      <motion.span
        className="h-px w-7 origin-left bg-[var(--accent)]"
        aria-hidden="true"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.65, ease: EASE }}
      />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * SectionHeader — editorial section heading.
 * ------------------------------------------------------------------ */
export function SectionHeader({
  title,
  lede,
  right,
  className = "",
}: {
  title: ReactNode;
  lede?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-end justify-between gap-5 ${className}`}
    >
      <div className="max-w-2xl">
        <h2 className="font-display text-[1.75rem] sm:text-[2.1rem] leading-[1.12] text-[var(--ink)]">
          {title}
        </h2>
        {lede ? (
          <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--muted)] max-w-xl">
            {lede}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Stat — labelled figure.
 * ------------------------------------------------------------------ */
export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "accent" | "danger" | "muted";
}) {
  const color =
    tone === "accent"
      ? "var(--accent)"
      : tone === "danger"
        ? "var(--risk-3)"
        : tone === "muted"
          ? "var(--muted)"
          : "var(--ink)";
  return (
    <div className="min-w-0">
      <div className="label text-[var(--muted-dim)]">{label}</div>
      <div className="font-display text-xl leading-tight tnum truncate" style={{ color }}>
        {value}
      </div>
      {hint ? (
        <div className="font-mono-code text-[10px] text-[var(--muted-dim)] truncate">{hint}</div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Chip — small tinted label using the risk ramp.
 * ------------------------------------------------------------------ */
const CHIP: Record<string, string> = {
  muted: "text-[var(--muted)] bg-[var(--surface-2)] border-[var(--rule-soft)]",
  accent: "text-[var(--accent)] bg-[#eef3f7] border-[#cfdde8]",
  ok: "text-[var(--risk-0)] bg-[#eaf1ec] border-[#c9dbd1]",
  cool: "text-[#23596f] bg-[#e9f0f4] border-[#c6d9e2]",
  warn: "text-[var(--risk-1)] bg-[#f6f1e2] border-[#e0d5b6]",
  danger: "text-[var(--risk-3)] bg-[#f7eae8] border-[#e3c7c3]",
};

export function Chip({
  children,
  tone = "muted",
  className = "",
}: {
  children: ReactNode;
  tone?: "muted" | "accent" | "danger" | "warn" | "ok" | "cool";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono-code text-[9px] uppercase tracking-[0.09em] border px-1.5 py-0.5 ${CHIP[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * DaySelector — Day 1..10. Underline on the active day.
 * ------------------------------------------------------------------ */
export function DaySelector({
  day,
  onChange,
  compact = false,
  className = "",
}: {
  day: number;
  onChange: (d: number) => void;
  compact?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const pillId = useId();

  return (
    <div
      role="group"
      aria-label="Select forecast lead day"
      className={`inline-flex flex-wrap border border-[var(--rule)] bg-[var(--surface)] ${className}`}
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((d, i) => {
        const active = d === day;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            aria-pressed={active}
            className={`relative font-mono-code uppercase transition-colors cursor-pointer border-l border-[var(--rule-soft)] first:border-l-0 ${
              compact ? "text-[10px] px-2 py-1.5" : "text-[11px] px-2.5 py-2"
            } ${
              active
                ? "text-white font-semibold"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            }`}
            style={{ borderLeftWidth: i === 0 ? 0 : 1 }}
          >
            {/* The selected day is a single element that slides between cells. */}
            {active ? (
              reduce ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[var(--accent)]"
                />
              ) : (
                <motion.span
                  aria-hidden="true"
                  layoutId={`day-pill-${pillId}`}
                  className="absolute inset-0 bg-[var(--accent)]"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )
            ) : null}
            <span className="relative">{`D${d}`}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * MetricToggle — RAW / CORR / BUST.
 * ------------------------------------------------------------------ */
export function MetricToggle({
  metric,
  onChange,
  tone = "modern",
}: {
  metric: "RAW" | "CORR" | "BUST";
  onChange: (m: "RAW" | "CORR" | "BUST") => void;
  tone?: "modern" | "retro";
}) {
  const options = ["RAW", "CORR", "BUST"] as const;
  return (
    <div
      role="group"
      aria-label="Select metric view"
      className={`inline-flex items-center font-mono-code text-[10px] ${
        tone === "retro" ? "text-black" : "text-[var(--muted)]"
      }`}
    >
      <span className="uppercase tracking-[0.1em] mr-2 hidden sm:inline text-[var(--muted-dim)]">
        Metric
      </span>
      <div
        className={`inline-flex ${
          tone === "retro" ? "border border-[#7a7a7a]" : "border border-[var(--rule)]"
        }`}
      >
        {options.map((m, i) => {
          const active = m === metric;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              aria-pressed={active}
              className={`uppercase px-2.5 py-1.5 cursor-pointer transition-colors ${
                tone === "retro"
                  ? active
                    ? "bg-[#243a63] text-white font-semibold"
                    : "bg-[#c3c3c3] text-black hover:bg-[#d2d2d2]"
                  : active
                    ? "accent-bg font-semibold"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              } ${i > 0 ? (tone === "retro" ? "border-l border-[#7a7a7a]" : "border-l border-[var(--rule)]") : ""}`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * ProgressBar — thin meter.
 * ------------------------------------------------------------------ */
export function ProgressBar({
  value,
  color,
  className = "",
}: {
  value: number;
  color: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const reduce = useReducedMotion();
  return (
    <div
      className={`h-[5px] w-full bg-[var(--surface-3)] overflow-hidden ${className}`}
      role="img"
      aria-label={`${value} percent`}
    >
      <motion.div
        className="h-full"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ background: color }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * DemoBadge — mandatory SIMULATED marker (PRD AC-12).
 * ------------------------------------------------------------------ */
export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-[#e0d5b6] bg-[#f6f1e2] text-[var(--risk-1)] px-2 py-0.5 font-mono-code text-[9px] uppercase tracking-[0.1em] font-medium ${className}`}
      title="All values in this build are synthetic. No live NWP or observation feed is connected."
    >
      <span className="w-1.5 h-1.5 bg-[var(--risk-1)] inline-block" aria-hidden="true" />
      Simulated data
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Caveat — standing note about what the numbers mean.
 * ------------------------------------------------------------------ */
export function Caveat({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-mono-code text-[10px] leading-relaxed text-[var(--muted-dim)] ${className}`}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ *
 * Backdrop — a non-interactive image layer for section backgrounds.
 * ------------------------------------------------------------------ */
export function Backdrop({
  src,
  opacity = 0.5,
  position = "center",
  wash = "paper",
  priority = false,
  drift = false,
  className = "",
}: {
  src: string;
  opacity?: number;
  position?: string;
  wash?: "paper" | "left" | "none";
  priority?: boolean;
  /** Scroll-scrubbed parallax. Reserved for full-bleed photographic backdrops. */
  drift?: boolean;
  className?: string;
}) {
  const imgRef = useBackdropParallax(drift);
  return (
    <div className={`backdrop-img ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        style={{ opacity, objectPosition: position }}
        loading="eager"
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
      {wash !== "none" ? (
        <div className={wash === "left" ? "absolute inset-0 wash-left" : "absolute inset-0 wash-paper"} />
      ) : null}
    </div>
  );
}

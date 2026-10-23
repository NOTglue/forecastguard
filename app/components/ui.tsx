"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, type ReactNode } from "react";
import { useBackdropParallax } from "./Atmosphere";
import { EASE } from "./motion";

/* ------------------------------------------------------------------ *
 * Panel — a hard-edged instrument card.
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
    <Tag className={`pixel-panel ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * PanelHeader — pixel caption bar.
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
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b-2 border-[var(--ink)] bg-[var(--surface-2)]">
      <div className="flex items-baseline gap-2.5 min-w-0">
        <span
          className="inline-block h-2 w-2 shrink-0 translate-y-[-1px] bg-[var(--accent)]"
          aria-hidden="true"
        />
        <span className="font-pixel text-[10px] uppercase tracking-[0.03em] text-[var(--ink)] truncate">
          {title}
        </span>
        {meta ? (
          <span className="font-mono-code text-[10px] tracking-[0.02em] text-[var(--muted)] truncate">
            {meta}
          </span>
        ) : null}
      </div>
      {right ? <div className="shrink-0 flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Eyebrow — pixel label with a hard leading block.
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
      className={`inline-flex items-center gap-2.5 font-pixel text-[10px] uppercase tracking-[0.05em] text-[var(--muted)] ${className}`}
    >
      <motion.span
        className="h-2 w-2 bg-[var(--accent)]"
        aria-hidden="true"
        initial={reduce ? false : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * SectionHeader — pixel editorial section heading.
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
        <h2 className="font-display text-[1.65rem] sm:text-[2rem] leading-[1.05] text-[var(--ink)]">
          {title}
        </h2>
        {lede ? (
          <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--muted)] max-w-xl">
            {lede}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Stat — labelled pixel figure.
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
 * Chip — small stamped label.
 * ------------------------------------------------------------------ */
const CHIP: Record<string, string> = {
  muted: "text-[var(--muted)] bg-[var(--surface-2)] border-[var(--ink)]",
  accent: "text-[var(--accent-ink)] bg-[#d9ede6] border-[var(--ink)]",
  ok: "text-[var(--risk-0)] bg-[#dbeada] border-[var(--ink)]",
  cool: "text-[#1e5b6e] bg-[#d8e8ee] border-[var(--ink)]",
  warn: "text-[var(--risk-1)] bg-[#f6e6bd] border-[var(--ink)]",
  danger: "text-[var(--risk-3)] bg-[#f3d6cf] border-[var(--ink)]",
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
      className={`inline-flex items-center gap-1.5 font-pixel text-[9px] uppercase tracking-[0.03em] border px-1.5 py-1 shadow-[1px_1px_0_var(--ink)] ${CHIP[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * DaySelector — Day 1..10. The active day is a filled block.
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
      className={`inline-flex flex-wrap border-2 border-[var(--ink)] bg-[var(--surface)] shadow-[3px_3px_0_rgba(23,32,29,.18)] ${className}`}
    >
      {Array.from({ length: 10 }, (_, i) => i + 1).map((d, i) => {
        const active = d === day;
        return (
          <button
            key={d}
            type="button"
            onClick={() => onChange(d)}
            aria-pressed={active}
            className={`relative font-pixel uppercase transition-colors cursor-pointer border-l border-[var(--rule-soft)] first:border-l-0 ${
              compact ? "text-[10px] px-2 py-2" : "text-[10px] px-2.5 py-2.5"
            } ${
              active
                ? "text-[var(--paper)] font-bold"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            }`}
            style={{ borderLeftWidth: i === 0 ? 0 : 1 }}
          >
            {/* The selected day is a single element that slides between cells. */}
            {active ? (
              reduce ? (
                <span aria-hidden="true" className="absolute inset-0 bg-[var(--accent)]" />
              ) : (
                <motion.span
                  aria-hidden="true"
                  layoutId={`day-pill-${pillId}`}
                  className="absolute inset-0 bg-[var(--accent)]"
                  transition={{ type: "spring", stiffness: 520, damping: 40 }}
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
  const retro = tone === "retro";
  return (
    <div
      role="group"
      aria-label="Select metric view"
      className={`inline-flex items-center font-pixel text-[10px] ${
        retro ? "text-[var(--mint)]" : "text-[var(--muted)]"
      }`}
    >
      <span className="uppercase tracking-[0.05em] mr-2 hidden sm:inline opacity-70">
        Metric
      </span>
      <div
        className={`inline-flex ${
          retro
            ? "border-2 border-[var(--mint-dim)] bg-[#081311]"
            : "border-2 border-[var(--ink)] bg-[var(--surface)] shadow-[3px_3px_0_rgba(23,32,29,.18)]"
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
                retro
                  ? active
                    ? "bg-[var(--signal)] text-[#1a1200] font-bold"
                    : "text-[var(--mint-dim)] hover:bg-[#102420] hover:text-[var(--mint)]"
                  : active
                    ? "accent-bg font-bold"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
              } ${
                i > 0
                  ? retro
                    ? "border-l border-[var(--mint-dim)]"
                    : "border-l border-[var(--rule-soft)]"
                  : ""
              }`}
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
 * ProgressBar — segmented pixel meter.
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
      className={`pixel-meter ${className}`}
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
      <span className="pixel-meter-segments" aria-hidden="true" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * DemoBadge — mandatory SIMULATED marker (PRD AC-12).
 * ------------------------------------------------------------------ */
export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-[var(--ink)] bg-[#f6e6bd] text-[var(--risk-1)] px-2 py-1 font-pixel text-[9px] uppercase tracking-[0.03em] shadow-[2px_2px_0_var(--ink)] ${className}`}
      title="All values in this build are synthetic. No live NWP or observation feed is connected."
    >
      <span className="w-1.5 h-1.5 bg-[var(--risk-2)] inline-block blink" aria-hidden="true" />
      Simulated
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
 * WindowFrame — dark title bar over a hard pixel frame.
 * ------------------------------------------------------------------ */
export function WindowFrame({
  title,
  meta,
  children,
  className = "",
  bodyClassName = "",
  tone = "dark",
}: {
  title: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "dark" | "mint";
}) {
  return (
    <div className={`pixel-window ${className}`}>
      <div
        className={`pixel-window-bar px-3 py-2 ${
          tone === "mint" ? "!bg-[var(--accent)] !text-[var(--paper)]" : ""
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          <span
            className={`inline-block h-2 w-2 shrink-0 ${
              tone === "mint" ? "bg-[var(--signal)]" : "bg-[var(--coral)]"
            } blink`}
            aria-hidden="true"
          />
          <span className="truncate">{title}</span>
        </span>
        {meta ? <span className="hidden sm:inline opacity-70 shrink-0">{meta}</span> : null}
        <span className="flex items-center gap-1 shrink-0" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-2 w-2 border border-current opacity-70"
            />
          ))}
        </span>
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
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
  pixelated = false,
  pixelAnim = false,
  className = "",
}: {
  src: string;
  opacity?: number;
  position?: string;
  wash?: "paper" | "left" | "none";
  priority?: boolean;
  /** Scroll-scrubbed parallax. Reserved for full-bleed textured backdrops. */
  drift?: boolean;
  /** Crisp nearest-neighbour rendering for the pixelated photo backdrops. */
  pixelated?: boolean;
  /** Slow stepped pan. Use instead of `drift`; both animate `transform`. */
  pixelAnim?: boolean;
  className?: string;
}) {
  const imgRef = useBackdropParallax(drift && !pixelAnim);
  return (
    <div className={`backdrop-img ${className}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        className={`${pixelated ? "pixel-photo" : ""} ${pixelAnim ? "pixel-photo--pan" : ""}`}
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

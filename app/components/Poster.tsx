"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { REGIMES, RUN_META, TEAM, ZONES } from "@/app/data/zones";
import { confidenceLabel, confidenceTone, getZoneTimeline, TONE_COLOR } from "@/app/lib/timeline";
import { CloudField, CountUp, ScrubRule } from "./Atmosphere";
import { EASE, fadeItem, ParallaxBox, Reveal, rowItem, SplitWords, Stagger, staggerParent, AnimatedNumber } from "./motion";
import { Backdrop, Caveat, Chip, DaySelector, Eyebrow, Panel, ProgressBar, SectionHeader } from "./ui";

type Props = {
  day: number;
  onDayChange: (d: number) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenDashboard: () => void;
  onOpenWin32: () => void;
};

/* Tighter sequence for long lists, where 0.065s per row reads as a lag. */
const listParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
};

/* Hero key figures. Numbers count up; "D1–D10" is a range, so it stays text. */
const KEY_FIGURES: { count?: number; text?: string; label: string; hint: string }[] = [
  { count: 15, label: "IMD subdivisions under watch", hint: "Assam to Saurashtra" },
  { text: "D1–D10", label: "Medium-range lead days", hint: "Day-by-day estimates" },
  { count: 10, label: "Synoptic regimes tracked", hint: "Troughs to easterly waves" },
  { count: 3, label: "Heavy-rain thresholds", hint: "64.5 · 115.5 · 204.5 mm" },
];

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */
function Hero({
  onOpenDashboard,
  onOpenWin32,
}: Pick<Props, "onOpenDashboard" | "onOpenWin32">) {
  const reduce = useReducedMotion();

  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden border-b border-[var(--rule)]">
      <Backdrop src="/img/bg-hero.jpg" opacity={1} position="50% 55%" wash="none" priority drift />

      {/* Drifting cloud banks sit over the photograph and under the reading scrim. */}
      <CloudField opacity={1} />

      {/* Reading scrim: opaque over the copy column, open to the photograph on the right. */}
      <div className="absolute inset-0 z-[2] bg-[linear-gradient(96deg,rgba(247,246,242,.95)_0%,rgba(247,246,242,.9)_30%,rgba(247,246,242,.7)_48%,rgba(247,246,242,.14)_68%,rgba(247,246,242,.28)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-[2] h-28 bg-[linear-gradient(to_top,rgba(247,246,242,.95),rgba(247,246,242,0))]" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 sm:px-8 pt-14 pb-14 md:pt-20 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Copy */}
          <div className="lg:col-span-6">
            <motion.div {...enter(0)}>
              <Eyebrow>SIH26079 · Decision-support prototype</Eyebrow>
            </motion.div>

            <h1 className="font-display mt-6 text-[2.8rem] sm:text-[3.5rem] lg:text-[3.9rem] leading-[1.02] tracking-[-0.015em] text-[var(--ink)]">
              <SplitWords text="Know where the forecast is" delay={0.1} />
              {" "}
              <motion.em
                className="italic text-[var(--accent)] pb-[0.08em] [background-image:linear-gradient(currentColor,currentColor)] [background-repeat:no-repeat] [background-position:0_100%] [box-decoration-break:clone]"
                initial={reduce ? false : { backgroundSize: "0% 2px" }}
                animate={{ backgroundSize: "100% 2px" }}
                transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
              >
                <SplitWords text="likely to fail" delay={0.32} />
              </motion.em>
              .
            </h1>

            <motion.p
              {...enter(0.42)}
              className="mt-6 max-w-[33rem] text-[16px] leading-[1.7] text-[var(--ink-2)]"
            >
              ForecastGuard estimates the probability that a medium-range rainfall forecast
              will be substantially wrong — by subdivision, by lead day, and by synoptic
              regime — so limited review effort goes where it matters most.
            </motion.p>

            <motion.div
              {...enter(0.52)}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <motion.button
                type="button"
                onClick={onOpenDashboard}
                whileHover={reduce ? undefined : { y: -1 }}
                whileTap={reduce ? undefined : { y: 0 }}
                className="accent-bg px-6 py-3 text-[14px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
              >
                Open the dashboard
              </motion.button>
              <button
                type="button"
                onClick={onOpenWin32}
                className="group text-[13px] text-[var(--ink-2)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--accent)] hover:decoration-[var(--accent)] transition-colors cursor-pointer"
              >
                View the Win32 console
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  {" "}
                  →
                </span>
              </button>
            </motion.div>

            <motion.p
              {...enter(0.6)}
              className="mt-8 font-mono-code text-[10px] leading-relaxed tracking-[0.04em] text-[var(--muted-dim)]"
            >
              Prototype build · all values synthetic · run {RUN_META.runId}
            </motion.p>
          </div>

          {/* Atlas figure */}
          <div className="lg:col-span-6">
            <motion.figure
              initial={reduce ? false : { opacity: 0, y: 28, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.15, ease: EASE }}
              className="border border-[var(--rule)] bg-[var(--surface)] shadow-[0_24px_60px_-32px_rgba(20,23,26,.45)]"
            >
              <span className="block h-[3px] bg-[var(--accent)]" aria-hidden="true" />
              <div className="relative overflow-hidden">
                <Image
                  src="/img/hero-atlas.svg"
                  alt="Atlas-style map of India showing the fifteen monitored meteorological subdivisions, with shaded rainfall cells over the Konkan coast, Odisha, Assam and Kerala."
                  width={1200}
                  height={900}
                  priority
                  className="block h-auto w-full"
                />
                {/* The plate prints in from the left. */}
                {reduce ? null : (
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[var(--surface)]"
                    initial={{ x: "0%" }}
                    animate={{ x: "101%" }}
                    transition={{ duration: 1, delay: 0.4, ease: EASE }}
                  />
                )}
              </div>
              <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--rule)] px-4 py-2.5">
                <span className="font-mono-code text-[10px] tracking-[0.06em] text-[var(--muted)]">
                  Fig. 1 — Watch areas and active rainfall cells
                </span>
                <Chip tone="warn">Simulated</Chip>
              </figcaption>
            </motion.figure>
          </div>
        </div>
      </div>

      {/* Key figures */}
      <div className="relative z-10 border-t border-[var(--rule)] bg-[rgba(247,246,242,.86)] backdrop-blur-[2px]">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <motion.dl
            className="grid grid-cols-2 md:grid-cols-4"
            variants={staggerParent}
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {KEY_FIGURES.map((f, i) => (
              <motion.div
                key={f.label}
                variants={fadeItem}
                className={`py-6 border-[var(--rule-soft)] ${
                  i % 2 === 0 ? "pr-4" : "pl-4"
                } ${i === 3 ? "md:pr-0" : "md:pr-5"} ${i === 0 ? "" : "md:pl-5"} ${
                  i % 2 === 1 ? "border-l" : ""
                } ${i >= 1 ? "md:border-l" : ""} ${
                  i >= 2 ? "border-t md:border-t-0" : ""
                }`}
              >
                <dt className="font-mono-code text-[10px] uppercase tracking-[0.1em] text-[var(--muted-dim)]">
                  {f.label}
                </dt>
                <dd className="mt-2 font-display text-[1.7rem] leading-none text-[var(--ink)] tnum">
                  {f.count === undefined ? f.text : <CountUp value={f.count} />}
                </dd>
                <dd className="mt-1.5 text-[12px] text-[var(--muted)]">{f.hint}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Method
 * ------------------------------------------------------------------ */
const STEPS = [
  {
    n: "1",
    title: "Read the regime",
    body: "Attributes each forecast day to a documented failure regime — active trough, bay depression, monsoon break, western disturbance interaction and six others.",
  },
  {
    n: "2",
    title: "Estimate the risk",
    body: "Produces a bust probability per subdivision and lead day, alongside heavy-rain exceedance estimates for the three IMD threshold bands.",
  },
  {
    n: "3",
    title: "Direct the review",
    body: "Ranks the zones and days that most deserve human scrutiny, and exposes the underlying series so the call remains explainable.",
  },
];

function Method() {
  const reduce = useReducedMotion();

  return (
    <section id="method" className="relative overflow-hidden border-b border-[var(--rule)]">
      <Backdrop src="/img/bg-topo.svg" opacity={1} position="50% 50%" wash="none" drift />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,246,242,.9)_0%,rgba(247,246,242,.45)_22%,rgba(247,246,242,.28)_58%,rgba(247,246,242,.85)_100%)]" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <Reveal className="lg:col-span-5">
            <Eyebrow>Why this exists</Eyebrow>
            <ScrubRule className="mt-5 w-24" tone="accent" />
            <h2 className="font-display mt-5 text-[1.9rem] sm:text-[2.25rem] leading-[1.12] text-[var(--ink)]">
              Forecast skill is not uniform. Neither should confidence be.
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-[1.72] text-[var(--ink-2)]">
              <p>
                Medium-range rainfall forecasts degrade unevenly. A model that performs well
                over the Deccan interior can be badly wrong along the Western Ghats, in the
                Khasi Hills, or during a monsoon break.
              </p>
              <p>
                When every district receives the same undifferentiated product, the places
                most likely to be mis-cast are the hardest to spot. ForecastGuard adds a
                reliability estimate on top of the existing forecast rather than replacing it.
              </p>
            </div>

            <div className="relative mt-7 pl-4">
              {/* The rule draws down as the pull quote is read. */}
              <motion.span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-[2px] origin-top bg-[var(--accent)]"
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, ease: EASE }}
              />
              <p className="font-display text-[17px] leading-snug text-[var(--ink)]">
                “Treat a high bust probability as a prompt to look closer — not as a
                prediction of impact.”
              </p>
            </div>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <figure className="border border-[var(--rule)] bg-[var(--surface)]">
                <Image
                  src="/img/feature-horizon.svg"
                  alt="Bar chart showing bust probability rising through the ten-day horizon, peaking around day four above the review threshold."
                  width={720}
                  height={460}
                  className="block h-auto w-full"
                />
                <figcaption className="border-t border-[var(--rule)] px-4 py-2.5 text-[11px] text-[var(--muted)]">
                  Illustrative bust probability by lead day for a single subdivision. Values are
                  synthetic.
                </figcaption>
              </figure>
            </Reveal>

            <ScrubRule className="mt-8" />
            <Stagger className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6" amount={0.4}>
              {STEPS.map((s) => (
                <motion.div
                  key={s.n}
                  variants={fadeItem}
                  whileHover={reduce ? undefined : { y: -2 }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono-code text-[10px] text-[var(--accent)]">
                      {s.n.padStart(2, "0")}
                    </span>
                    <h3 className="text-[14px] font-semibold text-[var(--ink)]">{s.title}</h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{s.body}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Reading key — the four bust bands and the decision behind each.
 * ------------------------------------------------------------------ */
const RISK_BANDS = [
  { tone: "ok", range: "0–20%", label: "Higher confidence", action: "Routine review" },
  { tone: "cool", range: "21–40%", label: "Moderate confidence", action: "Watch the series" },
  { tone: "warn", range: "41–60%", label: "Reduced confidence", action: "Review before issue" },
  { tone: "danger", range: "61–100%", label: "Low confidence", action: "Escalate for manual check" },
] as const;

function ReadingKey() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-[var(--rule)]">
      <Backdrop src="/img/bg-band.jpg" opacity={1} position="50% 60%" wash="none" priority drift />
      <div className="absolute inset-0 bg-[linear-gradient(94deg,rgba(247,246,242,.97)_0%,rgba(247,246,242,.92)_38%,rgba(247,246,242,.66)_64%,rgba(247,246,242,.42)_100%)]" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <Reveal className="lg:col-span-4">
            <Eyebrow>Reading key</Eyebrow>
            <h2 className="font-display mt-5 text-[1.9rem] leading-[1.12] text-[var(--ink)]">
              Four bands, one review decision behind each.
            </h2>
            <p className="mt-4 text-[14px] leading-[1.7] text-[var(--ink-2)]">
              Bust probability is shown as a band rather than a decimal because the
              underlying calibration does not support finer resolution.
            </p>
          </Reveal>

          <div className="lg:col-span-8">
            <motion.dl
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-8"
              variants={staggerParent}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {RISK_BANDS.map((band, i) => (
                <motion.div
                  key={band.tone}
                  variants={fadeItem}
                  whileHover={reduce ? undefined : { y: -2 }}
                  className="border-t border-[var(--rule)] py-4"
                >
                  <dt>
                    <motion.span
                      className="block h-[6px] w-full origin-left"
                      style={{ background: TONE_COLOR[band.tone] }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.75, delay: 0.08 + i * 0.07, ease: EASE }}
                      aria-hidden="true"
                    />
                    <span className="mt-3 flex items-baseline justify-between gap-3">
                      <span className="text-[14px] text-[var(--ink)]">{band.label}</span>
                      <span className="font-mono-code text-[11px] tnum text-[var(--muted)]">
                        {band.range}
                      </span>
                    </span>
                  </dt>
                  <dd className="mt-1 font-mono-code text-[10px] uppercase tracking-[0.08em] text-[var(--muted-dim)]">
                    {band.action}
                  </dd>
                </motion.div>
              ))}
            </motion.dl>
            <Caveat className="mt-6">
              Band thresholds follow PRD §9.1 and are a presentation default. They are not
              calibrated against verification statistics in this build.
            </Caveat>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Subdivision ranking
 * ------------------------------------------------------------------ */
function SubdivisionSection({
  day,
  onDayChange,
  selectedId,
  onSelect,
  onOpenDashboard,
}: Pick<
  Props,
  "day" | "onDayChange" | "selectedId" | "onSelect" | "onOpenDashboard"
>) {
  const all = ZONES.map((zone) => ({ zone, info: getZoneTimeline(zone, REGIMES)[day - 1] }));
  const rows = all.filter((r) => r.info.hasData).sort((a, b) => b.info.bust - a.info.bust);
  const hidden = all.length - rows.length;

  return (
    <section className="border-b border-[var(--rule)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <Reveal>
          <SectionHeader
            title="Subdivisions ranked by bust probability"
            lede="Each row is one IMD subdivision for the selected lead day. Select a row to inspect its full telemetry."
            right={<DaySelector day={day} onChange={onDayChange} />}
          />
        </Reveal>

        <ScrubRule className="mt-8" />

        <motion.div
          variants={listParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          <div className="hidden md:grid grid-cols-[2.5rem_7rem_1fr_7rem_4.5rem_9rem] items-center gap-4 py-2.5 border-b border-[var(--rule)]">
            <span className="label text-[var(--muted-dim)]">No.</span>
            <span className="label text-[var(--muted-dim)]">Zone</span>
            <span className="label text-[var(--muted-dim)]">Subdivision</span>
            <span className="label text-[var(--muted-dim)]">Bust risk</span>
            <span className="label text-right text-[var(--muted-dim)]">Bust</span>
            <span className="label text-right text-[var(--muted-dim)]">Raw → corrected</span>
          </div>

          <AnimatePresence initial={false}>
            {rows.map(({ zone, info }, i) => {
              const tone = confidenceTone(info.bust);
              const active = zone.id === selectedId;
              return (
                <motion.button
                  key={zone.id}
                  layout="position"
                  variants={rowItem}
                  exit={{ opacity: 0 }}
                  type="button"
                  onClick={() => {
                    onSelect(zone.id);
                    onOpenDashboard();
                  }}
                  className={`group relative w-full text-left grid grid-cols-[2rem_1fr] md:grid-cols-[2.5rem_7rem_1fr_7rem_4.5rem_9rem] items-center gap-x-4 gap-y-1 border-b border-[var(--rule-soft)] py-3 transition-colors cursor-pointer ${
                    active ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {/* Selection edge, drawn on hover or when the row is the active zone. */}
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0 top-0 h-full w-[2px] origin-top bg-[var(--accent)] transition-transform duration-300 ${
                      active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                    }`}
                  />
                  <span className="font-mono-code text-[11px] text-[var(--muted-dim)] tnum">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono-code text-[11px] font-medium text-[var(--accent)]">
                    {zone.id}
                  </span>
                  <span className="col-span-2 md:col-span-1 text-[14px] text-[var(--ink)] group-hover:text-[var(--accent-ink)] transition-colors">
                    {zone.name}
                  </span>
                  <span className="col-span-2 md:col-span-1 mt-1 md:mt-0">
                    <ProgressBar value={info.bust} color={TONE_COLOR[tone]} />
                  </span>
                  <span
                    className="justify-self-start md:justify-self-end font-mono-code text-[13px] font-medium tnum"
                    style={{ color: TONE_COLOR[tone] }}
                  >
                    {info.bust}%
                  </span>
                  <span className="justify-self-end font-mono-code text-[11px] text-[var(--muted)] tnum">
                    {info.raw}
                    <span className="text-[var(--muted-dim)]"> → </span>
                    <span className="text-[var(--ink)]">{info.corr}</span> mm
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono-code text-[10px] text-[var(--muted-dim)]">
            {hidden > 0
              ? `${hidden} subdivision${hidden > 1 ? "s" : ""} omitted — no usable input for day ${day}.`
              : `All ${ZONES.length} subdivisions reporting for day ${day}.`}
          </p>
          <p className="font-mono-code text-[10px] text-[var(--muted-dim)]">
            {confidenceLabel(rows[0]?.info.bust ?? 0)} at the top of this ranking
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Capabilities — two wide editorial blocks
 * ------------------------------------------------------------------ */
function Capabilities() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--rule)]">
      <Backdrop src="/img/bg-satellite.jpg" opacity={1} position="50% 40%" wash="none" drift />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,246,242,.93)_0%,rgba(247,246,242,.72)_26%,rgba(247,246,242,.72)_74%,rgba(247,246,242,.95)_100%)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <Reveal>
          <SectionHeader
            title="Two ways to work the same data"
            lede="A spatial view for situational awareness and a dense console for keyboard-driven analysis. Both read from one synthetic dataset."
            className="mb-10"
          />
        </Reveal>

        <div className="space-y-12">
          <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <ParallaxBox className="lg:col-span-6" distance={16}>
              <figure className="border border-[var(--rule)] bg-[var(--surface)]">
                <Image
                  src="/img/feature-subdivisions.svg"
                  alt="Map of India with the fifteen monitored subdivisions marked and sized by watch area."
                  width={720}
                  height={460}
                  className="block h-auto w-full"
                />
              </figure>
            </ParallaxBox>
            <div className="lg:col-span-6">
              <Reveal delay={0.1}>
                <Eyebrow>Spatial view</Eyebrow>
                <h3 className="font-display mt-4 text-[1.6rem] leading-tight text-[var(--ink)]">
                  See the watch areas, then the ranking
                </h3>
                <p className="mt-3 text-[15px] leading-[1.72] text-[var(--ink-2)]">
                  Switch the map between raw rainfall, bias-corrected values and bust
                  probability. A sortable table gives the same information without relying on
                  colour or pointer input.
                </p>
              </Reveal>
              <motion.ul
                className="mt-5 space-y-2.5"
                variants={staggerParent}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.5 }}
              >
                {[
                  "Legend states which metric the colour encodes",
                  "Regions with no usable input are marked, not hidden",
                  "Full keyboard path through zones, days and metrics",
                ].map((item) => (
                  <motion.li
                    key={item}
                    variants={fadeItem}
                    className="flex gap-3 text-[13px] text-[var(--muted)]"
                  >
                    <span
                      className="mt-[7px] h-1 w-1 shrink-0 bg-[var(--accent)]"
                      aria-hidden="true"
                    />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </article>

          <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <ParallaxBox className="lg:col-span-6 lg:order-2" distance={16}>
              <figure className="border border-[var(--rule)] bg-[var(--surface)]">
                <Image
                  src="/img/feature-dualmode.svg"
                  alt="The modern web console beside a retro Windows-style telemetry console, both showing the same forecast series."
                  width={720}
                  height={460}
                  className="block h-auto w-full"
                />
              </figure>
            </ParallaxBox>
            <div className="lg:col-span-6 lg:order-1">
              <Reveal delay={0.1}>
                <Eyebrow>Dual interface</Eyebrow>
                <h3 className="font-display mt-4 text-[1.6rem] leading-tight text-[var(--ink)]">
                  A web dashboard, and a console for the ops room
                </h3>
                <p className="mt-3 text-[15px] leading-[1.72] text-[var(--ink-2)]">
                  The Win32 mode is a deliberately dense, high-contrast skin over the same
                  dataset — built for a wall display or a low-spec machine, and readable at a
                  distance.
                </p>
              </Reveal>
              <Stagger className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 max-w-sm" amount={0.5}>
                {[
                  { count: 15, label: "selectable zones" },
                  { text: "D1–D10", label: "scrubber steps" },
                  { count: 3, label: "metric modes" },
                  { count: 1, label: "shared dataset" },
                ].map((s) => (
                  <motion.div key={s.label} variants={fadeItem}>
                    <div className="font-display text-[1.35rem] leading-none text-[var(--ink)] tnum">
                      {s.count === undefined ? s.text : <CountUp value={s.count} />}
                    </div>
                    <div className="mt-1 font-mono-code text-[10px] uppercase tracking-[0.08em] text-[var(--muted-dim)]">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Selected-region detail
 * ------------------------------------------------------------------ */
function RegionDetail({
  selectedId,
  day,
  onOpenDashboard,
}: {
  selectedId: string;
  day: number;
  onOpenDashboard: () => void;
}) {
  const zone = ZONES.find((z) => z.id === selectedId) ?? ZONES[0];
  const info = getZoneTimeline(zone, REGIMES)[day - 1];
  const tone = confidenceTone(info.bust);
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-[var(--rule)] bg-[var(--paper-2)]">
      <Backdrop src="/img/bg-isobars.svg" opacity={0.6} position="50% 40%" wash="none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(239,236,228,.92)_0%,rgba(239,236,228,.6)_35%,rgba(239,236,228,.75)_100%)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Reveal className="lg:col-span-7">
            <Panel className="p-6 sm:p-8">
              <Eyebrow>Selected subdivision</Eyebrow>
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-mono-code text-[11px] text-[var(--accent)]">{zone.id}</div>
                    <h3 className="font-display mt-1 text-[1.6rem] sm:text-[1.8rem] leading-tight text-[var(--ink)]">
                      {zone.name}
                    </h3>
                  </div>
                  <Chip tone={tone}>{confidenceLabel(info.bust)}</Chip>
                </div>

                <dl className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-5">
                  {[
                    ["Raw model", info.raw, "", "var(--ink)"],
                    ["Bias-corrected", info.corr, "", "var(--accent)"],
                    [
                      "Bias delta",
                      info.corr - info.raw,
                      info.corr - info.raw > 0 ? "+" : "",
                      "var(--ink)",
                    ],
                    ["Bust probability", info.bust, "", TONE_COLOR[tone]],
                  ].map(([label, value, prefix, color]) => (
                    <div key={label as string}>
                      <dt className="label text-[var(--muted-dim)]">{label as string}</dt>
                      <dd
                        className="mt-1 font-display text-[1.25rem] leading-none tnum"
                        style={{ color: color as string }}
                      >
                        <AnimatedNumber
                          value={value as number}
                          prefix={prefix as string}
                          suffix={label === "Bust probability" ? "%" : " mm"}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>

              <div className="mt-7 pt-5 border-t border-[var(--rule-soft)]">
                <div className="label text-[var(--muted-dim)]">Diagnostic note</div>
                <p className="mt-2 text-[14px] leading-[1.7] text-[var(--ink-2)]">{zone.reason}</p>
                <Caveat className="mt-3">
                  Authored copy for the prototype. Not a computed attribution — no feature
                  pipeline or attribution model is connected in this build.
                </Caveat>
              </div>

              <motion.button
                type="button"
                onClick={onOpenDashboard}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="mt-7 accent-bg px-5 py-2.5 text-[13px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
              >
                Open full diagnostics
              </motion.button>
            </Panel>
          </Reveal>

          <Reveal className="lg:col-span-5 flex" delay={0.08}>
            <Panel className="flex flex-col w-full">
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--rule-soft)]">
                <span className="font-mono-code text-[10px] uppercase tracking-[0.11em] text-[var(--ink)]">
                  Heavy-rain exceedance
                </span>
                <span className="font-mono-code text-[10px] text-[var(--muted-dim)]">
                  D{day} · {info.regime}
                </span>
              </div>

              <div className="p-5 flex-1">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["> 64.5 mm", info.ex64, "Heavy"],
                    ["> 115.5 mm", info.ex115, "Very heavy"],
                    ["> 204.5 mm", info.ex204, "Extreme"],
                  ].map(([label, value, caption]) => (
                    <div
                      key={label as string}
                      className="border border-[var(--rule-soft)] bg-[var(--surface-2)] p-3 text-center"
                    >
                      <div className="font-mono-code text-[10px] text-[var(--muted)]">
                        {label as string}
                      </div>
                      <div className="mt-1 font-display text-[1.35rem] leading-none text-[var(--ink)] tnum">
                        <AnimatedNumber value={value as number} suffix="%" />
                      </div>
                      <div className="mt-2 h-[3px] w-full bg-[var(--rule-soft)]">
                        <motion.div
                          className="h-full bg-[var(--accent)]"
                          initial={reduce ? false : { width: 0 }}
                          animate={{ width: `${value as number}%` }}
                          transition={{ duration: 0.6, ease: EASE }}
                        />
                      </div>
                      <div className="mt-1 font-mono-code text-[9px] uppercase tracking-[0.06em] text-[var(--muted-dim)]">
                        {caption as string}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-[13px] leading-relaxed text-[var(--muted)]">
                  Exceedance estimates describe the chance of crossing an IMD heavy-rain
                  threshold. They are derived from the synthetic corrected series and are not a
                  calibrated impact forecast.
                </p>
              </div>

              <div className="px-5 py-3 border-t border-[var(--rule-soft)]">
                <Caveat>Day 6–10 has no verifying observation, so bust risk is unverified there.</Caveat>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Team
 * ------------------------------------------------------------------ */
function TeamSection() {
  const reduce = useReducedMotion();

  return (
    <section className="border-b border-[var(--rule)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <Reveal>
          <SectionHeader
            title="The team"
            lede="Built by three people over the course of the hackathon."
            className="mb-8"
          />
        </Reveal>
        <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-6" amount={0.4}>
          {TEAM.map((m) => (
            <motion.div
              key={m.name}
              variants={fadeItem}
              whileHover={reduce ? undefined : { x: 3 }}
              className="flex items-center gap-4 border-t border-[var(--rule)] pt-5"
            >
              <Image
                src={m.avatar}
                alt=""
                width={240}
                height={240}
                className="w-14 h-14 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[15px] text-[var(--ink)] truncate">{m.name}</div>
                <div className="mt-0.5 font-mono-code text-[10px] uppercase tracking-[0.07em] text-[var(--muted)]">
                  {m.role}
                </div>
              </div>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */
export default function Poster(props: Props) {
  return (
    <main>
      <Hero
        onOpenDashboard={props.onOpenDashboard}
        onOpenWin32={props.onOpenWin32}
      />
      <Method />
      <ReadingKey />
      <SubdivisionSection
        day={props.day}
        onDayChange={props.onDayChange}
        selectedId={props.selectedId}
        onSelect={props.onSelect}
        onOpenDashboard={props.onOpenDashboard}
      />
      <Capabilities />
      <RegionDetail
        selectedId={props.selectedId}
        day={props.day}
        onOpenDashboard={props.onOpenDashboard}
      />
      <TeamSection />
    </main>
  );
}

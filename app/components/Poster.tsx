"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { REGIMES, ZONES } from "@/app/data/zones";
import { confidenceLabel, confidenceTone, getZoneTimeline, TONE_COLOR } from "@/app/lib/timeline";
import { CountUp, ScrubRule } from "./Atmosphere";
import { EASE, fadeItem, ParallaxBox, Reveal, rowItem, SplitWords, Stagger, staggerParent, AnimatedNumber } from "./motion";
import {
  Backdrop,
  Caveat,
  Chip,
  DaySelector,
  Eyebrow,
  Panel,
  ProgressBar,
  SectionHeader,
} from "./ui";

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
 * Pixel glyphs — 24px weather icons, drawn with hard rectangles.
 * ------------------------------------------------------------------ */
function PixelIcon({ kind }: { kind: "radar" | "cloud" | "rain" | "alert" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
      {kind === "radar" ? (
        <>
          <rect x="2" y="19" width="20" height="2" />
          <rect x="5" y="15" width="14" height="2" />
          <rect x="8" y="11" width="8" height="2" />
          <rect x="11" y="6" width="2" height="5" />
          <rect x="15" y="7" width="2" height="2" />
          <rect x="17" y="9" width="2" height="2" />
        </>
      ) : null}
      {kind === "cloud" ? (
        <>
          <rect x="4" y="12" width="16" height="6" />
          <rect x="7" y="9" width="9" height="3" />
          <rect x="10" y="6" width="4" height="3" />
        </>
      ) : null}
      {kind === "rain" ? (
        <>
          <rect x="4" y="8" width="14" height="5" />
          <rect x="7" y="5" width="7" height="3" />
          <rect x="6" y="16" width="2" height="5" />
          <rect x="11" y="16" width="2" height="5" />
          <rect x="16" y="16" width="2" height="5" />
        </>
      ) : null}
      {kind === "alert" ? (
        <>
          <rect x="10" y="4" width="4" height="10" />
          <rect x="10" y="17" width="4" height="4" />
          <rect x="4" y="2" width="2" height="2" />
          <rect x="18" y="2" width="2" height="2" />
          <rect x="4" y="21" width="2" height="1" />
          <rect x="18" y="21" width="2" height="1" />
        </>
      ) : null}
    </svg>
  );
}

const SIGNALS: { kind: "radar" | "cloud" | "rain" | "alert"; label: string; value: string }[] = [
  { kind: "radar", label: "Scan", value: "09s" },
  { kind: "cloud", label: "Regime", value: "10" },
  { kind: "rain", label: "Bands", value: "03" },
  { kind: "alert", label: "Bust", value: "15" },
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
    <section className="relative overflow-hidden border-b-2 border-[var(--ink)] bg-[var(--paper)]">
      {/* Same monsoon photograph as the original build, re-rendered as a
          coarse pixel plate and slow-stepped across the hero. */}
      <Backdrop
        src="/img/animated_pixelated_mountain.gif"
        opacity={0.9}
        position="50% 50%"
        wash="none"
        priority
        pixelated
        pixelAnim
      />
      <div
        className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(243,234,215,.9)_0%,rgba(243,234,215,.75)_40%,rgba(243,234,215,.45)_70%,rgba(243,234,215,.25)_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 z-[1] h-40 bg-[linear-gradient(to_top,rgba(243,234,215,.85),rgba(243,234,215,0))]"
        aria-hidden="true"
      />
      {/* Graph paper, a hard accent bar and a slow radar target in the corner. */}
      <div className="absolute inset-0 pixel-grid-bg opacity-70" aria-hidden="true" />
      <div
        className="absolute -right-32 -top-40 h-[460px] w-[460px] radar-rings opacity-70"
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 h-2 w-44 bg-[var(--accent)]" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 h-2 w-28 bg-[var(--accent-2)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-[1240px] px-5 sm:px-8 pt-12 pb-12 md:pt-16 md:pb-16">
        <motion.div {...enter(0)} />

        <h1 className="font-display mt-4 text-[2.6rem] sm:text-[3.6rem] lg:text-[4.6rem] xl:text-[5.6rem] leading-[0.95] tracking-[-0.02em] text-[var(--ink)]">
          <SplitWords text="Know where the forecast is" delay={0.1} />
          <br />
          <span className="mt-1 inline-block text-[var(--accent)]">
            <SplitWords text="likely to fail" delay={0.22} />
          </span>
        </h1>

        <motion.p
          {...enter(0.46)}
          className="mt-6 max-w-[33rem] text-[13px] leading-[1.8] text-[var(--ink-2)]"
        >
          ForecastGuard estimates the probability that a medium-range rainfall forecast
          will be substantially wrong — by subdivision, by lead day, and by synoptic
          regime — so limited review effort goes where it matters most.
        </motion.p>

        <motion.div
          {...enter(0.55)}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <button
            type="button"
            onClick={onOpenDashboard}
            className="pixel-btn pixel-btn--primary"
          >
            Open dashboard
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" onClick={onOpenWin32} className="pixel-btn">
            Ops console
            <span aria-hidden="true">▚</span>
          </button>
        </motion.div>
      </div>

      {/* Key figures */}
      <div className="relative z-10 border-t-2 border-[var(--ink)] bg-[var(--surface-2)]">
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
                <dt className="font-pixel text-[9px] uppercase tracking-[0.03em] text-[var(--muted)]">
                  {f.label}
                </dt>
                <dd className="mt-2 font-display text-[2rem] leading-none text-[var(--ink)] tnum">
                  {f.count === undefined ? f.text : <CountUp value={f.count} />}
                </dd>
                <dd className="mt-1.5 text-[11px] text-[var(--muted)]">{f.hint}</dd>
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
    <section id="method" className="relative overflow-hidden border-b-2 border-[var(--ink)]">
      <Backdrop src="/img/bg-topo.svg" opacity={1} position="50% 50%" wash="none" drift />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(243,234,215,.92)_0%,rgba(243,234,215,.55)_22%,rgba(243,234,215,.4)_58%,rgba(243,234,215,.9)_100%)]" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Eyebrow>Why this exists</Eyebrow>
            <ScrubRule className="mt-5 w-24" tone="accent" />
            <h2 className="font-display mt-5 text-[1.8rem] sm:text-[2.15rem] leading-[1.02] text-[var(--ink)]">
              Forecast skill is not uniform. Neither should confidence be.
            </h2>
            <div className="mt-5 space-y-4 text-[13px] leading-[1.8] text-[var(--ink-2)]">
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
                className="absolute left-0 top-0 h-full w-[3px] origin-top bg-[var(--accent)]"
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, ease: EASE }}
              />
              <p className="font-display text-[18px] leading-snug text-[var(--ink)]">
                “Treat a high bust probability as a prompt to look closer — not as a
                prediction of impact.”
              </p>
            </div>
          </motion.div>

          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <Panel className="p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3 border-b-2 border-[var(--ink)] pb-4">
                  <div>
                    <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-[var(--muted)]">
                      Field note
                    </div>
                    <div className="mt-1 font-display text-[1.25rem] leading-tight text-[var(--ink)]">
                      Uneven skill, uneven risk
                    </div>
                  </div>
                  <Chip tone="warn">Bust risk</Chip>
                </div>
                <div className="mt-5 space-y-3 text-[13px] leading-[1.8] text-[var(--ink-2)]">
                  <p>
                    Along the coast and hills, small errors in timing or location can shift
                    heavy rain bands enough to miss or overstate totals.
                  </p>
                  <p>
                    Inland, some regimes are more stable. The gap between those cases is where
                    review time is best spent.
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Coastal", value: "High" },
                    { label: "Hills", value: "High" },
                    { label: "Interior", value: "Lower" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border border-[var(--ink)] bg-[var(--surface-2)] px-3 py-2 text-center"
                    >
                      <div className="font-pixel text-[8px] uppercase text-[var(--muted)]">
                        {item.label}
                      </div>
                      <div className="mt-1 font-display text-[1.1rem] text-[var(--ink)]">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>

            <ScrubRule className="mt-8" />
            <Reveal delay={0.08}>
              <figure className="pixel-window">
                <Image
                  src="/img/feature-horizon.svg"
                  alt="Pixel bar chart showing bust probability rising through the ten-day horizon, peaking around day four above the review threshold."
                  width={720}
                  height={460}
                  className="block h-auto w-full"
                />
                <figcaption className="border-t-2 border-[var(--ink)] bg-[var(--surface-2)] px-4 py-2.5 font-mono-code text-[10px] text-[var(--muted)]">
                  FIG. 2 — Illustrative bust probability by lead day. Values synthetic.
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
                    <span className="font-pixel text-[10px] text-[var(--accent)]">
                      {s.n.padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-[17px] leading-tight text-[var(--ink)]">
                      {s.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-[12px] leading-[1.75] text-[var(--muted)]">{s.body}</p>
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
    <section className="relative overflow-hidden border-b-2 border-[var(--ink)]">
      <Backdrop src="/img/bg-band-pix.jpg" opacity={0.85} position="50% 55%" wash="none" priority pixelated pixelAnim />
      <div className="absolute inset-0 bg-[linear-gradient(94deg,rgba(243,234,215,.88)_0%,rgba(243,234,215,.7)_40%,rgba(243,234,215,.4)_70%,rgba(243,234,215,.25)_100%)]" />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Eyebrow>Reading key</Eyebrow>
            <h2 className="font-display mt-5 text-[1.8rem] leading-[1.02] text-[var(--ink)]">
              Four bands, one review decision behind each.
            </h2>
            <p className="mt-4 text-[13px] leading-[1.8] text-[var(--ink-2)]">
              Bust probability is shown as a band rather than a decimal because the
              underlying calibration does not support finer resolution.
            </p>
          </motion.div>

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
                  whileHover={reduce ? undefined : { y: -3, transition: { duration: 0.2 } }}
                  className="border-t-2 border-[var(--ink)] py-4"
                >
                  <dt>
                    <motion.span
                      className="block h-[10px] w-full origin-left border border-[var(--ink)]"
                      style={{ background: TONE_COLOR[band.tone] }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.75, delay: 0.08 + i * 0.07, ease: EASE }}
                      aria-hidden="true"
                    />
                    <span className="mt-3 flex items-baseline justify-between gap-3">
                      <span className="font-display text-[17px] leading-tight text-[var(--ink)]">
                        {band.label}
                      </span>
                      <span className="font-mono-code text-[11px] tnum text-[var(--muted)]">
                        {band.range}
                      </span>
                    </span>
                  </dt>
                  <dd className="mt-1 font-pixel text-[9px] uppercase tracking-[0.02em] text-[var(--muted-dim)]">
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
    <section className="border-b-2 border-[var(--ink)] bg-[var(--surface)]">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionHeader
            title="Subdivisions ranked by bust probability"
            lede="Each row is one IMD subdivision for the selected lead day. Select a row to inspect its full telemetry."
            right={<DaySelector day={day} onChange={onDayChange} />}
          />
        </motion.div>

        <ScrubRule className="mt-8" />

        <motion.div
          variants={listParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
        >
          <div className="hidden md:grid grid-cols-[2.5rem_7rem_1fr_7rem_4.5rem_9rem] items-center gap-4 py-2.5 border-b-2 border-[var(--ink)]">
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
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
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
                    className={`pointer-events-none absolute left-0 top-0 h-full w-[3px] origin-top bg-[var(--accent-2)] transition-transform duration-300 ${
                      active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                    }`}
                  />
                  <span className="font-pixel text-[10px] text-[var(--muted-dim)] tnum">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono-code text-[11px] font-medium text-[var(--accent)]">
                    {zone.id}
                  </span>
                  <span className="col-span-2 md:col-span-1 text-[13px] text-[var(--ink)] group-hover:text-[var(--accent-ink)] transition-colors">
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
    <section className="relative overflow-hidden border-b-2 border-[var(--ink)]">
      <Backdrop src="/img/pixel-cyclone-bay-of-bengal.png" opacity={0.9} position="50% 40%" wash="none" pixelated pixelAnim />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(243,234,215,.88)_0%,rgba(243,234,215,.7)_30%,rgba(243,234,215,.7)_70%,rgba(243,234,215,.9)_100%)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <SectionHeader
            title="Two ways to work the same data"
            lede="A spatial view for situational awareness and a dense console for keyboard-driven analysis. Both read from one synthetic dataset."
            className="mb-10"
          />
        </motion.div>

        <div className="space-y-12">
          <motion.article
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <ParallaxBox className="lg:col-span-6" distance={16}>
              <figure className="pixel-window">
                <Image
                  src="/img/feature-subdivisions.svg"
                  alt="Pixel map of India with the fifteen monitored subdivisions marked as colour blocks."
                  width={720}
                  height={460}
                  className="block h-auto w-full"
                />
              </figure>
            </ParallaxBox>
            <div className="lg:col-span-6">
              <Reveal delay={0.1}>
                <Eyebrow>Spatial view</Eyebrow>
                <h3 className="font-display mt-4 text-[1.6rem] leading-[1.05] text-[var(--ink)]">
                  See the watch areas, then the ranking
                </h3>
                <p className="mt-3 text-[13px] leading-[1.8] text-[var(--ink-2)]">
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
                    className="flex gap-3 text-[12px] text-[var(--muted)]"
                  >
                    <span
                      className="mt-[6px] h-2 w-2 shrink-0 bg-[var(--accent)]"
                      aria-hidden="true"
                    />
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.article>

          <motion.article
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          >
            <ParallaxBox className="lg:col-span-6 lg:order-2" distance={16}>
              <figure className="pixel-window">
                <Image
                  src="/img/feature-dualmode.svg"
                  alt="The light pixel field terminal beside a dark CRT ops console, both showing the same forecast series."
                  width={720}
                  height={460}
                  className="block h-auto w-full"
                />
              </figure>
            </ParallaxBox>
            <div className="lg:col-span-6 lg:order-1">
              <Reveal delay={0.1}>
                <Eyebrow>Dual interface</Eyebrow>
                <h3 className="font-display mt-4 text-[1.6rem] leading-[1.05] text-[var(--ink)]">
                  A field terminal, and a console for the ops room
                </h3>
                <p className="mt-3 text-[13px] leading-[1.8] text-[var(--ink-2)]">
                  The ops console is a deliberately dense, phosphor-on-black skin over the same
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
                    <div className="font-display text-[1.45rem] leading-none text-[var(--ink)] tnum">
                      {s.count === undefined ? s.text : <CountUp value={s.count} />}
                    </div>
                    <div className="mt-1 font-pixel text-[8px] uppercase tracking-[0.02em] text-[var(--muted-dim)]">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </motion.article>
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

  return (
    <section className="relative overflow-hidden border-b-2 border-[var(--ink)] bg-[var(--paper-2)]">
      <Backdrop src="/img/bg-isobars.svg" opacity={0.6} position="50% 40%" wash="none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(233,223,201,.94)_0%,rgba(233,223,201,.66)_35%,rgba(233,223,201,.82)_100%)]" />
      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
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
                    <div className="font-pixel text-[9px] uppercase text-[var(--accent)]">
                      {zone.id}
                    </div>
                    <h3 className="font-display mt-1 text-[1.55rem] sm:text-[1.75rem] leading-[1.05] text-[var(--ink)]">
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
                        className="mt-1 font-display text-[1.35rem] leading-none tnum"
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

              <div className="mt-7 pt-5 border-t-2 border-[var(--ink)]">
                <div className="label text-[var(--muted-dim)]">Diagnostic note</div>
                <p className="mt-2 text-[13px] leading-[1.8] text-[var(--ink-2)]">{zone.reason}</p>
                <Caveat className="mt-3">
                  Authored copy for the prototype. Not a computed attribution — no feature
                  pipeline or attribution model is connected in this build.
                </Caveat>
              </div>

              <button
                type="button"
                onClick={onOpenDashboard}
                className="pixel-btn pixel-btn--primary mt-7"
              >
                Open full diagnostics
                <span aria-hidden="true">→</span>
              </button>
            </Panel>
          </motion.div>

          <motion.div
            className="lg:col-span-5 flex"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <Panel className="flex flex-col w-full">
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-2 border-[var(--ink)] bg-[var(--surface-2)]">
                <span className="font-pixel text-[10px] uppercase tracking-[0.02em] text-[var(--ink)]">
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
                      className="border border-[var(--ink)] bg-[var(--surface-2)] p-3 text-center shadow-[2px_2px_0_rgba(23,32,29,.12)]"
                    >
                      <div className="font-mono-code text-[10px] text-[var(--muted)]">
                        {label as string}
                      </div>
                      <div className="mt-1 font-display text-[1.45rem] leading-none text-[var(--ink)] tnum">
                        <AnimatedNumber value={value as number} suffix="%" />
                      </div>
                      <ProgressBar value={value as number} color="var(--accent)" className="mt-2" />
                      <div className="mt-1.5 font-pixel text-[7px] uppercase tracking-[0.02em] text-[var(--muted-dim)]">
                        {caption as string}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-[12px] leading-[1.8] text-[var(--muted)]">
                  Exceedance estimates describe the chance of crossing an IMD heavy-rain
                  threshold. They are derived from the synthetic corrected series and are not a
                  calibrated impact forecast.
                </p>
              </div>

              <div className="px-5 py-3 border-t border-[var(--rule-soft)]">
                <Caveat>Day 6–10 has no verifying observation, so bust risk is unverified there.</Caveat>
              </div>
            </Panel>
          </motion.div>
        </div>
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
    </main>
  );
}

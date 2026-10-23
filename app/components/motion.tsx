"use client";

import { animate, motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
 * Shared motion language.
 *
 * Discrete, enter-once transitions are Framer Motion's job: declarative,
 * SSR-safe, and cheap to reason about. Continuous and scroll-driven movement —
 * drifting cloud banks, backdrop parallax, scrubbed rules — lives in
 * Atmosphere.tsx and runs on GSAP, because those are infinite or scrubbed
 * timelines rather than state transitions.
 *
 * MotionConfig in app/page.tsx sets reducedMotion="user"; the components below
 * also check useReducedMotion so they can skip transforms entirely (and, for
 * the list staggers, skip the wrapper markup).
 */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Parent that reveals its children in sequence. */
export const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.065, delayChildren: 0.03 },
  },
};

/* One block in that sequence. */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

/* A quieter item for long lists, where a large offset would feel jumpy. */
export const fadeItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

/*
 * Opacity-only item for rows that also use layout projection. A y offset and
 * a layout transform fight over the same matrix, which makes reordered rows
 * shiver.
 */
export const rowItem: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

/*
 * Wraps a block that drifts slightly against the scroll direction. Used on
 * the capability figures so the two columns separate in depth.
 */
export function ParallaxBox({
  children,
  className = "",
  distance = 16,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

export function Stagger({
  children,
  className = "",
  amount = 0.2,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}

/* A single block that fades up when it enters the viewport. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 14,
  once = true,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Horizontal slide, used to alternate the two capability rows. */
export function Slide({
  children,
  className = "",
  from = "left",
}: {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: from === "left" ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.85, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/*
 * Splits a headline into words so they rise in sequence.
 *
 * Each word is animated on its own with an explicit delay rather than through
 * variant propagation: the headline contains an <em> and a full stop, and a
 * variant chain would have to be threaded through those. Words are plain
 * inline-blocks with no overflow mask, because a mask clips the descenders of
 * a serif display face.
 */
export function SplitWords({
  text,
  delay = 0,
  step = 0.055,
}: {
  text: string;
  delay?: number;
  step?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="inline-block">
            <motion.span
              className="inline-block"
              initial={reduce ? false : { opacity: 0, y: "0.4em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: delay + i * step, ease: EASE }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

/*
 * A figure that rolls from its previous value to the new one.
 *
 * Used wherever the same number changes in place — switching lead day or
 * subdivision — so the reader can see which way it moved instead of the digit
 * simply being replaced.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (reduce || from === value) {
      setDisplay(value);
      return;
    }

    const controls = animate(from, value, {
      duration: 0.55,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });

    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

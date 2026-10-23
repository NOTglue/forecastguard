"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Continuous motion.
 *
 * These are not state transitions — they are timelines that run for as long as
 * the component is on screen (cloud drift) or that are scrubbed by scroll
 * (backdrop parallax). Framer Motion is a poor fit for both, GSAP is a good one.
 *
 * Every tween is skipped when the user prefers reduced motion; the layers are
 * still rendered, just static, so the design does not change shape.
 */

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/*
 * Cloud banks drifting across a section's photograph.
 *
 * Rendered as overlapping radial gradients rather than a blurred image: the
 * gradients are soft by construction, so the only per-frame work is a GPU
 * transform. One bank is lightened (screen), one shadowed (multiply), which
 * gives the pair a sense of volume instead of a flat haze.
 */
export function CloudField({
  className = "",
  opacity = 1,
}: {
  className?: string;
  opacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const banks = gsap.utils.toArray<HTMLElement>("[data-cloud]", el);
      banks.forEach((bank, i) => {
        const drift = i % 2 === 0 ? 4.5 : -6;
        gsap.to(bank, {
          xPercent: drift,
          yPercent: i % 2 === 0 ? -2.5 : 3,
          duration: 38 + i * 11,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`cloud-field ${className}`}
      style={{ opacity }}
    >
      <span data-cloud className="cloud-bank cloud-bank--lit" />
      <span data-cloud className="cloud-bank cloud-bank--shade" />
      <span data-cloud className="cloud-veil" />
    </div>
  );
}

/*
 * Counts a figure up the first time it comes into view.
 *
 * The server renders the final value, so a no-JS reader (and anyone with
 * reduced motion) sees the real number. The tween only rewrites textContent,
 * which keeps it off React's render path.
 */
export function CountUp({
  value,
  suffix = "",
  duration = 0.9,
  className = "",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = `${value}${suffix}`;
      return;
    }

    /* Zero before the trigger so the number never flashes its final value. */
    el.textContent = `0${suffix}`;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      gsap.to(counter, {
        v: value,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(counter.v)}${suffix}`;
        },
        onComplete: () => {
          el.textContent = `${value}${suffix}`;
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}

/*
 * Scroll-scrubbed parallax for a photographic backdrop.
 *
 * The image is scaled slightly so the translate never exposes an edge. Returns
 * a ref to attach to the <img> element; the trigger is its nearest section.
 */
export function useBackdropParallax(active: boolean) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !active || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        { yPercent: -2.4, scale: 1.09 },
        {
          yPercent: 2.4,
          scale: 1.09,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest("section") ?? img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    }, img);

    /* Images were lazy-decoded before; recompute once geometry settles. */
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh, { once: true });

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [active]);

  return imgRef;
}

/*
 * Draws a section rule across as it is scrolled into view, using ScrollTrigger
 * rather than a one-shot class so the rule tracks the scroll position.
 */
export function ScrubRule({
  className = "",
  tone = "rule",
}: {
  className?: string;
  tone?: "rule" | "accent";
}) {
  const ref = useScrubRule();
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`block h-px origin-left ${
        tone === "accent" ? "bg-[var(--accent)]" : "bg-[var(--rule)]"
      } ${className}`}
    />
  );
}

export function useScrubRule(active = true) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top 88%",
            end: "top 55%",
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [active]);

  return ref;
}

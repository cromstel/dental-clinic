"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { hero } from "@/content/site";
import { SplitText } from "@/components/motion/SplitText";
import { Cta } from "@/components/ui/Cta";
import { ToothVisual } from "@/components/ui/ToothVisual";
import { SmileGraphic } from "@/components/ui/SmileGraphic";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * CITGROUP Dental Studio — Luxury Editorial Hero.
 * Aesthetic: midnight navy & gold, editorial typography, asymmetric overlap,
 * refined staggered motion entry, luxury colour block.
 *
 * Single JSX tree: the reduced-motion path is produced by dropping the entrance
 * animations and the scroll parallax, not by swapping in a second markup tree.
 * That keeps the two renders structurally and visually identical (and keeps the
 * copy from drifting between them).
 *
 * All colour comes from the --color-midnight / --color-gold / --color-ivory
 * tokens in `globals.css`, including the two radial gradients.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const visualY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const fade = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // `initial={false}` tells Motion to render the animate state immediately, so
  // reduced-motion visitors get the finished composition with no fade-in.
  const enter = (
    from: { opacity?: number; y?: number; scaleY?: number },
    delay: number,
    duration = 0.9,
  ) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16, scaleY: 1, ...from },
          animate: { opacity: 1, y: 0, scaleY: 1 },
          transition: { delay, duration, ease: EASE },
        };

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center overflow-hidden bg-midnight text-ivory"
    >
      {/* Luxury radial gradient backdrop — midnight depth with a warm gold glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-[10%] top-[20%] h-[28rem] w-[28rem] rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, var(--color-gold) 0%, transparent 70%)" }}
        />
        <div
          className="absolute right-[5%] bottom-[10%] h-[22rem] w-[22rem] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, var(--color-midnight-deep) 0%, transparent 60%)",
          }}
        />
        {/* Film grain — tiled 160px texture, composited once */}
        <div className="grain-overlay absolute inset-0 opacity-[0.05] mix-blend-overlay" />
      </div>

      {/* Gold decorative vertical line — draws in on load */}
      <motion.div
        {...enter({ opacity: 1, scaleY: 0, y: 0 }, 0.3, 1.4)}
        className="absolute left-[max(2rem,calc((100vw-1500px)/2+1rem))] top-28 bottom-28 hidden w-[2px] origin-top bg-gold/60 lg:block"
        aria-hidden
      />

      <motion.div
        {...enter({ y: 0 }, 0.1)}
        style={reduce ? undefined : { opacity: fade }}
        className="container-custom relative z-10 grid grid-cols-1 items-center gap-16 pb-24 pt-32 lg:grid-cols-[1.35fr_0.65fr] lg:gap-8"
      >
        {/* Editorial caption */}
        <motion.p
          {...enter({ y: 12 }, 0.15)}
          className="absolute -top-6 left-0 font-editorial text-xs uppercase tracking-[0.25em] text-gold"
        >
          Manhattan · 142 W 21ST
        </motion.p>

        {/* Main text column — asymmetric, overlapping into the visual */}
        <motion.div style={reduce ? undefined : { y: titleY }} className="relative lg:-mr-16">
          <h1 className="font-display text-[clamp(4.2rem,14vw,12rem)] font-bold leading-[0.82] tracking-[-0.05em]">
            <SplitText
              as="span"
              text={hero.titleLines[0]}
              className="block text-ivory"
              delay={0.35}
              stagger={0.055}
            />
            <span className="mt-[-0.05em] block text-ivory">
              <SplitText as="span" text="worth" delay={0.5} stagger={0.03} />{" "}
              <SplitText
                as="span"
                text={hero.smilingWord}
                className="relative inline-block bg-gold px-3 text-midnight"
                delay={0.7}
                stagger={0.04}
              />
            </span>
            <span className="mt-[-0.05em] block text-ivory">
              <SplitText as="span" text="about." delay={0.9} stagger={0.04} />
            </span>
          </h1>

          {/* Editorial sub-caption in the serif italic (ivory/70 = 8.5:1).
              This is the largest single text box in the hero, so Chrome picks
              it as the LCP candidate — the h1 is disqualified because
              SplitText divides it into per-glyph boxes. Its entrance delay is
              therefore the LCP lever: it used to be 1.45s, which left the
              measured LCP sitting behind the headline stagger. */}
          <motion.p
            {...enter({ y: 20 }, 0.6)}
            className="mt-10 max-w-md font-editorial text-xl italic leading-[1.65] text-ivory/70"
          >
            {hero.supporting}
          </motion.p>

          {/* CTA row */}
          <motion.div
            {...enter({ y: 16 }, 0.85, 0.8)}
            className="mt-12 flex flex-wrap items-center gap-5"
          >
            <Cta href="/contact" variant="gold">
              {hero.primaryCta}
            </Cta>
            <Cta href="/services" variant="outline-gold">
              {hero.secondaryCta}
            </Cta>
            <SmileGraphic
              className="ml-1 hidden h-9 w-14 text-ivory/50 md:block"
              animated={false}
            />
          </motion.div>
        </motion.div>

        {/* Visual column — overlapping into the text, offset downward */}
        <motion.div style={reduce ? undefined : { y: visualY }} className="relative lg:-ml-8 lg:mt-24">
          <div className="relative">
            {/* Decorative gold frame corners. Absolutely positioned against a
                parent that has a fixed intrinsic size (the SVG's viewBox
                aspect ratio), so they never shift layout after paint. */}
            <div
              className="absolute -left-6 -top-6 h-20 w-20 border-l-2 border-t-2 border-gold/50"
              aria-hidden
            />
            <div
              className="absolute -bottom-4 -right-4 h-20 w-20 border-b-2 border-r-2 border-gold/50"
              aria-hidden
            />

            <ToothVisual className="mx-auto w-full max-w-[20rem] lg:max-w-[24rem] drop-shadow-2xl" />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll hint — gold line with a gentle pulse */}
      <motion.div
        {...enter({ y: 0 }, 1.6, 1.2)}
        style={reduce ? undefined : { opacity: fade }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.span
          className="block h-12 w-[1px] bg-gold/60"
          animate={reduce ? undefined : { scaleY: [1, 0.3, 1], y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="sr-only">Scroll</span>
      </motion.div>
    </section>
  );
}

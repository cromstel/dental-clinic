"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { hero } from "@/content/accra";
import { SplitText } from "@/components/motion/SplitText";
import { Cta } from "@/components/ui/Cta";
import { ToothVisual } from "@/components/ui/ToothVisual";
import { SmileGraphic } from "@/components/ui/SmileGraphic";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Accra Dental Atelier — hero.
 * Aesthetic: cocoa-black with a single ochre block, editorial typography,
 * asymmetric overlap, staggered motion entry. The surface is warm and dark
 * rather than the navy-and-gold it replaced, and the grain is the only texture
 * doing atmospheric work — there is no gradient wash behind the headline.
 *
 * Single JSX tree: the reduced-motion path is produced by dropping the entrance
 * animations and the scroll parallax, not by swapping in a second markup tree.
 * That keeps the two renders structurally and visually identical (and keeps the
 * copy from drifting between them).
 *
 * All colour comes from the cocoa / bone / ochre tokens in `globals.css`.
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
      className="relative flex min-h-screen items-center overflow-hidden bg-cocoa text-bone"
    >
      {/*
        Backdrop. Deliberately not two coloured radial gradients, which is the
        stock "premium" move this replaced: they read as a wash behind the
        headline rather than as structure.

        Instead a single low ochre glow sits behind the accent word, and a drawn
        arch — the shape the hero already carries in ToothVisual — is stroked at
        the right edge as a hairline. Both are drawn once and never animated, so
        they cost one paint.
      */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-[38%] top-[38%] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full opacity-[0.18]"
          style={{ background: "radial-gradient(circle, var(--color-ochre) 0%, transparent 68%)" }}
        />
        {/* Arch hairline — echoes the dental arch without repeating the visual */}
        <svg
          className="absolute -right-[6%] bottom-[-8%] h-[68%] w-auto text-ochre opacity-[0.13]"
          viewBox="0 0 220 340"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            d="M110 18c-52 0-88 40-88 92v212a12 12 0 0 0 12 12h152a12 12 0 0 0 12-12V110c0-52-36-92-88-92Z"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M110 56c-36 0-60 28-60 66v186h120V122c0-38-24-66-60-66Z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        {/* Film grain — tiled 160px texture, composited once */}
        <div className="grain-overlay absolute inset-0 opacity-[0.05] mix-blend-overlay" />
      </div>

      {/* Ochre rule — draws in on load, marking the text column */}
      <motion.div
        {...enter({ opacity: 1, scaleY: 0, y: 0 }, 0.3, 1.4)}
        className="absolute left-[max(2rem,calc((100vw-1560px)/2+1rem))] top-28 bottom-28 hidden w-[2px] origin-top bg-ochre/60 lg:block"
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
          className="absolute -top-6 left-0 font-editorial text-xs uppercase tracking-[0.25em] text-ochre"
        >
          {hero.eyebrow}
        </motion.p>

        {/* Main text column — asymmetric, overlapping into the visual */}
        <motion.div style={reduce ? undefined : { y: titleY }} className="relative lg:-mr-16">
          <h1 className="font-display text-[clamp(4.2rem,14vw,12rem)] font-bold leading-[0.82] tracking-[-0.05em]">
            <SplitText
              as="span"
              text={hero.titleLines[0]}
              className="block text-bone"
              delay={0.35}
              stagger={0.055}
            />
            <span className="mt-[-0.05em] block text-bone">
              <SplitText as="span" text={hero.titleLines[1]} delay={0.5} stagger={0.03} />{" "}
              <SplitText
                as="span"
                text={hero.accentWord}
                className="relative inline-block bg-ochre px-3 text-ochre-ink"
                delay={0.7}
                stagger={0.04}
              />
            </span>
            <span className="mt-[-0.05em] block text-bone">
              <SplitText as="span" text={hero.titleLines[2]} delay={0.9} stagger={0.04} />
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
            className="mt-10 max-w-md font-editorial text-xl italic leading-[1.65] text-bone/70"
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
            <Cta href="/services" variant="outline-ochre">
              {hero.secondaryCta}
            </Cta>
            <SmileGraphic
              className="ml-1 hidden h-9 w-14 text-bone/50 md:block"
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
              className="absolute -left-6 -top-6 h-20 w-20 border-l-2 border-t-2 border-ochre/50"
              aria-hidden
            />
            <div
              className="absolute -bottom-4 -right-4 h-20 w-20 border-b-2 border-r-2 border-ochre/50"
              aria-hidden
            />

            <ToothVisual className="mx-auto w-full max-w-[20rem] lg:max-w-[24rem] drop-shadow-2xl" />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — draw-on hairline + chevron head, with a vertical
          editorial label. The line draws downward via stroke-dashoffset, the
          chevron fades in and settles, then both retract for the loop.

          Positioning and motion are split across two elements on purpose: the
          outer div owns the -translate-x-1/2 centring, the inner one owns the
          entrance transform. Motion writes an inline `transform` when it
          animates `y`, which would otherwise clobber the Tailwind translate
          and knock the indicator off-centre.

          Under reduced motion the loop is dropped but the arrow stays drawn and
          legible - the line renders at dashoffset 0 and the chevron at full
          opacity, so it never depends on an animation having run to be seen. */}
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2">
        <motion.div
          {...enter({ y: 0 }, 1.6, 1.2)}
          style={reduce ? undefined : { opacity: fade }}
          className="flex flex-col items-center gap-3"
        >
          <span className="font-editorial text-[0.6rem] uppercase tracking-[0.4em] text-ochre/70 [writing-mode:vertical-rl]">
            Scroll
          </span>

          <svg width="12" height="36" viewBox="0 0 10 36" fill="none" aria-hidden className="text-ochre overflow-visible">
            {/* Hairline. pathLength normalises the path to 1 so the dash maths
                is unitless and independent of the rendered height. */}
            <motion.path
              d="M5 0.5V27"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              pathLength={1}
              style={{ strokeDasharray: "1 1" }}
              animate={reduce ? { strokeDashoffset: 0 } : { strokeDashoffset: [1, 0, 0, -1] }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 2.4, times: [0, 0.45, 0.8, 1], ease: "easeInOut", repeat: Infinity }
              }
            />
            {/* Chevron head — arrives once the line has drawn. */}
            <motion.g
              initial={{ opacity: 0, y: -5 }}
              animate={reduce ? { opacity: 1, y: 0 } : { opacity: [0, 0, 1, 1, 0], y: [-5, -5, 0, 2, 4] }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 2.4, times: [0, 0.45, 0.6, 0.85, 1], ease: "easeInOut", repeat: Infinity }
              }
            >
              <path
                d="M1.25 23.5 5 27.5 8.75 23.5"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

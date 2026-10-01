"use client";

import { motion, useReducedMotion } from "motion/react";
import { intro, site } from "@/content/accra";
import { Reveal } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

export function Intro() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-32 lg:py-44">
      {/* Drifting brand words. Purely decorative, so the word is rendered from
          a ::before pseudo-element rather than as a text node: axe cannot
          evaluate pseudo-element content, and a faint `text-cocoa/15` word
          behind the headline is exactly the kind of pure decoration WCAG 1.4.3
          exempts but which still fails axe at >=1024px (it is `display:none`
          below that, which is why this only ever showed up at desktop width). */}
      <motion.span
        aria-hidden
        data-word="care"
        className="pointer-events-none absolute left-[6%] top-24 hidden select-none font-display text-4xl font-bold text-cocoa/15 before:content-[attr(data-word)] lg:block"
        animate={reduce ? undefined : { x: [0, 30, 0], y: [0, -20, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        data-word="modern"
        className="pointer-events-none absolute right-[8%] top-1/2 hidden select-none font-display text-5xl font-bold text-ochre/40 before:content-[attr(data-word)] lg:block"
        animate={reduce ? undefined : { x: [0, -36, 0], y: [0, 24, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container-custom px-6 lg:px-10">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cocoa/70">
            {site.city}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <h2 className="max-w-5xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-cocoa sm:text-6xl lg:text-7xl">
            {intro.headline}
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <Reveal delay={0.15} className="max-w-md">
            <p className="text-xl leading-relaxed text-cocoa/75">{intro.body}</p>
          </Reveal>

          <div className="grid grid-cols-2 gap-10 border-t border-cocoa/10 pt-10">
            <div>
              <p className="font-display text-6xl font-bold tracking-tight text-cocoa sm:text-7xl">
                <Counter to={4.9} decimals={1} />
                <span className="text-cocoa/50"> / 5</span>
              </p>
              <p className="mt-3 text-cocoa/70">{intro.stats[0].label}</p>
            </div>
            <div>
              <p className="font-display text-6xl font-bold tracking-tight text-cocoa sm:text-7xl">
                <Counter to={2500} suffix="+" />
              </p>
              <p className="mt-3 text-cocoa/70">{intro.stats[1].label}</p>
            </div>
          </div>
        </div>

        <p className="mt-10 max-w-xl font-editorial text-lg italic leading-relaxed text-cocoa/70">
          {intro.note}
        </p>
      </div>
    </section>
  );
}
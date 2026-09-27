"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useRef, useState } from "react";
import { experience, experienceTitle } from "@/content/site";
import { swatch, cn } from "@/lib/utils";
import { easeOutExpo, springExperience } from "@/lib/motion";
import { useHydrated } from "@/lib/useHydrated";

export function Experience() {
  // Gated: this component swaps its whole JSX tree on `reduce`, and
  // useReducedMotion() disagrees between the server and the first client
  // render for reduced-motion visitors. See useHydrated.
  const hydrated = useHydrated();
  const reduce = useReducedMotion() && hydrated;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const [index, setIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(experience.length - 1, Math.floor(p * experience.length));
    setIndex(i);
  });

  if (reduce) {
    return (
      <div className="py-24">
        <div className="container-custom px-6 lg:px-10">
          <h2 className="font-display text-5xl font-bold tracking-tight text-ink sm:text-7xl">
            {experienceTitle}
          </h2>
          <div className="mt-16 space-y-16">
            {experience.map((p) => (
              <div key={p.word} className={cn("rounded-[2rem] p-10 sm:p-16", swatch(p.color))}>
                <p
                  className={cn(
                    "font-display text-6xl font-bold tracking-tight sm:text-8xl",
                    p.text === "cream" ? "text-cream" : "text-charcoal",
                  )}
                >
                  {p.word}
                </p>
                <h3 className="mt-6 font-display text-2xl font-semibold text-ink">{p.headline}</h3>
                <p className={cn("mt-3 max-w-md", p.text === "cream" ? "text-cream/80" : "text-charcoal/70")}>
                  {p.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const active = experience[index];

  return (
    <div ref={containerRef} className="relative">
      {/* Sticky sections - each 100vh */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        {experience.map((p, i) => (
          <div
            key={p.word}
            className="relative h-screen w-full"
            style={{ backgroundColor: `var(--color-${p.color})` }}
          />
        ))}
      </div>

      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <motion.div
          animate={{ backgroundColor: `var(--color-${active.color})` }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="absolute inset-0"
        />

        {/* pinned heading — an h2 so the section keeps a sequential heading
            order (h2 → h3). The base heading styles are reset back to the
            small-caps treatment it always had. */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-32 md:pt-36 lg:px-10">
          <h2 className="font-sans text-sm font-medium uppercase leading-normal tracking-[0.3em] text-charcoal/70">
            {experienceTitle}
          </h2>
          <p className="font-display text-sm font-semibold text-charcoal/70 tabular-nums">
            0{index + 1} / 0{experience.length}
          </p>
        </div>

        {/* the giant word */}
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.word}
              initial={{ opacity: 0, y: 90, rotate: 3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -90, rotate: -3 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "px-6 text-center font-display text-[clamp(4rem,16vw,13rem)] font-bold leading-none tracking-tight",
                active.text === "cream" ? "text-cream" : "text-charcoal",
              )}
            >
              {active.word}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* copy */}
        <div className="relative z-10 flex flex-col gap-6 px-6 pb-16 md:flex-row md:items-end md:justify-between md:px-10 lg:pb-20">
          <div className="max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${active.word}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {active.headline}
                </h3>
                <p className={cn("mt-2", active.text === "cream" ? "text-cream/75" : "text-charcoal/70")}>
                  {active.copy}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* progress bar */}
          <div className="h-[3px] w-full max-w-[16rem] overflow-hidden rounded-full bg-charcoal/15">
            <motion.div
              className="h-full origin-left rounded-full bg-current"
              style={{ scaleX: scrollYProgress, color: active.text === "cream" ? "#f5f0e6" : "#100f0c" }}
            />
          </div>
        </div>

        {/* huge faded background word */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-16 z-0 flex justify-center"
        >
          <span className="font-display text-[26vw] font-bold leading-none tracking-tight text-ink/5">
            {active.word}
          </span>
        </div>
      </div>
    </div>
  );
}


"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useRef, useState } from "react";
import { experience, experienceTitle } from "@/content/accra";
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
          <h2 className="font-display text-5xl font-bold tracking-tight text-cocoa sm:text-7xl">
            {experienceTitle}
          </h2>
          <div className="mt-16 space-y-16">
            {experience.map((p) => (
              <div key={p.word} className={cn("rounded-[2rem] p-10 sm:p-16", swatch(p.color))}>
                <p
                  className={cn(
                    "font-display text-6xl font-bold tracking-tight sm:text-8xl",
                    // Was `p.text === "cream"`, a swatch name the rebrand removed,
                    // so this always resolved to the else branch: the TIME
                    // principle is the one entry on a cocoa surface and its word
                    // rendered cocoa-on-cocoa, invisible.
                    //
                    // Bone on every surface that is not bone or light: 16.28:1 on
                    // cocoa, 6.34:1 on clay, 3.77:1 on sage. The sage figure clears
                    // AA only because this word is 64px or larger.
                    p.color === "bone" || p.color === "sage-light"
                      ? "text-cocoa"
                      : "text-bone",
                  )}
                >
                  {p.word}
                </p>
                <h3
                  className={cn(
                    "mt-6 font-display text-2xl font-semibold",
                    p.color === "bone" || p.color === "sage-light"
                      ? "text-cocoa"
                      : "text-bone",
                  )}
                >
                  {p.headline}
                </h3>
                <p
                  className={cn(
                    "mt-3 max-w-md",
                    p.color === "bone" || p.color === "sage-light"
                      ? "text-cocoa/70"
                      : "text-bone/80",
                  )}
                >
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
          <h2 className="font-sans text-sm font-medium uppercase leading-normal tracking-[0.3em] text-cocoa/70">
            {experienceTitle}
          </h2>
          <p className="font-display text-sm font-semibold text-cocoa/70 tabular-nums">
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
                // Bone on every mid-tone surface. On clay that is 6.34:1 and on
                // sage 3.77:1 — the latter clears AA only because this word is
                // 64px or larger. The copy below it uses the light surfaces
                // instead, where it has to clear 4.5.
                "text-bone",
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
                <h3
                  className={cn(
                    "font-display text-2xl font-semibold tracking-tight sm:text-3xl",
                    active.color === "bone" || active.color === "sage-light"
                      ? "text-cocoa"
                      : "text-bone",
                  )}
                >
                  {active.headline}
                </h3>
                {/* 16px body copy, so this needs 4.5:1 — hence the light
                    surfaces for the mid-tone panels, and bone-on-cocoa. */}
                <p
                  className={cn(
                    "mt-2",
                    active.color === "bone" || active.color === "sage-light"
                      ? "text-cocoa/70"
                      : "text-bone/75",
                  )}
                >
                  {active.copy}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* progress bar */}
          <div className="h-[3px] w-full max-w-[16rem] overflow-hidden rounded-full bg-cocoa/15">
            <motion.div
              className="h-full origin-left rounded-full bg-current"
              style={{
                scaleX: scrollYProgress,
                // Reads the token off the active surface rather than carrying a
                // hard-coded hex: the `text` field names a swatch, and the swatch
                // map in utils.ts owns the tone. A literal here would drift from
                // the palette the moment a tone changed.
                color: active.text === "cocoa" ? "var(--color-bone)" : "var(--color-cocoa)",
              }}
            />
          </div>
        </div>

        {/* huge faded background word */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-16 z-0 flex justify-center"
        >
          <span className="font-display text-[26vw] font-bold leading-none tracking-tight text-cocoa/5">
            {active.word}
          </span>
        </div>
      </div>
    </div>
  );
}


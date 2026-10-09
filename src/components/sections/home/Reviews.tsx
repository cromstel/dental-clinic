"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Star, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { rating, reviews } from "@/content/accra";
import { Reveal } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

export function Reviews() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  // Three independent reasons the carousel can be held still, rather than one
  // boolean that two handlers fought over.
  //
  // Previously `onMouseLeave` and `onBlur` both wrote the same `paused` state, so
  // whichever fired last won: moving the mouse out while a control still had focus
  // resumed the rotation under the user's cursor, and blurring while the pointer
  // was still over the block stopped it. Neither is what either event means.
  const [heldByPointer, setHeldByPointer] = useState(false);
  const [heldByFocus, setHeldByFocus] = useState(false);
  const [heldByChoice, setHeldByChoice] = useState(false);

  const count = reviews.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  const paused = heldByPointer || heldByFocus || heldByChoice;

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, reduce, paused]);

  const active = reviews[index];

  return (
    <section className="relative overflow-hidden bg-bone py-28 lg:py-40">
      <div className="container-custom px-6 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="flex gap-1 text-ochre" role="img" aria-label={`Rated ${rating.value} of 5`}>
              {Array.from({ length: rating.stars }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" aria-hidden />
              ))}
            </span>
            <span className="font-display text-lg font-semibold text-cocoa">
              <Counter to={4.9} decimals={1} /> / 5
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <h2 className="max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-cocoa sm:text-6xl">
            {rating.headline}
          </h2>
        </Reveal>

        {/*
          `role="region"` with a label, rather than a bare div carrying mouse and
          focus handlers.

          The pause-on-interaction behaviour is deliberate and is not being removed
          — it is what makes the block feel calm on hover. But a div with handlers
          and no role is a landmark-shaped thing that is not a landmark, and the
          handlers were doing accessibility work that assistive technology had no
          way to see. As a labelled region the pause behaviour is discoverable, and
          the block is announced as the reviews carousel rather than skipped.

          `jsx-a11y/no-static-element-interactions` is what flagged this.
        */}
        <div
          role="region"
          aria-label="Patient reviews"
          className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20"
          onMouseEnter={() => setHeldByPointer(true)}
          onMouseLeave={() => setHeldByPointer(false)}
          onFocus={() => setHeldByFocus(true)}
          onBlur={() => setHeldByFocus(false)}
        >
          <div className="relative min-h-[18rem] border-t-2 border-cocoa pt-10 sm:min-h-[16rem]">
            <AnimatePresence mode="wait">
              {/* Set as a quotation, not as display type. A testimonial in a
                  geometric display face reads as advertising; the editorial
                  serif italic reads as something the patient said. This is the
                  rule the serif now follows across the site — it carries
                  quotation and voice, while Clash carries structure and
                  headlines. `leading-[1.22]` rather than the 1.1 this used at:
                  a serif italic needs the extra leading to stay readable at
                  30px. `tracking-tight` is dropped because negative tracking
                  closes up a serif's joins. The footer keeps `not-italic`,
                  which was defensive before and is now load-bearing. */}
              <motion.blockquote
                key={index}
                initial={{ y: 36 }}
                animate={{ y: 0 }}
                exit={{ y: -28 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-editorial text-3xl italic leading-[1.22] text-cocoa sm:text-5xl"
              >
                “{active.quote}”
                <footer className="mt-8 flex items-center gap-3 font-sans text-sm font-medium not-italic text-cocoa/70">
                  <span className="h-2 w-2 rounded-full bg-ochre" />
                  {active.author} · {active.location}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-start justify-between gap-10 lg:items-end">
            <div className="lg:text-right">
              <p className="text-sm uppercase tracking-[0.25em] text-cocoa/70">In their words</p>
              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={prev}
                  aria-label="Previous review"
                  data-cursor="hover"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-cocoa/25 transition-colors hover:bg-cocoa hover:text-bone"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next review"
                  data-cursor="hover"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-cocoa text-bone transition-colors hover:bg-cocoa"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                >
                  <span
                    aria-hidden
                    className="block h-2 rounded-full transition-all"
                    style={{
                      backgroundColor:
                        i === index ? "var(--color-cocoa)" : "color-mix(in srgb, var(--color-cocoa) 25%, transparent)",
                      width: i === index ? 28 : 8,
                    }}
                  />
                </button>
              ))}

              {/*
                WCAG 2.2.2 (Pause, Stop, Hide).

                This block rotates on its own every five seconds and keeps going.
                Pausing on hover and on focus is a courtesy, not a mechanism a
                visitor can rely on: a touch user has no hover, and a keyboard user
                who tabs past the block has neither. Success Criterion 2.2.2 asks
                for a user-activatable way to stop auto-updating content, so there
                is an explicit control.

                Hidden under `prefers-reduced-motion`, because `reduce` already stops
                the rotation entirely — offering a pause for something that is not
                moving would be a control that does nothing.
              */}
              {!reduce && (
                <button
                  onClick={() => setHeldByChoice((p) => !p)}
                  aria-label={heldByChoice ? "Resume automatic rotation" : "Pause automatic rotation"}
                  aria-pressed={heldByChoice}
                  data-cursor="hover"
                  className="ml-3 flex h-8 w-8 items-center justify-center rounded-full border border-cocoa/25 text-cocoa/70 transition-colors hover:border-cocoa hover:text-cocoa"
                >
                  {heldByChoice ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

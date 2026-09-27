"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { rating, reviews } from "@/content/site";
import { Reveal } from "@/components/motion/Reveal";
import { Counter } from "@/components/motion/Counter";

export function Reviews() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, reduce, paused]);

  const active = reviews[index];

  return (
    <section className="relative overflow-hidden bg-cream py-28 lg:py-40">
      <div className="container-custom px-6 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="flex gap-1 text-limedeep" role="img" aria-label={`Rated ${rating.value} of 5`}>
              {Array.from({ length: rating.stars }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" aria-hidden />
              ))}
            </span>
            <span className="font-display text-lg font-semibold text-ink">
              <Counter to={4.9} decimals={1} /> / 5
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <h2 className="max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-ink sm:text-6xl">
            {rating.headline}
          </h2>
        </Reveal>

        <div
          className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="relative min-h-[18rem] border-t-2 border-charcoal pt-10 sm:min-h-[16rem]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={{ y: 36 }}
                animate={{ y: 0 }}
                exit={{ y: -28 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl"
              >
                “{active.quote}”
                <footer className="mt-8 flex items-center gap-3 font-sans text-sm font-medium not-italic text-charcoal/70">
                  <span className="h-2 w-2 rounded-full bg-limedeep" />
                  {active.author} · {active.location}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-start justify-between gap-10 lg:items-end">
            <div className="lg:text-right">
              <p className="text-sm uppercase tracking-[0.25em] text-charcoal/70">
                Placeholder reviews
              </p>
              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={prev}
                  aria-label="Previous review"
                  data-cursor="hover"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/25 transition-colors hover:bg-charcoal hover:text-cream"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Next review"
                  data-cursor="hover"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-cream transition-colors hover:bg-ink"
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
                    style={{ backgroundColor: i === index ? "#100f0c" : "rgba(16,15,12,0.25)", width: i === index ? 28 : 8 }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-14 text-xs text-charcoal/70">{rating.placeholder}</p>
      </div>
    </section>
  );
}
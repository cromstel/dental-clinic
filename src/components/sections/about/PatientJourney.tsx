"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { patientSteps } from "@/content/accra";
import { cn, swatch } from "@/lib/utils";
import { useHydrated } from "@/lib/useHydrated";

export function PatientJourney() {
  // Gated: this component swaps its whole JSX tree on `reduce`, and
  // useReducedMotion() disagrees between the server and the first client
  // render for reduced-motion visitors. See useHydrated.
  const hydrated = useHydrated();
  const reduce = useReducedMotion() && hydrated;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: reduce ? undefined : ref,
    offset: ["start start", "end end"],
  });

  // Dynamic width calculation based on number of cards
  const cardWidth = 30; // vmax per card
  const totalCardsWidth = patientSteps.length * cardWidth;
  const x = useTransform(scrollYProgress, [0, 1], ["2%", `calc(100% - ${totalCardsWidth}vmax - 60vw)`]);

  const cards = patientSteps.map((s, i) => (
    <JourneyCard key={s.number} number={s.number} title={s.title} copy={s.copy} color={s.color} index={i} />
  ));

  if (reduce) {
    return <div className="space-y-4">{cards}</div>;
  }

  return (
    <>
      {/* Desktop: Horizontal scroll experience */}
      <div ref={ref} className="relative hidden h-[320vh] lg:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-bone">
          <motion.div
            style={{ x }}
            className="flex w-max items-stretch gap-6 px-[8vw]"
            aria-label="The patient experience, step by step"
          >
            <div className="flex w-[32vw] min-w-[20rem] flex-col justify-center">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-cocoa/70">
                Patient Experience
              </p>
              <h2 className="mt-4 max-w-md font-display text-5xl font-bold leading-[0.95] tracking-tight text-cocoa sm:text-6xl xl:text-7xl">
                From hello to{" "}
                <span className="text-ochre-ink">smiling.</span>
              </h2>
              <p className="mt-6 max-w-xs text-cocoa/70">
                Five steps. No surprises, no upselling, no lectures.
              </p>
            </div>
            {cards}
            <div className="flex w-[24vw] min-w-[16rem] flex-col justify-center">
              <ArrowRight className="mb-4 h-8 w-8 rotate-180 text-cocoa/30" aria-hidden />
              <p className="max-w-[14rem] font-display text-2xl font-semibold tracking-tight text-cocoa">
                That&apos;s it. Really.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile: Horizontal carousel with snap */}
      <div className="lg:hidden">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cocoa/70">
            Patient Experience
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-tight text-cocoa">
            From hello to <span className="text-ochre-ink">smiling.</span>
          </h2>
          <p className="mt-4 text-cocoa/70">
            Five steps. No surprises, no upselling, no lectures.
          </p>
        </div>
        <MobileJourneyCarousel cards={cards} />
      </div>
    </>
  );
}

function MobileJourneyCarousel({ cards }: { cards: React.ReactElement[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-snap-x snap-mandatory pb-4 -mx-6 px-6"
        style={{ scrollbarWidth: "none" }}
      >
        {React.Children.toArray(cards).map((card, i) => (
          <motion.div
            key={i}
            className="shrink-0 snap-start w-[85vw] max-w-sm scroll-snap-align-start"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            {card}
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator dots */}
      <div className="flex justify-center gap-1 mt-4">
        {React.Children.toArray(cards).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              containerRef.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center" });
              setActiveIndex(i);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full"
            aria-label={`Go to step ${i + 1}`}
            aria-current={i === activeIndex ? "true" : "false"}
          >
            <span
              aria-hidden
              className={cn(
                "block h-2 rounded-full transition-all duration-300",
                i === activeIndex ? "bg-ochre w-6" : "bg-cocoa/20 hover:bg-cocoa/40"
              )}
            />
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-cocoa/70 mt-2">
        Swipe to explore the journey →
      </p>
    </div>
  );
}

function JourneyCard({
  number,
  title,
  copy,
  color,
  index,
}: {
  number: string;
  title: string;
  copy: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex h-[60vh] min-h-[26rem] w-[30vmax] min-w-[19rem] shrink-0 flex-col items-start justify-between rounded-[2.5rem] p-8 sm:p-10",
        swatch(color),
      )}
    >
      <span aria-hidden className="font-display text-6xl font-bold text-cocoa/15 sm:text-7xl">{number}</span>
      <div>
        <h3 className="font-display text-3xl font-bold tracking-tight text-cocoa sm:text-4xl">{title}</h3>
        <p className="mt-2 max-w-[16rem] text-cocoa/70">{copy}</p>
      </div>
    </motion.div>
  );
}
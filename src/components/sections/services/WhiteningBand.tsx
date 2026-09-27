"use client";

import { motion, useReducedMotion } from "motion/react";
import { SmileGraphic } from "@/components/ui/SmileGraphic";
import { Cta } from "@/components/ui/Cta";
import { whitening } from "@/content/site";

export function WhiteningBand() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-cream py-28 lg:py-36">
      <SmileGraphic
        className="mx-auto h-20 w-36 text-limedeep md:h-24 md:w-44"
        animated={!reduce}
      />

      <motion.h2
        initial={reduce ? undefined : { opacity: 0, y: 60 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-12 max-w-5xl px-6 text-center font-display text-[clamp(3rem,8vw,7rem)] font-bold leading-[0.92] tracking-tight text-ink"
      >
        {whitening.title.split(" ").map((word, i, arr) => (
          <span key={i} className={i === arr.length - 1 ? "text-limeleaf" : undefined}>
            {word}{" "}
          </span>
        ))}
      </motion.h2>

      <motion.p
        initial={reduce ? undefined : { opacity: 0, y: 24 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-8 max-w-xl px-6 text-center text-lg leading-relaxed text-charcoal/70"
      >
        {whitening.body}
      </motion.p>

      <div className="mt-12 flex justify-center">
        <Cta href="/contact">{whitening.cta}</Cta>
      </div>
    </section>
  );
}
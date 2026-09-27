"use client";

import { motion, useReducedMotion } from "motion/react";
import { intro, site } from "@/content/site";

export function Manifesto() {
  const reduce = useReducedMotion();
  const headline = "Dentistry worth smiling about.";

  return (
    <section className="bg-charcoal py-28 text-cream lg:py-40">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <p className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[1.02] tracking-tight">
          {headline.split(" ").map((word, i, arr) => (
            <motion.span
              key={i}
              initial={reduce ? undefined : { opacity: 0, y: 40 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={
                "inline-block " +
                (i === arr.length - 2 || i === arr.length - 1 ? "text-limedeep " : "") +
                (i === arr.length - 1 ? "italic" : "")
              }
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </p>

        <div className="mt-14 grid gap-10 border-t border-cream/15 pt-14 lg:grid-cols-[1fr_1.4fr]">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-cream/80">
            {intro.headline}
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-cream/65">
            <p>{intro.body}</p>
            <p>
              {site.fullName} is at {site.address.lines[0]}, {site.city.toLowerCase()} —{" "}
              {site.address.between.toLowerCase()}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
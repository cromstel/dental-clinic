"use client";

import { motion, useReducedMotion } from "motion/react";
import { ScanLine, Sparkles, CircleGauge, CalendarCheck2 } from "lucide-react";
import { invisalign as inv } from "@/content/site";

const icons = {
  scan: ScanLine,
  plan: CircleGauge,
  aligner: Sparkles,
  check: CalendarCheck2,
};

const palette = ["bg-lavender", "bg-peach", "bg-mint", "bg-butter"];

export function InvisalignFeatures() {
  const reduce = useReducedMotion();
  const items = inv.features.map((f, i) => ({
    ...f,
    icon: Object.values(icons)[i],
    color: palette[i],
  }));

  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="container-custom px-6 lg:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl font-display text-4xl font-bold leading-[0.97] tracking-tight text-ink sm:text-6xl">
            How it{" "}
            <span className="italic text-limeleaf">works.</span>
          </h2>
          <p className="max-w-sm text-charcoal/70">
            Four steps between hello and a straighter smile.
          </p>
        </div>

        <motion.ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {items.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.li
                key={f.title}
                variants={{
                  hidden: { opacity: 0, y: 48 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="group flex flex-col gap-6 rounded-3xl bg-paper p-8 transition-colors duration-300 hover:bg-charcoal"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-charcoal transition-colors duration-300 group-hover:text-ink ${f.color}`}
                >
                  <Icon className="h-7 w-7" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-charcoal/70 tabular-nums transition-colors duration-300 group-hover:text-cream/40">
                    0{i + 1}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink transition-colors duration-300 group-hover:text-cream">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-charcoal/70 transition-colors duration-300 group-hover:text-cream/60">
                    {f.copy}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
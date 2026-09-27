"use client";

import { motion, useReducedMotion } from "motion/react";

const trays = [
  { delay: 0, rotate: -6, y: 38, w: "w-[88%]" },
  { delay: 0.35, rotate: 5, y: 20, w: "w-[82%]" },
  { delay: 0.7, rotate: -3, y: 0, w: "w-[76%]" },
];

export function AlignerVisual() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-square max-h-[560px] w-full max-w-[560px] overflow-hidden rounded-[2.5rem] bg-lavender">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.7),transparent_60%)]" />

      <div aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-[16%]">
        <ToothRow />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {trays.map((t) => (
          <motion.div
            key={t.delay}
            initial={reduce ? undefined : { y: 70, opacity: 0, rotate: 0 }}
            whileInView={reduce ? undefined : { y: t.y, opacity: 1, rotate: t.rotate }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 + t.delay * 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute ${t.w} flex justify-center`}
            aria-hidden
          >
            <div className="h-44 w-full rounded-[4rem] border-2 border-white/60 bg-white/50 shadow-[0_20px_40px_rgba(26,25,21,0.18)] backdrop-blur-md sm:h-52" />
          </motion.div>
        ))}

        <motion.p
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute font-display text-lg font-semibold tracking-tight text-ink"
        >
          nearly invisible
        </motion.p>
      </div>

      <span className="absolute left-6 top-6 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink backdrop-blur">
        Invisalign
      </span>
      <span className="absolute bottom-6 right-6 font-display text-sm font-semibold text-charcoal/70">
        14 trays · ~9 months
      </span>
    </div>
  );
}

function ToothRow() {
  return (
    <div className="flex items-end justify-center gap-2">
      {[22, 30, 28, 34, 26, 30, 22].map((h, i) => (
        <div
          key={i}
          style={{ height: h * 0.5 }}
          className="w-[24px] aligner-ellipse bg-cream shadow-inner sm:w-[30px]"
        />
      ))}
    </div>
  );
}
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
    <div className="relative mx-auto aspect-square max-h-[560px] w-full max-w-[560px] overflow-hidden rounded-[2.5rem] bg-cocoa">
      {/* Warm light from the upper right, in the palette's own bone tone rather
          than pure white, so the trays read as glass against cocoa instead of
          as a white blob on a coloured panel. */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,237,227,0.34),transparent_62%)]" />

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
            <div className="h-44 w-full rounded-[4rem] border-2 border-bone/45 bg-bone/20 shadow-[0_20px_40px_rgba(13,10,8,0.34)] backdrop-blur-md sm:h-52" />
          </motion.div>
        ))}

        <motion.p
          initial={reduce ? undefined : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute font-display text-lg font-semibold tracking-tight text-bone/85"
        >
          nearly invisible
        </motion.p>
      </div>

      <span className="absolute left-6 top-6 rounded-full bg-ochre px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ochre-ink">
        Clear aligners
      </span>
      <span className="absolute bottom-6 right-6 font-display text-sm font-semibold text-bone/70">
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
          className="w-[24px] aligner-ellipse bg-bone shadow-inner sm:w-[30px]"
        />
      ))}
    </div>
  );
}
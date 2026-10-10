"use client";

import { motion } from "motion/react";

export function StudioBanner() {
  return (
    <section
      aria-label="Studio atmosphere"
      className="relative overflow-hidden bg-cocoa py-20 lg:py-28"
    >
      {/* Soft ochre radial glow — decorative, not a gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-[-20%] h-[120%] w-[140%] rounded-full bg-ochre/[0.12] blur-[80px]"
      />

      {/* Geometric SVG — hairline strokes in ochre / bone, ellipses from design language */}
      <svg
        aria-hidden
        viewBox="0 0 1200 320"
        preserveAspectRatio="xMidYMid meet"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      >
        <defs>
          <linearGradient id="og" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e0a02c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8f3d1c" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* Large aligner-ellipse form, subtle */}
        <ellipse cx="200" cy="160" rx="180" ry="90" fill="none" stroke="url(#og)" strokeWidth="0.75" />
        <ellipse cx="200" cy="160" rx="120" ry="60" fill="none" stroke="#e0a02c" strokeWidth="0.5" opacity="0.35" />
        {/* Diagonal hairline — breaks horizontal rhythm */}
        <line x1="900" y1="0" x2="1100" y2="320" stroke="#e0a02c" strokeWidth="0.5" opacity="0.2" />
        {/* Small dot cluster — references the cursor dot, decorative only */}
        <circle cx="600" cy="140" r="3" fill="#e0a02c" opacity="0.5" />
        <circle cx="615" cy="145" r="2" fill="#f4ede3" opacity="0.6" />
        <circle cx="620" cy="130" r="1.5" fill="#e0a02c" opacity="0.4" />
        {/* Hairline border framing the band */}
        <line x1="0" y1="20" x2="1200" y2="20" stroke="#8f3d1c" strokeWidth="0.25" opacity="0.15" />
        <line x1="0" y1="300" x2="1200" y2="300" stroke="#8f3d1c" strokeWidth="0.25" opacity="0.15" />
      </svg>

      {/* Editorial serif statement — the voice role established in F1 */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-editorial text-3xl font-normal italic leading-[1.25] text-bone/90 sm:text-4xl lg:text-5xl"
        >
          A quieter kind of quieter dentistry.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-5 font-sans text-sm font-medium uppercase tracking-[0.25em] text-ochre"
        >
          Studio — 18 Boundary Road, Osu, Accra
        </motion.p>
      </div>
    </section>
  );
}

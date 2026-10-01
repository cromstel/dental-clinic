"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "motion/react";

/** Progress bar at the top of the page showing scroll progress */
export function ProgressBar() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Respect reduced motion - snap to final value instantly
  const width = useTransform(scrollYProgress, [0, 1], reduce ? ["100%", "100%"] : ["0%", "100%"]);

  return (
    <motion.div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={reduce ? 100 : undefined}
      aria-label="Page scroll progress"
      style={{ width }}
      className={cn(
        "fixed top-0 left-0 z-[100] h-[3px] w-full",
        "bg-ochre origin-left transition-transform duration-100 ease-out",
        "shadow-[0_2px_8px_rgba(224,160,44,0.45)]",
      )}
    />
  );
}
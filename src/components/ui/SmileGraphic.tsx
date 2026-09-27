"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type SmileGraphicProps = {
  className?: string;
  animated?: boolean;
  curve?: number;
  color?: "currentColor" | "charcoal" | "lime";
};

/**
 * The recurring CITGROUP brand mark — a curved smile + two dots.
 * Can flatten/stretch/rotate and double as a section divider.
 */
export function SmileGraphic({
  className,
  animated = true,
  curve = 26,
  color = "currentColor",
}: SmileGraphicProps) {
  const reduce = useReducedMotion();

  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      aria-hidden
      className={cn("inline-block", className)}
      style={color !== "currentColor" ? undefined : undefined}
    >
      <circle
        cx="28"
        cy="30"
        r="7"
        fill="currentColor"
        className={color === "lime" ? "text-lime" : color === "charcoal" ? "text-charcoal" : ""}
      />
      <circle
        cx="92"
        cy="30"
        r="7"
        fill="currentColor"
        className={color === "lime" ? "text-lime" : color === "charcoal" ? "text-charcoal" : ""}
      />
      <motion.path
        d={`M 20 ${50 + curve} C 38 ${72 + curve * 0.4}, 82 ${72 + curve * 0.4}, 100 ${50 + curve}`}
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        initial={animated && !reduce ? { pathLength: 0.1, opacity: 0 } : false}
        whileInView={
          animated && !reduce
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 1, opacity: 1 }
        }
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
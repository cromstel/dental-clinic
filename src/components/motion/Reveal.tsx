"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";

type Variant = "up" | "fade" | "clip" | "scale" | "left";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  amount?: number;
};

const hidden: Record<Variant, Record<string, unknown>> = {
  up: { opacity: 0, y: 48 },
  fade: { opacity: 0 },
  clip: { opacity: 0, y: 24, clipPath: "inset(0 0 100% 0)" },
  scale: { opacity: 0, scale: 0.92 },
  left: { opacity: 0, x: -48 },
};

export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
  duration = 0.9,
  y = 48,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();

  const initial = reduce ? { opacity: 0 } : { ...hidden[variant], y };
  const animate = reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, scale: 1, clipPath: "inset(0 0 0% 0)" };

  return (
    <motion.div
      className={cn(className)}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount }}
      transition={{
        duration,
        ease: easeOutExpo,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
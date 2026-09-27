"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";

type SplitTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  wordClassName?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  animate?: boolean;
  /** Accessible name for the split text. Defaults to `text`. Only exposed on non-heading tags (headings expose `aria-label`). */
  ariaLabel?: string;
};

const MotionTagMap: Record<string, ElementType> = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
  div: motion.div,
};

export function SplitText({
  text,
  as = "h2",
  className,
  wordClassName,
  charClassName,
  delay = 0,
  stagger = 0.035,
  once = true,
  animate = true,
  ariaLabel,
}: SplitTextProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -12% 0px" });
  const shouldAnimate = animate && inView && !reduce;
  const [settled, setSettled] = useState(!shouldAnimate);

  const words = useMemo(() => text.split(" "), [text]);
  const isHeading = as === "h1" || as === "h2" || as === "h3";
  const MotionTag = MotionTagMap[as];

  // `will-change-transform` is only applied while the glyphs are actually
  // moving, then dropped. Keeping it permanently on every character keeps a
  // compositor layer alive for text that never moves again — on a page with
  // six split headings that is a lot of wasted GPU memory.
  useEffect(() => {
    if (!shouldAnimate) {
      setSettled(true);
      return;
    }
    const charCount = words.reduce((n, w) => n + w.length, 0);
    const last = delay + (charCount - 1) * stagger;
    const t = window.setTimeout(() => setSettled(true), (last + 0.7) * 1000 + 100);
    return () => window.clearTimeout(t);
  }, [shouldAnimate, delay, stagger, words]);

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      aria-label={isHeading ? ariaLabel ?? text : undefined}
    >
      {isHeading ? null : <span className="sr-only">{ariaLabel ?? text}</span>}
      {words.map((word, wi) => (
        <span
          key={wi}
          aria-hidden
          className={cn("inline-flex overflow-hidden pb-[0.08em] -mb-[0.08em]", wordClassName)}
        >
          {shouldAnimate ? (
            word.split("").map((char, ci) => (
              <motion.span
                key={ci}
                className={cn("inline-block", !settled && "will-change-transform", charClassName)}
                initial={{ y: "110%", rotate: 6, opacity: 0 }}
                animate={{ y: "0%", rotate: 0, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                  delay: delay + (wi * 3 + ci) * stagger,
                }}
              >
                {char}
              </motion.span>
            ))
          ) : (
            word
          )}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </MotionTag>
  );
}
"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  items: string[];
  className?: string;
  itemClassName?: string;
  separator?: string;
  reverse?: boolean;
  outline?: boolean;
};

export function Marquee({
  items,
  className,
  itemClassName,
  separator = "✦",
  reverse = false,
  outline = false,
}: MarqueeProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.05 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Reduced motion / hidden: park the track statically at 0.
    if (reduce || !inView) {
      track.style.transform = "translate3d(0,0,0)";
      return;
    }

    const half = track.firstElementChild as HTMLElement | null;
    if (!half) return;
    const width = half.scrollWidth;

    let x = 0;
    let raf = 0;
    let lastY = window.scrollY;
    let dir = reverse ? -1 : 1;
    let velocity = 1;

    const tick = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;

      if (Math.abs(dy) > 0.4) {
        dir = (dy > 0 ? 1 : -1) * (reverse ? -1 : 1);
      }
      const target = 0.6 + Math.min(Math.abs(dy) / 12, 3.4);
      velocity += (target - velocity) * 0.06;

      x -= dir * velocity * 0.8;

      if (Math.abs(x) >= width) {
        x = x % width;
      }
      track.style.transform = `translate3d(${x}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, reverse]);

  // Each half renders one copy of the items; the track holds two identical
  // halves and wraps at half-width, which keeps the loop seamless with only
  // 2x the items in the DOM.
  return (
    <div ref={rootRef} className={cn("overflow-hidden mask-fade-y", className)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        {[0, 1].map((half) => (
          <div
            key={half}
            aria-hidden={half === 1}
            className="flex w-max shrink-0 items-center"
          >
            {items.map((item, i) => (
              <span
                key={i}
                className={cn(
                  "flex items-center whitespace-nowrap font-display font-semibold",
                  outline && i % 2 === 1 && "text-outline",
                  itemClassName,
                )}
              >
                {item}
                <span className="mx-[0.35em] inline-block" aria-hidden>
                  {separator}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { springMagnetic } from "@/lib/motion";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
  as?: "div" | "span";
};

export function Magnetic({
  children,
  className,
  strength = 0.35,
  as = "div",
}: MagneticProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  // `Magnetic` wraps every CTA on the site, so the compositor hint is applied
  // only while the element is actually being pulled around and released as
  // soon as the pointer leaves — instead of permanently promoting a layer for
  // each of them.
  const [active, setActive] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springMagnetic);
  const sy = useSpring(y, springMagnetic);

  const Tag = motion[as];

  // Read layout geometry once per hover (or after a resize) instead of on
  // every pointermove, avoiding repeated forced reflows while dragging/hovering.
  const measure = useCallback(() => {
    rectRef.current = ref.current ? ref.current.getBoundingClientRect() : null;
  }, []);

  useEffect(() => {
    const onResize = () => {
      rectRef.current = null;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function onMove(e: PointerEvent) {
    if (reduce) return;
    if (!rectRef.current && ref.current) measure();
    const r = rectRef.current;
    if (!r) return;
    setActive(true);
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function onLeave() {
    setActive(false);
    x.set(0);
    y.set(0);
  }

  return (
    <Tag
      ref={ref}
      onPointerEnter={measure}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", active && "will-change-transform", className)}
    >
      {children}
    </Tag>
  );
}
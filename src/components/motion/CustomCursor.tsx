"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { springCursorOuter, springCursorInner } from "@/lib/motion";

export function CustomCursor() {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, springCursorOuter);
  const ry = useSpring(my, springCursorOuter);

  useEffect(() => {
    setFine(typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (reduce || !fine) return;

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest("a, button, [data-cursor='hover'], input, textarea, select, label"));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.body.classList.add("no-cursor");
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.body.classList.remove("no-cursor");
    };
  }, [fine, reduce, mx, my]);

  if (reduce || !fine) return null;

  // The native cursor is suppressed (`.no-cursor`), so this has to stay
  // legible over every surface it crosses — bone sections, the cocoa
  // booking band and the cocoa hero. White with `difference` blending
  // inverts against the backdrop, so a single fill works on all of them
  // (a fixed cocoa dot was 1.03:1 — effectively invisible — on the hero).
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] flex h-0 w-0 items-center justify-center"
        style={{ x: mx, y: my }}
        animate={{ opacity: visible ? 1 : 0 }}
      >
        <span className="-translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-cocoa ring-1 ring-bone/60" />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[99] flex h-0 w-0 items-center justify-center"
        style={{ x: rx, y: ry }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ type: "spring", ...springCursorInner }}
      >
        <span
          className="-translate-x-1/2 -translate-y-1/2 block rounded-full border border-cocoa/30 bg-bone/90 shadow-[0_0_0_1px_rgba(20,16,13,0.08)] transition-[width,height] duration-300 ease-out"
          style={{ width: hovering ? 64 : 36, height: hovering ? 64 : 36 }}
        />
      </motion.div>
    </>
  );
}
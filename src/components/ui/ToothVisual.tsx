"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Abstract 3D-looking tooth / smile object built from layered SVG,
 * gradients and blur. Gently cursor-reactive on desktop, breathing on loop.
 */
export function ToothVisual({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 18 });
  const sry = useSpring(ry, { stiffness: 120, damping: 18 });

  // Read layout geometry once per hover (or after a resize) rather than on
  // every pointermove, avoiding repeated forced reflows during cursor moves.
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
    const rect = rectRef.current;
    if (!rect) return;
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    ry.set(nx * 14);
    rx.set(-ny * 10);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerEnter={measure}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("relative", className)}
      style={{ perspective: 900 }}
    >
      <motion.div
        className="relative will-change-transform"
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { y: [0, -14, 0], rotateZ: [-1.5, 2, -1.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Soft acid glow behind the tooth */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 scale-125 rounded-full bg-ochre/40 blur-3xl"
        />

        <svg viewBox="0 0 200 260" className="w-full drop-shadow-[0_30px_60px_rgba(13,10,8,0.34)]">
          <defs>
            {/* Warm bone gradient — the cream stops this replaced were tuned for
                the old ivory page and read almost white against cocoa. */}
            <linearGradient id="toothFill" x1="0" y1="0" x2="0.2" y2="1">
              <stop offset="0%" stopColor="#faf4ea" />
              <stop offset="55%" stopColor="#f0e6d6" />
              <stop offset="100%" stopColor="#ddcfb8" />
            </linearGradient>
            <radialGradient id="toothGlow" cx="0.5" cy="0.25" r="0.6">
              <stop offset="0%" stopColor="#fffdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fffdf8" stopOpacity="0" />
            </radialGradient>
            <filter id="toothSoft" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* silhouette with a soft smear */}
          <path
            d={TOOTH_D}
            fill="url(#toothFill)"
            filter="url(#toothSoft)"
            opacity="0.55"
            transform="translate(10 14)"
          />

          {/* main tooth */}
          <path d={TOOTH_D} fill="url(#toothFill)" stroke="#cdbca1" strokeWidth="2" />

          {/* glossy highlight */}
          <path
            d={GLOSS_D}
            fill="url(#toothGlow)"
          />

          {/* personality: eyes + smile */}
          <g fill="#0d0a08">
            <circle cx="72" cy="112" r="7.5" />
            <circle cx="128" cy="112" r="7.5" />
            <motion.path
              d="M 58 150 C 78 174, 122 174, 142 150"
              stroke="#0d0a08"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={reduce ? { pathLength: 1 } : { pathLength: [0.15, 1, 0.85, 1] }}
              transition={{
                duration: 2.4,
                delay: 1,
                ease: "easeInOut",
              }}
            />
          </g>
        </svg>

        {/* floating sparkles */}
        <motion.span
          aria-hidden
          className="absolute -right-2 top-4 text-ochre"
          animate={reduce ? undefined : { rotate: [0, 20, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ✦
        </motion.span>
      </motion.div>
    </div>
  );
}

const TOOTH_D =
  "M 28 96 C 28 50 64 28 100 28 C 136 28 172 50 172 96 C 172 150 150 216 140 238 C 136 247 117 245 105 235 C 99 228 90 232 84 236 C 76 247 63 247 60 238 C 50 216 28 150 28 96 Z";

const GLOSS_D =
  "M 62 78 C 62 60 78 48 94 48 C 96 62 96 80 92 100 C 76 100 62 92 62 78 Z";
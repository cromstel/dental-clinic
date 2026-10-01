"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { transformations, transformationDisclaimer } from "@/content/accra";
import { cn, swatch } from "@/lib/utils";
import { springSmileTransform } from "@/lib/motion";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export function SmileTransformation() {
  return (
    <section className="bg-bone py-24 lg:py-32" id="results">
      <div className="container-custom px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cocoa/70">
              Smile Transformations
            </p>
            <h2 className="mt-4 max-w-xl font-display text-5xl font-bold leading-[0.95] tracking-tight text-cocoa sm:text-6xl">
              A smile upgrade,{" "}
              <span className="text-ochre-ink">in one appointment.</span>
            </h2>
          </div>
          <p className="max-w-sm text-cocoa/70">
            Slide to compare before and after. Photos shown for
            illustrative purposes.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {transformations.map((t, i) => (
            <BeforeAfter key={t.label} className={cn(i === 0 && "lg:col-span-1")} t={t} />
          ))}
        </div>

        <p className="mt-6 text-sm text-cocoa/70">{transformationDisclaimer}</p>
      </div>
    </section>
  );
}

function BeforeAfter({ t, className }: { t: (typeof transformations)[number]; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [pos, setPos] = useState<number | null>(null);
  const px = useMotionValue(50);
  const springX = useSpring(px, springSmileTransform);
  const clipWidth = useMotionTemplate`${springX}%`;

  // Keep React state in sync with the spring, but only while the slider is
  // actively being dragged or keyboard-adjusted (plus a few frames until the
  // spring settles). An unconditional rAF loop re-rendered every card on every
  // frame even when idle — needless main-thread work.
  const draggingRef = useRef(false);
  const rafRef = useRef(0);
  const runningRef = useRef(false);

  const stopSync = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const startSync = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    const sync = () => {
      if (!runningRef.current) return;
      setPos(springX.get());
      if (!draggingRef.current && Math.abs(springX.get() - px.get()) < 0.5) {
        // Idle and the spring has settled — stop looping.
        runningRef.current = false;
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(sync);
    };
    rafRef.current = requestAnimationFrame(sync);
  }, [springX, px]);

  useEffect(() => stopSync, [stopSync]);

  // Measure once at drag start instead of re-reading layout on every
  // pointermove — the element doesn't move/resize mid-drag, so the cached
  // rect stays valid and we avoid forced reflows while dragging.
  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = rectRef.current;
      if (!rect) return;
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      px.set(Math.min(100, Math.max(0, pct)));
    },
    [px]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (reduce) return;
      const step = 5;
      let newPos = pos ?? 50;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        newPos = Math.max(0, newPos - step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        newPos = Math.min(100, newPos + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        newPos = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        newPos = 100;
      } else {
        return;
      }
      setPos(newPos);
      px.set(newPos);
      startSync();
    },
    [pos, px, reduce, startSync]
  );

  // Invalidate cached rect if the layout changes between drags.
  useEffect(() => {
    const onResize = () => {
      rectRef.current = null;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={cn("group", className)}>
      <Link href="/contact">
        <h3 className="flex items-baseline justify-between gap-4 font-display text-2xl font-semibold tracking-tight text-cocoa sm:text-3xl">
          <span>{t.label}</span>
          <span className="text-sm font-normal text-cocoa/70">{t.detail}</span>
        </h3>
      </Link>

      <div
        ref={ref}
        onPointerMove={reduce || pos === null ? undefined : handlePointer}
        onPointerDown={(e) => {
          if (reduce) return;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          rectRef.current = ref.current?.getBoundingClientRect() ?? null;
          handlePointer(e);
          setPos(px.get());
          draggingRef.current = true;
          startSync();
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        onTouchMove={(e) => {
          // Allow vertical scrolling while dragging horizontally
          if (reduce) return;
          const touch = e.touches[0];
          if (!touch) return;
          // Only prevent default if horizontal movement is significant
          if (Math.abs(touch.clientX - (pos ?? 50)) > 10) {
            e.preventDefault();
          }
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label={`${t.label} before and after comparison`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos ?? 50)}
        aria-orientation="horizontal"
        className={cn("relative mt-5 aspect-[4/3] w-full select-none overflow-hidden rounded-3xl bg-cocoa", className)}
        style={{ touchAction: "pan-x pan-y" }}
      >
        <div className={cn("absolute inset-0", swatch(t.color))} />
        <OptimizedImage
          src={t.after}
          alt={`${t.label} after`}
          fill
          widths={[400, 800, 1200]}
          sizes="(min-width:1024px) 46vw, 92vw"
          className="object-cover"
        />
        <div className="absolute inset-0 overflow-hidden">
          <motion.div style={reduce ? undefined : { width: clipWidth }} className="absolute inset-y-0 left-0 w-1/2">
            <OptimizedImage
              src={t.before}
              alt={`${t.label} before`}
              fill
              widths={[400, 800]}
              sizes="(min-width:1024px) 23vw, 46vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        <motion.div
          style={reduce ? undefined : { left: clipWidth }}
          className="absolute inset-y-0 z-10 w-px bg-bone/90"
          aria-hidden
        />
        <motion.span
          style={reduce ? undefined : { left: clipWidth }}
          className="absolute top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bone text-cocoa shadow-pop"
          aria-hidden
        >
          <MoveHorizontal className="h-5 w-5" aria-hidden />
        </motion.span>

        <span className="absolute left-4 top-4 z-10 rounded-full bg-cocoa/70 px-3 py-1 text-xs font-medium uppercase tracking-widest text-bone backdrop-blur">
          Before
        </span>
        <span className="absolute right-4 top-4 z-10 rounded-full bg-ochre px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cocoa">
          After
        </span>
      </div>
    </div>
  );
}
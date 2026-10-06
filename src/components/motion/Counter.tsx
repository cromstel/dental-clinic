"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type CounterProps = {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: CounterProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (reduce) {
      setVal(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration]);

  // Market locale, not `en-US`. The output happens to be identical today — en-GH
  // and en-US share the same group and decimal separators — so this is a
  // statement of intent rather than a visible fix. It is worth correcting
  // because `en-US` is a leftover from the previous practice and a hardcoded
  // locale is exactly the sort of thing that survives a rebrand unnoticed.
  const format = (n: number) =>
    n.toLocaleString("en-GH", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const animated = format(val);
  const settled = format(to);

  // The count-up is decoration. It is hidden from assistive technology and the
  // settled value is announced once instead.
  //
  // This used to render as bare text nodes, so the accessibility tree carried
  // every intermediate frame — the stats band read as "0" "1" " / 0" "4", i.e.
  // individual digits announced as they were recomputed about sixty times a
  // second, never once presenting a number a visitor could use. A counter is a
  // number in a sentence; a screen reader needs the number, not the animation.
  //
  // `useReducedMotion` already snapped to the final value above, but that only
  // helps visitors who have asked for reduced motion. This helps everyone else,
  // and it is the same pattern `SplitText` uses for the hero heading: the whole
  // string once in `sr-only`, the animated copy `aria-hidden`.
  //
  // The ref stays on the outer span because `useInView` measures the element that
  // occupies layout, not the decorative copy nested inside it.
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {prefix}
        {settled}
        {suffix}
      </span>
      <span aria-hidden="true">
        {prefix}
        {animated}
        {suffix}
      </span>
    </span>
  );
}

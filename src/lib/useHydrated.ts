"use client";

import { useEffect, useState } from "react";

/**
 * `false` during SSR and on the first client render, `true` from the next tick.
 *
 * Why this exists: `useReducedMotion()` (motion) reads `matchMedia`
 * synchronously, so it returns `false` on the server but `true` on the very
 * first client render for a visitor who prefers reduced motion. Any component
 * that branches its *markup* on that flag therefore renders one tree on the
 * server and a different tree on the client, which trips React's hydration
 * check (error #418) and forces a full client re-render of the subtree.
 *
 * Gating the flag on this hook keeps the first client render byte-identical to
 * the server output; the reduced-motion tree is swapped in on the following
 * tick, which is imperceptible (and `MotionConfig reducedMotion="user"` in
 * MotionProvider already suppresses transform animations in the meantime).
 *
 * Apply it only where the flag changes the DOM — animation-only differences
 * (`initial`/`animate` props) do not need it.
 *
 *     const hydrated = useHydrated();
 *     const reduce = useReducedMotion() && hydrated;
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}

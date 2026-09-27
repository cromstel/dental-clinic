"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { Cta } from "@/components/ui/Cta";

/** Fixed "Book" pill that swaps the header CTA to keep booking reachable. */
export function FloatingCta() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [300, 600], [0, 1]);
  const y = useTransform(scrollY, [300, 600], [24, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 sm:hidden"
    >
      <Cta href="/contact" variant="lime" arrow={false}>
        Book appointment
      </Cta>
    </motion.div>
  );
}
"use client";

import { motion, useReducedMotion } from "motion/react";
import { marquee } from "@/content/site";
import { Marquee } from "@/components/motion/Marquee";

export function MarqueeBand() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: reduce ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8 }}
      className="border-y border-ink/10 bg-lime py-8 lg:py-12"
      aria-label="Services"
    >
      <Marquee
        items={marquee}
        outline
        itemClassName="text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight text-ink"
        separator="✦"
      />
    </motion.section>
  );
}
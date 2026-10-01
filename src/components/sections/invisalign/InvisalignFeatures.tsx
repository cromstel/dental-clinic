"use client";

import { motion, useReducedMotion } from "motion/react";
import { ScanLine, Sparkles, CircleGauge, CalendarCheck2 } from "lucide-react";
import { invisalign as inv } from "@/content/accra";

const icons = {
  scan: ScanLine,
  plan: CircleGauge,
  aligner: Sparkles,
  check: CalendarCheck2,
};

/**
 * Chip surfaces, paired with the text tone that clears AA on each.
 *
 * This was a bare array of backgrounds with one hard-coded `text-cocoa` beside
 * it, which is exactly the shape that breaks when the palette changes: the
 * rebrand's codemod mapped the old pastels onto clay and sage without touching
 * the text, leaving cocoa on clay at 2.57:1 and cocoa on sage at 4.32:1. Both
 * render; neither is legible.
 *
 * Pairing them in one object makes the text part of the choice, so a surface
 * cannot be swapped without deciding how it is read. Measured against
 * globals.css: bone-on-clay 5.13:1, cocoa on sage-light 12.71:1, cocoa on bone
 * 16.28:1, ochre-ink on ochre 6.03:1.
 *
 * The sage entry uses `sage-light` rather than `sage`. Sage is a mid-tone that
 * clears neither text family for a 28px glyph (cocoa 4.32:1, bone 3.77:1); the
 * light variant was added for exactly this.
 *
 * The hover text flips with the card, so the hover pairing matters too: the card
 * turns cocoa, so the chip text has to move to the bone family. That is why
 * `hover` is carried alongside `bg` rather than derived.
 */
const CHIPS = [
  { bg: "bg-clay", text: "text-bone-on-clay", hover: "group-hover:text-bone" },
  { bg: "bg-ochre", text: "text-ochre-ink", hover: "group-hover:text-bone" },
  { bg: "bg-sage-light", text: "text-cocoa", hover: "group-hover:text-bone" },
  { bg: "bg-bone", text: "text-cocoa", hover: "group-hover:text-bone" },
] as const;

export function InvisalignFeatures() {
  const reduce = useReducedMotion();
  const items = inv.features.map((f, i) => ({
    ...f,
    icon: Object.values(icons)[i],
    chip: CHIPS[i % CHIPS.length],
  }));

  return (
    <section className="bg-bone py-24 lg:py-32">
      <div className="container-custom px-6 lg:px-10">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl font-display text-4xl font-bold leading-[0.97] tracking-tight text-cocoa sm:text-6xl">
            How it{" "}
            <span className="italic text-ochre-ink">works.</span>
          </h2>
          <p className="max-w-sm text-cocoa/70">
            Four steps between hello and a straighter smile.
          </p>
        </div>

        <motion.ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {items.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.li
                key={f.title}
                variants={{
                  hidden: { opacity: 0, y: 48 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
                }}
                className="group flex flex-col gap-6 rounded-3xl bg-bone p-8 transition-colors duration-300 hover:bg-cocoa"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 ${f.chip.bg} ${f.chip.text} ${f.chip.hover}`}
                >
                  <Icon className="h-7 w-7" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-cocoa/70 tabular-nums transition-colors duration-300 group-hover:text-bone/70">
                    0{i + 1}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold tracking-tight text-cocoa transition-colors duration-300 group-hover:text-bone">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-cocoa/70 transition-colors duration-300 group-hover:text-bone/60">
                    {f.copy}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
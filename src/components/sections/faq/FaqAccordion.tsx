"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { faqs } from "@/content/accra";
import { cn } from "@/lib/utils";

export function FaqAccordion() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number>(0);

  return (
    <section className="bg-bone py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            const btnId = `faq-${i}`;
            const panelId = `faq-answer-${i}`;
            return (
              <div
                key={f.question}
                className={cn(
                  "overflow-hidden rounded-3xl border transition-colors duration-300",
                  isOpen ? "border-cocoa/20 bg-bone" : "border-cocoa/10 bg-bone",
                )}
              >
                <button
                  id={btnId}
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className={cn(
                    "flex w-full items-center justify-between gap-6 px-6 py-6 text-left sm:px-8 sm:py-7",
                    isOpen && "cursor-pointer",
                  )}
                >
                  <span className="flex items-baseline gap-4">
                    {/* /35 was 2.17:1 on bone — the only genuine
                        (non-decorative) contrast failure left on the site. */}
                    <span className="hidden font-display text-sm font-semibold text-cocoa/70 tabular-nums sm:block">
                      0{i + 1}
                    </span>
                    <span className="font-display text-xl font-semibold tracking-tight text-cocoa sm:text-2xl">
                      {f.question}
                    </span>
                  </span>
                  <motion.span
                    animate={reduce ? undefined : { rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xl transition-colors duration-300",
                      isOpen ? "border-cocoa bg-cocoa text-bone" : "border-cocoa/25 text-cocoa",
                    )}
                    aria-hidden
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      initial={reduce ? undefined : { height: 0, opacity: 0 }}
                      animate={reduce ? undefined : { height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-7 text-cocoa/70 sm:px-8 sm:pl-[4.5rem]">
                        {f.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
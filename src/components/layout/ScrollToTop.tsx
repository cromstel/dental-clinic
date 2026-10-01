"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/Magnetic";

/** Scroll to top button that appears after scrolling down */
export function ScrollToTop() {
  const { scrollYProgress } = useScroll();

  // Use scroll progress instead of manual scroll listener
  const opacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const y = useTransform(scrollYProgress, [0.05, 0.15], [24, 0]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      style={{ opacity, y, pointerEvents: "auto" }}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full",
        "bg-cocoa text-bone hover:bg-cocoa transition-colors duration-300",
        "shadow-pop data-cursor=\"hover\"",
      )}
      aria-label="Scroll to top"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          scrollToTop();
        }
      }}
    >
      <Magnetic className="will-change-transform">
        <ArrowUp className="h-5 w-5" aria-hidden />
      </Magnetic>
    </motion.button>
  );
}
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/content/site";
import { swatch, cn } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export function ServicesList() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-cream py-6">
      <div className="container-custom px-6 lg:px-10">
        <motion.ul
          className="border-t border-charcoal/15"
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.1 }}
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        >
          {services.map((s, i) => (
            <motion.li
              key={s.slug}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
              }}
            >
              <Link href="/contact" className="group relative block">
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100",
                    swatch(s.color),
                  )}
                />

                <div className="relative grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 border-b border-charcoal/15 px-1 py-10 md:grid-cols-[5rem_1fr_auto] md:gap-x-10 md:py-14 lg:gap-x-16">
                  <span className="hidden font-display text-sm font-semibold text-charcoal/70 tabular-nums md:block">
                    0{i + 1}
                  </span>

                  <div className="flex flex-col gap-2">
                    <h2 className="font-display text-5xl font-bold tracking-tight text-charcoal transition-colors duration-300 group-hover:text-ink sm:text-6xl lg:text-7xl">
                      {s.title}
                    </h2>
                    <p className="max-w-lg text-charcoal/70 transition-colors duration-300 group-hover:text-charcoal/80">
                      {s.description}
                    </p>
                  </div>

                  <div className="col-start-2 flex items-center justify-between gap-6 md:col-start-3 md:justify-start">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-charcoal/25 transition-all duration-300 group-hover:rotate-45 group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-cream">
                      <ArrowUpRight className="h-6 w-6" aria-hidden />
                    </span>
                    <div className="relative h-24 w-[7.5rem] overflow-hidden rounded-2xl md:hidden">
                      <ServiceThumb src={s.image} title={s.title} />
                    </div>
                  </div>

                  <div className="absolute right-0 top-1/2 hidden h-56 w-44 -translate-y-1/2 translate-x-10 overflow-hidden rounded-[1.5rem] opacity-0 shadow-pop transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100 md:block">
                    <ServiceThumb src={s.image} title={s.title} />
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

function ServiceThumb({ src, title }: { src: string; title: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={`${title} placeholder`}
      fill
      widths={[400]}
      sizes="(max-width:768px) 12rem, 11rem"
      className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
    />
  );
}
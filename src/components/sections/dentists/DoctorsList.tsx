"use client";

import { motion, useReducedMotion } from "motion/react";
import { doctors } from "@/content/accra";
import { cn, swatch } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export function DoctorsList() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-bone pb-24">
      <div className="container-custom px-6 lg:px-10">
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          initial={reduce ? undefined : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        >
          {doctors.map((doc) => (
            <motion.article
              key={doc.slug}
              variants={{
                hidden: { opacity: 0, y: 56 },
                show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
              }}
              className={cn(
                "group relative flex flex-col justify-end overflow-hidden rounded-[2.5rem] p-8 sm:p-10 lg:min-h-[42rem]",
                swatch(doc.color),
              )}
            >
              <div className="relative mx-auto mb-10 aspect-[4/5] w-full max-h-[26rem] max-w-sm overflow-hidden rounded-[2rem]">
                <OptimizedImage
                  src={doc.image}
                  alt={`${doc.name} — ${doc.role}`}
                  fill
                  widths={[400, 800]}
                  sizes="(min-width:1024px) 24vw, 92vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
                <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-cocoa backdrop-blur">
                  {doc.note}
                </span>
              </div>

              <div>
                <h2 className="font-display text-4xl font-bold tracking-tight text-cocoa sm:text-6xl">
                  {doc.name}
                </h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-cocoa/70">
                  {doc.role}
                </p>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-cocoa/75">
                  {doc.bio}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {doc.specialties.map((sp) => (
                    <li
                      key={sp}
                      className="rounded-full border border-cocoa/20 px-3 py-1 text-sm text-cocoa/70"
                    >
                      {sp}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import { Reveal } from "@/components/motion/Reveal";
import { Cta } from "@/components/ui/Cta";
import { insurance } from "@/content/site";

export function InsuranceBand() {
  return (
    <section className="bg-charcoal py-24 text-cream lg:py-32">
      <div className="container-custom px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <h2 className="max-w-md font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
              {insurance.headline.split(" ").map((w, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? "text-limedeep" : undefined}>
                  {w}{" "}
                </span>
              ))}
            </h2>
          </Reveal>

          <div className="flex flex-col justify-between gap-10">
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-cream/70">
                <p>{insurance.primary}</p>
                <p>{insurance.secondary}</p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <Cta href="/contact" variant="cream">
                {insurance.cta}
              </Cta>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
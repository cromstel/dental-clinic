"use client";

import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { SmileGraphic } from "@/components/ui/SmileGraphic";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  index?: string;
  titleLines: string[];
  supporting?: string;
  accentClass?: string;
  chipClass?: string;
};

export function PageHero({
  eyebrow,
  index,
  titleLines,
  supporting,
  accentClass,
  chipClass,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-bone pb-16 pt-40 lg:pb-24 lg:pt-52">
      <div className="container-custom px-6 lg:px-10">
        <div className="flex items-center justify-between">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cocoa/70">
              {eyebrow}
            </p>
          </Reveal>
          {index && (
            <span className="hidden font-display text-sm font-semibold text-cocoa/70 tabular-nums sm:block">
              {index}
            </span>
          )}
        </div>

        <h1 className="mt-10 font-display text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.94] tracking-tight text-cocoa">
          {titleLines.map((line, i) => (
            <span key={i} className="block">
              <SplitText
                as="span"
                text={line}
                delay={0.15 + i * 0.18}
                stagger={0.03}
                className={cn("inline-block align-bottom", i === titleLines.length - 1 && accentClass)}
              />
            </span>
          ))}
        </h1>

        {supporting && (
          <Reveal delay={0.5} className="mt-10">
            <div className="flex max-w-xl items-start gap-5">
              <SmileGraphic className="mt-2 h-6 w-10 shrink-0 text-ochre" animated={false} />
              <p className="text-lg leading-relaxed text-cocoa/70">{supporting}</p>
            </div>
          </Reveal>
        )}
      </div>

      <div aria-hidden className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-clay/30 blur-3xl" />
      {chipClass && (
        <span aria-hidden className="absolute right-[12%] top-[24%] hidden select-none font-display text-5xl font-bold lg:block">
          <span className={cn("inline-block px-6 py-2", chipClass)}>✦</span>
        </span>
      )}
    </section>
  );
}
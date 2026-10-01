"use client";

import { Counter } from "@/components/motion/Counter";
import { Reveal } from "@/components/motion/Reveal";
import { intro, rating } from "@/content/accra";

const stats = [
  { to: 4.9, decimals: 1, suffix: " / 5", label: "Average patient rating" },
  { to: 2500, decimals: 0, suffix: "+", label: "Smiles cared for" },
];

export function StatBand() {
  return (
    <section className="bg-bone py-20 lg:py-24">
      <div className="container-custom px-6 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2">
          {stats.map((s) => (
            <div key={s.label} className="border-l-2 border-ochre pl-6 sm:pl-10">
              <p className="font-display text-6xl font-bold tracking-tight text-cocoa sm:text-7xl">
                <Counter to={s.to} decimals={s.decimals} />
                <span className="text-ochre-ink">{s.suffix}</span>
              </p>
              <p className="mt-3 text-cocoa/70">{s.label}</p>
            </div>
          ))}
        </div>
        <Reveal className="mt-14">
          <p className="max-w-2xl font-editorial text-lg italic leading-relaxed text-cocoa/70">
            {intro.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
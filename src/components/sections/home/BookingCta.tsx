"use client";

import { bookingCta, site } from "@/content/accra";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Cta } from "@/components/ui/Cta";
import { SmileGraphic } from "@/components/ui/SmileGraphic";

export function BookingCta() {
  return (
    <section className="relative overflow-hidden bg-cocoa py-28 text-bone lg:py-40">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-ochre/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-clay/10 blur-3xl" />
      </div>

      <div className="relative container-custom px-6 lg:px-10">
        <SmileGraphic className="h-10 w-16 text-ochre" color="lime" />

        <Reveal delay={0.1} className="mt-8">
          <h2 className="max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-tight text-bone sm:text-7xl">
            <SplitText
              as="span"
              text="Your next favorite dentist"
              delay={0}
              stagger={0.02}
              wordClassName=""
              className="block text-bone"
            />
            <span className="flex items-center gap-5 text-bone">
              <SplitText as="span" text="is accepting new patients." delay={0.25} stagger={0.02} />
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.25} className="mt-12">
          <p className="max-w-md text-bone/70">
            {site.address.lines[0]} · {site.address.lines[1]} · {site.address.between}
          </p>
        </Reveal>

        <Reveal delay={0.35} className="mt-10 flex flex-wrap gap-4">
          <Cta href="/contact" variant="lime">
            {bookingCta.primary}
          </Cta>
          <Cta href={`tel:${site.phone.tel}`} variant="outline">
            {bookingCta.secondary}
          </Cta>
        </Reveal>
      </div>
    </section>
  );
}
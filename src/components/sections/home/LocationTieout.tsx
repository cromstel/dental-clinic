"use client";

import { MapPin, Phone, ArrowUpRight } from "lucide-react";
import { site, hours } from "@/content/accra";
import { Reveal } from "@/components/motion/Reveal";

export function LocationTieout() {
  return (
    <section className="bg-bone py-24 lg:py-32">
      <div className="container-custom px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cocoa/70">
              Find us in {site.city.split(",")[0]}
            </p>
            <h2 className="mt-6 font-display text-4xl font-bold tracking-tight text-cocoa sm:text-6xl">
              {site.address.lines[0]}
            </h2>
            <div className="mt-8 flex items-start gap-3 text-cocoa/70">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-ochre" aria-hidden />
              <p>
                {site.address.lines[1]}
                <br />
                <span className="text-cocoa/70">{site.address.between}</span>
              </p>
            </div>
            <div className="mt-6 flex gap-4">
              <CtaOutExternal href={site.mapsUrl}>Get Directions</CtaOutExternal>
              <a
                href={`tel:${site.phone.tel}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa underline-offset-4 hover:underline"
              >
                <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-[2rem] border border-cocoa/10 bg-bone p-10 sm:p-12">
              <h3 className="font-display text-xl font-semibold text-cocoa">Studio hours</h3>
              <ul className="mt-8 space-y-5">
                {hours.map((h) => (
                  <li
                    key={h.days}
                    className="flex items-baseline justify-between gap-6 border-b border-cocoa/10 pb-4"
                  >
                    <span className="font-medium text-cocoa/80">{h.days}</span>
                    <span
                      className={
                        h.hours === "Closed"
                          ? "font-semibold text-cocoa/70"
                          : "font-semibold text-cocoa tabular-nums"
                      }
                    >
                      {h.hours}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-cocoa/70">
                Walk-ins welcome, appointments preferred. Book online or give us a call.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CtaOutExternal({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="hover"
      className="group inline-flex items-center gap-2 rounded-full bg-cocoa px-6 py-3 text-sm font-semibold text-bone transition-colors hover:bg-cocoa"
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
    </a>
  );
}
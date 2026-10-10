import type { Metadata } from "next";
import { site } from "@/content/accra";
import { PageHero } from "@/components/sections/shared/PageHero";
import { AlignerVisual } from "@/components/sections/invisalign/AlignerVisual";
import { InvisalignFeatures } from "@/components/sections/invisalign/InvisalignFeatures";
import { Cta } from "@/components/ui/Cta";
import { invisalign } from "@/content/accra";

export const metadata: Metadata = {
  title: "Clear Aligners in Accra | Accra Dental Clinic",
  description:
    "Clear aligner treatment in Accra. A 3D scan instead of a mould, a simulation of the result before you commit, and aligners you remove to eat.",
  alternates: { canonical: "/invisalign" },
  openGraph: {
    title: "Clear Aligners in Accra | Accra Dental Clinic",
    description:
      "Clear aligner treatment in Accra. A 3D scan instead of a mould, a simulation of the result before you commit, and aligners you remove to eat.",
    url: "/invisalign",
    images: [
      {
        url: "/images/services/invisalign.avif",
        width: 1200,
        height: 900,
        alt: `${site.fullName} — Clear aligners in Accra`,
      },
    ],
  },
};

export default function InvisalignPage() {
  return (
    <>
      <PageHero
        eyebrow="Invisalign"
        index="03 — Invisalign"
        titleLines={invisalign.titleLines}
        supporting={invisalign.body}
        accentClass="text-outline"
        chipClass="bg-ochre text-ochre-ink"
      />

      <section className="bg-bone pb-24">
        <AlignerVisual />
      </section>

      <section className="bg-cocoa py-16 text-bone lg:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="font-editorial text-xl italic leading-relaxed text-bone/80">
            "The scan is the first real look at your own teeth you've had in years.
            We show you the result before anything is committed."
          </p>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.25em] text-bone/60">
            Dr. Ama Serwaa Boateng — Principal Dentist
          </p>
        </div>
      </section>

      <InvisalignFeatures />

      <section className="border-t border-cocoa/10 bg-bone py-20 text-center">
        <p className="mx-auto max-w-2xl px-6 font-display text-3xl font-semibold leading-tight tracking-tight text-cocoa sm:text-4xl">
          Straight teeth, your schedule.{" "}
          <span className="text-ochre-ink">Start with a free scan.</span>
        </p>
        <div className="mt-10 flex justify-center">
          <Cta href="/contact">{invisalign.cta}</Cta>
        </div>
      </section>
    </>
  );
}
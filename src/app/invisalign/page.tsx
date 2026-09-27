import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHero } from "@/components/sections/shared/PageHero";
import { AlignerVisual } from "@/components/sections/invisalign/AlignerVisual";
import { InvisalignFeatures } from "@/components/sections/invisalign/InvisalignFeatures";
import { Cta } from "@/components/ui/Cta";
import { invisalign } from "@/content/site";

export const metadata: Metadata = {
  title: "Invisalign in Manhattan, NYC | CITGROUP Dental Studio",
  description:
    "Clear aligner treatment in Manhattan. Digital smile scans, personalized Invisalign plans, and progress check-ins at CITGROUP Dental Studio.",
  alternates: { canonical: "/invisalign" },
  openGraph: {
    title: "Invisalign in Manhattan, NYC | CITGROUP Dental Studio",
    description: site.description,
    url: "/invisalign",
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
        chipClass="bg-limedeep text-ink"
      />

      <section className="bg-cream pb-24">
        <AlignerVisual />
      </section>

      <InvisalignFeatures />

      <section className="border-t border-charcoal/10 bg-paper py-20 text-center">
        <p className="mx-auto max-w-2xl px-6 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          Straight teeth, your schedule.{" "}
          <span className="text-limeleaf">Start with a free scan.</span>
        </p>
        <div className="mt-10 flex justify-center">
          <Cta href="/contact">{invisalign.cta}</Cta>
        </div>
      </section>
    </>
  );
}
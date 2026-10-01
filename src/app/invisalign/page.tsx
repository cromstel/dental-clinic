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
        chipClass="bg-ochre text-ochre-ink"
      />

      <section className="bg-bone pb-24">
        <AlignerVisual />
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
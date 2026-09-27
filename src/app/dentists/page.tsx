import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHero } from "@/components/sections/shared/PageHero";
import { DoctorsList } from "@/components/sections/dentists/DoctorsList";
import { InsuranceBand } from "@/components/sections/services/InsuranceBand";

export const metadata: Metadata = {
  title: "Our Dentists in Manhattan, NYC | CITGROUP Dental Studio",
  description:
    "Meet the dentists at CITGROUP Dental Studio in Manhattan — cosmetic, restorative, general, and implant dentistry in the heart of NYC.",
  alternates: { canonical: "/dentists" },
  openGraph: {
    title: "Our Dentists in Manhattan, NYC | CITGROUP Dental Studio",
    description: site.description,
    url: "/dentists",
  },
};

export default function DentistsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Team"
        index="04 — Dentists"
        titleLines={["Meet the", "dentists."]}
        supporting="Two dentists, one shared approach: listen first, explain clearly, and treat you like a person."
        accentClass="text-limeleaf"
        chipClass="bg-mint text-ink"
      />
      <DoctorsList />
      <InsuranceBand />
    </>
  );
}
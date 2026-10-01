import type { Metadata } from "next";
import { site } from "@/content/accra";
import { PageHero } from "@/components/sections/shared/PageHero";
import { DoctorsList } from "@/components/sections/dentists/DoctorsList";
import { InsuranceBand } from "@/components/sections/services/InsuranceBand";

export const metadata: Metadata = {
  title: "Our Dentists in Osu, Accra | Accra Dental Atelier",
  description:
    "Meet the clinicians at Accra Dental Atelier — cosmetic, restorative and implant dentistry, plus routine oral health.",
  alternates: { canonical: "/dentists" },
  openGraph: {
    title: "Our Dentists in Osu, Accra | Accra Dental Atelier",
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
        accentClass="text-ochre-ink"
        chipClass="bg-sage text-cocoa"
      />
      <DoctorsList />
      <InsuranceBand />
    </>
  );
}
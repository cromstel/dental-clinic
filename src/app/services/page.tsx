import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHero } from "@/components/sections/shared/PageHero";
import { ServicesList } from "@/components/sections/services/ServicesList";
import { SmileTransformation } from "@/components/sections/services/SmileTransformation";
import { WhiteningBand } from "@/components/sections/services/WhiteningBand";
import { InsuranceBand } from "@/components/sections/services/InsuranceBand";

export const metadata: Metadata = {
  title: "Dental Services in Manhattan, NYC | CITGROUP Dental Studio",
  description:
    "Cosmetic dentistry, Invisalign, veneers, whitening, implants, preventive, restorative, and emergency dentistry at CITGROUP Dental Studio in Chelsea, Manhattan.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Dental Services in Manhattan, NYC | CITGROUP Dental Studio",
    description: site.description,
    url: "/services",
  },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        index="02 — Services"
        titleLines={["Treatments,", "not transactions."]}
        supporting="Eight ways we help you feel good about your smile — explained clearly, delivered comfortably, and planned around your life."
        accentClass="text-limeleaf"
        chipClass="bg-lime text-ink"
      />
      <ServicesList />
      <SmileTransformation />
      <WhiteningBand />
      <InsuranceBand />
    </>
  );
}
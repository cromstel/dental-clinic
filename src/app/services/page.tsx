import type { Metadata } from "next";
import { site } from "@/content/accra";
import { PageHero } from "@/components/sections/shared/PageHero";
import { ServicesList } from "@/components/sections/services/ServicesList";
import { SmileTransformation } from "@/components/sections/services/SmileTransformation";
import { WhiteningBand } from "@/components/sections/services/WhiteningBand";
import { InsuranceBand } from "@/components/sections/services/InsuranceBand";

export const metadata: Metadata = {
  title: "Treatments in Osu, Accra | Accra Dental Atelier",
  description:
    "Cosmetic dentistry, clear aligners, porcelain veneers, whitening, implants, preventive and restorative care at our studio in Osu, Accra.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Treatments in Osu, Accra | Accra Dental Atelier",
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
        accentClass="text-ochre-ink"
        chipClass="bg-ochre text-cocoa"
      />
      <ServicesList />
      <SmileTransformation />
      <WhiteningBand />
      <InsuranceBand />
    </>
  );
}
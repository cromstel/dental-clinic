import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHero } from "@/components/sections/shared/PageHero";
import { PatientJourney } from "@/components/sections/about/PatientJourney";
import { Manifesto } from "@/components/sections/about/Manifesto";
import { StatBand } from "@/components/sections/about/StatBand";
import { LocationTieout } from "@/components/sections/home/LocationTieout";
import { BookingCta } from "@/components/sections/home/BookingCta";

export const metadata: Metadata = {
  title: "About CITGROUP Dental Studio | Dentist in Chelsea, Manhattan",
  description:
    "A modern dental studio in Manhattan. Thoughtful care, transparent pricing, digital technology, and appointments designed around real life.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About CITGROUP Dental Studio | Dentist in Chelsea, Manhattan",
    description: site.description,
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        index="05 — About"
        titleLines={["The dentist,", "redesigned."]}
        supporting="A more relaxed studio experience in the middle of Manhattan — with the technology and expertise you'd expect."
        accentClass="text-outline"
        chipClass="bg-peach text-ink"
      />
      <Manifesto />
      <StatBand />
      <PatientJourney />
      <LocationTieout />
      <BookingCta />
    </>
  );
}
import type { Metadata } from "next";
import { site } from "@/content/accra";
import { PageHero } from "@/components/sections/shared/PageHero";
import { PatientJourney } from "@/components/sections/about/PatientJourney";
import { Manifesto } from "@/components/sections/about/Manifesto";
import { StatBand } from "@/components/sections/about/StatBand";
import { LocationTieout } from "@/components/sections/home/LocationTieout";
import { BookingCta } from "@/components/sections/home/BookingCta";

export const metadata: Metadata = {
  title: "About Accra Dental Clinic | A private studio in Osu, Accra",
  description:
    "A private dental studio on Boundary Road in Osu, Accra. Unhurried appointments, fixed quotes, and a plan you understand before anything begins.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Accra Dental Clinic | A private studio in Osu, Accra",
    description:
      "A private dental studio on Boundary Road in Osu, Accra. Unhurried appointments, fixed quotes, and a plan you understand before anything begins.",
    url: "/about",
    images: [
      {
        url: "/images/doctors/ama-serwaa-boateng.avif",
        width: 800,
        height: 1000,
        alt: `${site.fullName} — The studio in Osu, Accra`,
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        index="05 — About"
        titleLines={["The dentist,", "redesigned."]}
        supporting="A quieter kind of dentistry in Osu — with the technology and expertise you'd expect."
        accentClass="text-outline"
        chipClass="bg-clay text-bone-on-clay"
      />
      <Manifesto />
      <StatBand />
      <PatientJourney />
      <LocationTieout />
      <BookingCta />
    </>
  );
}
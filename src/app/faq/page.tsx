import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHero } from "@/components/sections/shared/PageHero";
import { FaqAccordion } from "@/components/sections/faq/FaqAccordion";
import { BookingCta } from "@/components/sections/home/BookingCta";

export const metadata: Metadata = {
  title: "FAQ | CITGROUP Dental Studio, Manhattan",
  description:
    "Answers about new patients, PPO dental insurance, emergency appointments, whitening, Invisalign consultations, and where to find us in Manhattan.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | CITGROUP Dental Studio, Manhattan",
    description: site.description,
    url: "/faq",
  },
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        index="06 — FAQ"
        titleLines={["Questions,", "answered."]}
        supporting="Everything people usually ask before their first visit. Anything else — just call or email the studio."
        accentClass="text-limeleaf"
        chipClass="bg-butter text-ink"
      />
      <FaqAccordion />
      <BookingCta />
    </>
  );
}
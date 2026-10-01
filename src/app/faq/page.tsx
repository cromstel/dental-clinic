import type { Metadata } from "next";
import { site } from "@/content/accra";
import { PageHero } from "@/components/sections/shared/PageHero";
import { FaqAccordion } from "@/components/sections/faq/FaqAccordion";
import { BookingCta } from "@/components/sections/home/BookingCta";

export const metadata: Metadata = {
  title: "Questions | Accra Dental Atelier, Osu, Accra",
  description:
    "Answers about new patients, health insurance, emergency appointments, whitening, clear aligners, and where to find us in Osu, Accra.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Questions | Accra Dental Atelier, Osu, Accra",
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
        accentClass="text-ochre-ink"
        chipClass="bg-bone text-cocoa"
      />
      <FaqAccordion />
      <BookingCta />
    </>
  );
}
import type { Metadata } from "next";
import { site, faqs } from "@/content/accra";
import { PageHero } from "@/components/sections/shared/PageHero";
import { FaqAccordion } from "@/components/sections/faq/FaqAccordion";
import { BookingCta } from "@/components/sections/home/BookingCta";

export const metadata: Metadata = {
  title: "Questions | Accra Dental Clinic, Osu, Accra",
  description:
    "Answers about new patients, health insurance, emergency appointments, whitening, clear aligners, and where to find us in Osu, Accra.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Questions | Accra Dental Clinic, Osu, Accra",
    description:
      "Answers about new patients, health insurance, emergency appointments, whitening, clear aligners, and where to find us in Osu, Accra.",
    url: "/faq",
    images: [
      {
        url: "/images/doctors/ama-serwaa-boateng.avif",
        width: 800,
        height: 1000,
        alt: `${site.fullName} — Frequently asked questions`,
      },
    ],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
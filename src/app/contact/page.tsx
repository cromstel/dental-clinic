import type { Metadata } from "next";
import { site } from "@/content/site";
import { PageHero } from "@/components/sections/shared/PageHero";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { ContactDetails } from "@/components/sections/contact/ContactDetails";

export const metadata: Metadata = {
  title: "Contact & Book | CITGROUP Dental Studio, Manhattan",
  description:
    "Book an appointment at CITGROUP Dental Studio in Manhattan. Call, email, or send an appointment enquiry from this page.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact & Book | CITGROUP Dental Studio, Manhattan",
    description: site.description,
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        index="07 — Contact"
        titleLines={["Say", "hello."]}
        supporting="Book online below, call the studio, or send an email — whatever feels easiest."
        accentClass="text-limeleaf"
        chipClass="bg-lime text-ink"
      />

      <section className="bg-cream pb-28">
        <div className="container-custom grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <ContactForm />
          <ContactDetails />
        </div>
      </section>
    </>
  );
}
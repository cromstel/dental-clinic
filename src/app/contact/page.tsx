import type { Metadata } from "next";
import { site } from "@/content/accra";
import { PageHero } from "@/components/sections/shared/PageHero";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { ContactDetails } from "@/components/sections/contact/ContactDetails";

export const metadata: Metadata = {
  title: "Contact & Book | Accra Dental Atelier, Osu, Accra",
  description:
    "Request an appointment at Accra Dental Atelier in Osu, Accra. Call the studio, or send an enquiry and we will reply within a working day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact & Book | Accra Dental Atelier, Osu, Accra",
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
        accentClass="text-ochre-ink"
        chipClass="bg-ochre text-cocoa"
      />

      <section className="bg-bone pb-28">
        <div className="container-custom grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <ContactForm />
          <ContactDetails />
        </div>
      </section>
    </>
  );
}
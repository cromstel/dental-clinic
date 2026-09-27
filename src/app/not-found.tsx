import Link from "next/link";
import { Cta } from "@/components/ui/Cta";
import { SmileGraphic } from "@/components/ui/SmileGraphic";
import { site } from "@/content/site";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-cream px-6">
      <div className="mx-auto max-w-md text-center">
        <SmileGraphic className="mx-auto mb-6 h-16 w-24 text-charcoal/30" animated={false} />
        <h1 className="font-display text-8xl font-bold tracking-tight text-charcoal/50">404</h1>
        <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
          Page not found
        </h2>
        <p className="mt-4 text-charcoal/70">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved
          or doesn&apos;t exist.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Cta href="/" variant="lime">
            Back home
          </Cta>
          <Cta href="/contact" variant="outline">
            Contact us
          </Cta>
        </div>
      </div>
    </section>
  );
}
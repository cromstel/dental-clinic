import Link from "next/link";
import { ArrowUpRight, Share, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { footer, footerLinks, site, socials, hours } from "@/content/accra";
import { SmileGraphic } from "@/components/ui/SmileGraphic";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-cocoa text-bone">
      <div className="container-custom py-20 lg:pb-10 lg:pt-28">
        <div className="flex flex-col gap-16 lg:flex-row lg:justify-between lg:gap-10">
          <div className="max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-bone/60">
              {site.fullName}
            </p>
            <h2 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight text-bone sm:text-7xl">
              <SmileGraphic className="mb-4 h-8 w-14 text-ochre" color="lime" />
              {footer.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-6 max-w-sm text-bone/70">{site.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-bone/50">
                Explore
              </h3>
              <ul className="mt-5 space-y-3">
                {footerLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-bone/80 transition-colors hover:text-ochre"
                    >
                      {l.label}
                      <ArrowUpRight
                        className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-bone/50">
                Visit
              </h3>
              <address className="mt-5 space-y-3 not-italic text-bone/80">
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 transition-colors hover:text-ochre"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span className="block">
                    {site.address.lines[0]}
                    <br />
                    {site.address.lines[1]}
                    <br />
                    <span className="text-bone/50">{site.address.between}</span>
                  </span>
                </a>
                <ul className="border-t border-bone/10 pt-3 text-bone/70">
                  {hours.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4 text-sm">
                      <span>{h.days}</span>
                      <span>{h.hours}</span>
                    </li>
                  ))}
                </ul>
              </address>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-bone/50">
                Say hi
              </h3>
              <ul className="mt-5 space-y-3 text-bone/80">
                <li>
                  <a
                    href={`tel:${site.phone.tel}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-ochre"
                  >
                    <Phone className="h-4 w-4" aria-hidden /> {site.phone.display}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="inline-block break-all py-1 transition-colors hover:text-ochre"
                  >
                    {site.email}
                  </a>
                </li>
              </ul>
              <div className="mt-6 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${site.name} on ${s.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-bone/20 transition-all hover:border-ochre hover:text-ochre"
                  >
                    {s.name === "Instagram" ? (
                      <Share className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{s.handle.replace("@", "").slice(0, 3)}</span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-20 flex flex-col items-start justify-between gap-3 border-t border-bone/10 pt-6 text-sm text-bone/50 sm:flex-row",
          )}
        >
          <p>© {new Date().getFullYear()} {site.fullName}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Follow along <Share className="h-3.5 w-3.5" aria-hidden />
          </p>
        </div>
      </div>
    </footer>
  );
}
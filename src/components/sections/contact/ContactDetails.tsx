import { Phone, Mail, MapPin } from "lucide-react";
import { hours, site, socials } from "@/content/accra";
import { formatPhoneLink } from "@/lib/utils";

export function ContactDetails() {
  return (
    <aside className="flex flex-col justify-between gap-12">
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-cocoa sm:text-4xl">
            Visit the studio
          </h2>
          <p className="mt-3 text-cocoa/70">{site.address.between}</p>
        </div>

        <ul className="space-y-8">
          <li>
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cocoa/70">
              <MapPin className="h-4 w-4" aria-hidden /> Address
            </span>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="mt-2 block font-display text-2xl font-semibold leading-tight tracking-tight text-cocoa underline decoration-ochre decoration-2 underline-offset-4"
            >
              {site.address.lines[0]}
              <br />
              {site.address.lines[1]}
            </a>
          </li>

          <li>
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cocoa/70">
              <Phone className="h-4 w-4" aria-hidden /> Call or text
            </span>
            <a
              href={formatPhoneLink(site.phone.tel)}
              data-cursor="hover"
              className="mt-2 block font-display text-2xl font-semibold tracking-tight text-cocoa transition-colors hover:text-ochre"
            >
              {site.phone.display}
            </a>
          </li>

          <li>
            <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cocoa/70">
              <Mail className="h-4 w-4" aria-hidden /> Email
            </span>
            <a
              href={`mailto:${site.email}`}
              data-cursor="hover"
              className="mt-2 block font-display text-2xl font-semibold tracking-tight text-cocoa transition-colors hover:text-ochre"
            >
              {site.email}
            </a>
          </li>
        </ul>
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cocoa/70">Hours</p>
        <dl className="mt-4 divide-y divide-cocoa/10 border-y border-cocoa/10">
          {hours.map((row) => (
            <div key={row.days} className="flex items-center justify-between gap-6 py-3">
              <dt className="text-cocoa/70">{row.days}</dt>
              <dd className="font-medium text-cocoa">{row.hours}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="rounded-full border border-cocoa/20 px-4 py-2 text-sm text-cocoa/70 transition-colors duration-300 hover:border-cocoa hover:bg-cocoa hover:text-bone"
            >
              {s.handle}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
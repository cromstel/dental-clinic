"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { contactForm, site } from "@/content/site";
import { cn, toMailto } from "@/lib/utils";

type Fields = {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferred: string;
  message: string;
};

const empty: Fields = {
  name: "",
  email: "",
  phone: "",
  service: contactForm.services[0],
  preferred: "",
  message: "",
};

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [sent, setSent] = useState(false);

  function update(key: keyof Fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setSent(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = `Appointment enquiry — ${fields.service} (${fields.name})`;
    const body = [
      `Name: ${fields.name}`,
      `Email: ${fields.email}`,
      fields.phone && `Phone: ${fields.phone}`,
      `Service: ${fields.service}`,
      fields.preferred && `Preferred time: ${fields.preferred}`,
      "",
      fields.message,
      "",
      // The previous literal named citgroupdental.com, a host this site is not
      // served from, so every enquiry email the practice received carried the
      // wrong source. Read the configured origin instead.
      `-- Sent via ${site.url.replace(/^https?:\/\//, "")}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = toMailto(site.email, subject, body);
    setSent(true);
  }

  const inputCls =
    "w-full rounded-2xl border border-charcoal/15 bg-paper px-5 py-4 text-charcoal placeholder:text-charcoal/35 outline-none transition-colors duration-200 focus:border-charcoal/50 focus:bg-white";

  return (
    <form onSubmit={handleSubmit} className="rounded-[2.5rem] bg-paper p-7 sm:p-10" data-cursor="">
      <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {contactForm.title}
      </h2>
      <p className="mt-3 max-w-md text-charcoal/70">{contactForm.supporting}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-charcoal/70">Name</span>
          <input
            required
            type="text"
            value={fields.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-charcoal/70">Email</span>
          <input
            required
            type="email"
            value={fields.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-charcoal/70">Phone <span className="font-normal text-charcoal/70">(optional)</span></span>
          <input
            type="tel"
            value={fields.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 (___) ___-____"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-charcoal/70">What do you need?</span>
          <span className="relative block">
            <select
              value={fields.service}
              onChange={(e) => update("service", e.target.value)}
              className={cn(inputCls, "appearance-none pr-12")}
            >
              {contactForm.services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/50"
              aria-hidden
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-charcoal/70">Preferred time <span className="font-normal text-charcoal/70">(optional)</span></span>
          <input
            type="text"
            value={fields.preferred}
            onChange={(e) => update("preferred", e.target.value)}
            placeholder="e.g. weekday evenings"
            className={inputCls}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-charcoal/70">Anything else?</span>
          <textarea
            rows={4}
            value={fields.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Tell us about your smile — the more detail, the better."
            className={cn(inputCls, "resize-none")}
          />
        </label>
      </div>

      <button
        type="submit"
        data-cursor="hover"
        className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-9 py-4 text-sm font-semibold tracking-tight text-cream transition-colors duration-300 hover:bg-ink"
      >
        Send enquiry
        <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
      </button>

      <p className="mt-6 max-w-lg text-sm leading-relaxed text-charcoal/70">{contactForm.disclaimer}</p>

      <p aria-live="polite" className={cn("mt-4 text-sm font-medium text-charcoal/70 transition-opacity", sent ? "opacity-100" : "opacity-0")}>
        Opening your email app… We&apos;ll get back to you shortly.
      </p>
    </form>
  );
}
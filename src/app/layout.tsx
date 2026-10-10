import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { site, socials } from "@/content/accra";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { FloatingCta } from "@/components/layout/FloatingCta";
import { ProgressBar } from "@/components/layout/ProgressBar";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { CustomCursor } from "@/components/motion/CustomCursor";
import "./globals.css";

/**
 * Poppins — heading face. Replaces Clash Display for h1–h4 per design direction.
 * Self-hosted woff2, preloaded, weights 500/600/700 (the three the site uses).
 */
const poppins = localFont({
  src: [
    { path: "../assets/fonts/Poppins-500.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/Poppins-600.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/Poppins-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

/**
 * Only 600 and 700 ship. Measured across all seven rendered routes, the display
 * face resolved to exactly those two weights (247 and 107 elements); 400 and 500
 * resolved nowhere. 400's only consumer was a micro-label that had inherited the
 * display face from the h1-h4 base rule and is now explicitly `font-sans`.
 * next/font preloads every weight in `src`, so an unused weight is a wasted
 * request on first paint for all seven pages. The source files stay in
 * `assets/fonts` so this is reversible by adding one line.
 */
const clash = localFont({
  src: [
    { path: "../assets/fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  preload: true,
});

const inter = localFont({
  src: "../assets/fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/**
 * Editorial serif for the cocoa hero. Vendored latin-subset woff2 so the
 * build stays network-independent and the face is self-hosted / preloadable
 * (the previous version pulled it from Google Fonts with a render-blocking
 * stylesheet, which cost FCP/LCP). `Times New Roman` is the right metric
 * fallback override for a serif — the default 'Arial' would mis-measure.
 */
const instrument = localFont({
  src: [
    { path: "../assets/fonts/InstrumentSerif-400.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/InstrumentSerif-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/**
 * Second editorial face, kept as the fallback half of the serif stack. Not
 * preloaded — Instrument Serif is first in the stack and covers the latin
 * range, so this file is only fetched if the primary face is unavailable.
 */
const cormorant = localFont({
  src: [
    { path: "../assets/fonts/CormorantGaramond-var.woff2", weight: "300 600", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  // Must match the host the site is actually served from, otherwise every
  // The origin every canonical / og:url resolves against. Read from site.url
  // rather than repeated inline, and cross-checked at build time against the
  // static copies in public/robots.txt and public/sitemap.xml by
  // scripts/verify-hosts.mjs, so the two cannot silently diverge.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.fullName} | Private dental studio in Osu, Accra`,
    template: `%s | ${site.fullName}`,
  },
  description: site.description,
  // `keywords` removed — Google has ignored this meta tag since 2009. It
  // provides zero ranking signal and only serves as a content hint to
  // competitors. The real keyword work happens in title, description, and
  // on-page copy.
  openGraph: {
    title: `${site.fullName} | Private dental studio in Osu, Accra`,
    description: site.description,
    url: "/",
    siteName: site.fullName,
    // `en_GH`, not `en_US` — the previous value shipped with the old identity.
    locale: "en_GH",
    type: "website",
    images: [
      {
        url: "/images/doctors/ama-serwaa-boateng.avif",
        width: 800,
        height: 1000,
        alt: `${site.fullName} — Dr. Ama Serwaa Boateng, Principal Dentist`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.fullName} | Private dental studio in Osu, Accra`,
    description: site.description,
    images: ["/images/doctors/ama-serwaa-boateng.avif"],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  // Cocoa, matching the base surface, so the browser chrome does not flash a
  // light band before the page paints.
  themeColor: "#14100d",
  // Declared rather than left to the user agent. The site pins its own light
  // surfaces (bone page, cocoa hero), so without this a visitor whose browser is
  // in dark mode gets dark-rendered form controls and scrollbars sitting on a
  // light page — a dark input box on a bone background. The site is light-only
  // by design, so it says so.
  //
  // This belongs in the `viewport` export rather than as a literal <meta> tag:
  // Next routes Viewport fields to the right tag and keeps them out of the
  // serialised metadata object.
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: site.fullName,
  url: `${site.url}/`,
  telephone: site.phone.tel,
  email: site.email,
  description: site.description,
  image: `${site.url}/images/doctors/ama-serwaa-boateng.avif`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.lines[0],
    addressLocality: site.city.split(",")[1]?.trim() || "Accra",
    addressRegion: "Greater Accra",
    addressCountry: "GH",
    postalCode: "",
  },
  geo: {
    "@type": "GeoCoordinates",
    // 18 Boundary Road, Osu, Accra — approximate coordinates
    latitude: 5.5600,
    longitude: -0.1969,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  medicalSpecialty: [
    "Dentistry",
    "Cosmetic Dentistry",
    "Restorative Dentistry",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Dental Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Cosmetic Dentistry" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Clear Aligners" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Porcelain Veneers" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Teeth Whitening" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Dental Implants" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Preventive Care" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Restorative Dentistry" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Emergency Care" },
      },
    ],
  },
  sameAs: socials.map((s) => s.url),
  priceRange: "$$",
  dateModified: "2026-10-10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} ${clash.variable} ${inter.variable} ${instrument.variable} ${cormorant.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ProgressBar />
        <MotionProvider>
          <Nav />
          <ErrorBoundary>
            <main>{children}</main>
          </ErrorBoundary>
          <Footer />
          <FloatingCta />
          <ScrollToTop />
          <CustomCursor />
        </MotionProvider>
      </body>
    </html>
  );
}
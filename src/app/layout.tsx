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

const clash = localFont({
  src: [
    { path: "../assets/fonts/ClashDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
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
 * Editorial serif for the midnight hero. Vendored latin-subset woff2 so the
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
  title: `${site.fullName} | Private dental studio in Osu, Accra`,
  description: site.description,
  keywords: [
    "dentist Accra",
    "dental clinic Osu",
    "Ghana dentistry",
    "cosmetic dentistry",
    "clear aligners Accra",
    "teeth whitening",
    "dental implants",
  ],
  openGraph: {
    title: `${site.fullName} | Private dental studio in Osu, Accra`,
    description: site.description,
    url: "/",
    siteName: site.fullName,
    // `en_GH`, not `en_US` — the previous value shipped with the old identity.
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: site.fullName,
    description: site.description,
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  // Cocoa, matching the base surface, so the browser chrome does not flash a
  // light band before the page paints.
  themeColor: "#14100d",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dentist",
  name: site.fullName,
  url: "/",
  telephone: site.phone.tel,
  email: site.email,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.lines[0],
    addressLocality: "Accra",
    addressRegion: "Greater Accra",
    addressCountry: "GH",
  },
  // Schema.org wants 24h times and this string is machine-read by search
  // engines. It was still the previous practice's New York hours (8-7 weekdays,
  // 9-3 Saturday) after the rebrand; the hours the site actually displays are
  // 8-6 and 9-2. Kept in step with `hours` in content/accra.ts.
  openingHours: "Mo-Fr 08:00-18:00, Sa 09:00-14:00",
  sameAs: socials.map((s) => s.url),
  priceRange: "$$",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${clash.variable} ${inter.variable} ${instrument.variable} ${cormorant.variable}`}
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
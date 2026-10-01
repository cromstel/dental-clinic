export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function toMailto(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatPhoneLink(tel: string): string {
  return `tel:${tel.replace(/[^\d+]/g, "")}`;
}

/**
 * Surface names the content files can ask for.
 *
 * These are deliberately few. A palette that needs a dozen interchangeable
 * pastel backgrounds is how a site ends up looking like a template, so the
 * content layer picks from structural surfaces — cocoa for weight, bone for
 * air, clay for one warm interruption, sage for clinical reassurance — and the
 * components decide how each is used.
 *
 * Each value maps to a token in `globals.css`. Adding a name here without the
 * token behind it silently produces `bg-<name>`, which Tailwind will not emit,
 * so the pair is meant to move together.
 */
export type Swatch =
  | "cocoa"
  | "cocoa-soft"
  | "bone"
  | "clay"
  | "sage"
  | "sage-light"
  | "ink";

const swatchMap: Record<Swatch, string> = {
  cocoa: "bg-cocoa",
  "cocoa-soft": "bg-cocoa-soft",
  bone: "bg-bone",
  clay: "bg-clay",
  sage: "bg-sage",
  "sage-light": "bg-sage-light",
  ink: "bg-ink",
};

/**
 * Text tone per surface.
 *
 * Split rather than derived, because the contrast requirement differs by
 * surface and one value cannot satisfy all of them. `clay` is the case that
 * matters: as a band background it takes the pale bone-on-clay tone (5.13:1),
 * while clay as *text* on bone needs the lighter clay-ink (4.98:1). The single
 * original value measured 4.29:1 in both directions and failed AA twice.
 */
const swatchTextMap: Record<Swatch, string> = {
  cocoa: "text-bone",
  "cocoa-soft": "text-bone",
  bone: "text-cocoa",
  // Clay as text needs the lighter tone: 4.98:1 against the 6.34:1 that plain
  // bone gets, because clay sits closer to bone than to cocoa.
  clay: "text-bone-on-clay",
  // Sage is mid-tone and clears neither family for body copy (cocoa 4.32:1,
  // bone 3.77:1), so content that puts 16px text on sage should be moved to
  // sage-light rather than reaching for a tone here. This default suits the
  // large display word that does use sage.
  sage: "text-bone",
  "sage-light": "text-cocoa",
  ink: "text-bone",
};

export function swatch(color: Swatch | string): string {
  return swatchMap[color as Swatch] ?? `bg-${color}`;
}

export function swatchText(color: Swatch | string): string {
  return swatchTextMap[color as Swatch] ?? `text-${color}`;
}

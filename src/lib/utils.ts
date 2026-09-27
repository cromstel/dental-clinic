export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function toMailto(subject: string, body: string): string {
  return `mailto:${"hello@citgroupdental.com"}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export function formatPhoneLink(tel: string): string {
  return `tel:${tel.replace(/[^\d+]/g, "")}`;
}

export type Swatch =
  | "cream"
  | "paper"
  | "charcoal"
  | "ink"
  | "lime"
  | "limedeep"
  | "lavender"
  | "lavdeep"
  | "peach"
  | "mint"
  | "butter";

const swatchMap: Record<Swatch, string> = {
  cream: "bg-cream",
  paper: "bg-paper",
  charcoal: "bg-charcoal",
  ink: "bg-ink",
  lime: "bg-lime",
  limedeep: "bg-limedeep",
  lavender: "bg-lavender",
  lavdeep: "bg-lavdeep",
  peach: "bg-peach",
  mint: "bg-mint",
  butter: "bg-butter",
};

const swatchTextMap: Record<Swatch, string> = {
  cream: "text-cream",
  paper: "text-paper",
  charcoal: "text-charcoal",
  ink: "text-ink",
  lime: "text-lime",
  limedeep: "text-limedeep",
  lavender: "text-lavender",
  lavdeep: "text-lavdeep",
  peach: "text-peach",
  mint: "text-mint",
  butter: "text-butter",
};

export function swatch(color: Swatch | string): string {
  return swatchMap[color as Swatch] ?? `bg-${color}`;
}

export function swatchText(color: Swatch | string): string {
  return swatchTextMap[color as Swatch] ?? `text-${color}`;
}
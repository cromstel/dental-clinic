import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/Magnetic";

type CtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "lime" | "outline" | "cream" | "gold" | "outline-ochre";
  className?: string;
  external?: boolean;
  arrow?: boolean;
};

const OCHRE_PAIR = "bg-ochre text-cocoa hover:bg-ochre";

const styles = {
  primary: "bg-cocoa text-bone hover:bg-cocoa",
  // Cocoa on ochre is 7.7:1, and the hover state is the same pair, so the
  // measured contrast carries across both states.
  lime: OCHRE_PAIR,
  // An alias, not a second style. `lime` and `gold` were two names for the same
  // colours, with the class string duplicated in both — so a future edit to one
  // would have silently left the other behind, and nothing would report it.
  // `lime` is the surviving name because it has the most call sites. Both are
  // retained because renaming a public prop is a larger change than this fix.
  gold: OCHRE_PAIR,
  outline: "border border-current text-current hover:bg-cocoa hover:text-bone",
  cream: "bg-bone text-cocoa hover:bg-bone",
  "outline-ochre": "border border-ochre text-bone hover:bg-ochre hover:text-cocoa",
};

/**
 * `inline-block` on the anchor is load-bearing, not cosmetic.
 *
 * The padding lives on the inner span, and the anchor is what receives the
 * click. An `inline` anchor's box is its line box — sized by line-height — so it
 * did not grow to contain the child's vertical padding. Measured on production:
 *
 *   painted button   144 x 52   (px-7 py-4)
 *   clickable <a>    144 x 19   (display: inline, zero padding)
 *
 * The anchor's box sat entirely inside the painted pill, leaving 15px above and
 * 17px below it unclickable — 33px of a 52px button, on the site's primary
 * call to action, silently inert. `inline-block` makes the anchor shrink-wrap
 * its child including that child's padding, so the hit area equals the painted
 * area.
 *
 * Inside a flex container this was already fine, because a flex item is
 * blockified. It only broke where the anchor sat in ordinary flow — which is
 * exactly where the header's "Book now" is.
 */
const ANCHOR = "inline-block";

export function Cta({
  href,
  children,
  variant = "primary",
  className,
  external = false,
  arrow = true,
}: CtaProps) {
  const inner = (
    <span
      data-cursor="hover"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold tracking-tight transition-colors duration-300",
        styles[variant],
        className,
      )}
    >
      <span>{children}</span>
      {arrow && (
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden
        />
      )}
    </span>
  );

  const wrapped = <Magnetic>{inner}</Magnetic>;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={ANCHOR}>
        {wrapped}
      </a>
    );
  }
  return (
    <Link href={href} className={ANCHOR}>
      {wrapped}
    </Link>
  );
}

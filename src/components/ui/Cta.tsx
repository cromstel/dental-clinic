import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/motion/Magnetic";

type CtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "lime" | "outline" | "cream" | "gold" | "outline-gold";
  className?: string;
  external?: boolean;
  arrow?: boolean;
};

const styles = {
  primary:
    "bg-charcoal text-cream hover:bg-ink",
  lime: "bg-lime text-ink hover:bg-limedeep",
  outline: "border border-current text-current hover:bg-charcoal hover:text-cream",
  cream: "bg-cream text-charcoal hover:bg-paper",
  // Midnight/gold pair: midnight on gold is 7.7:1, gold-deep hover 6.4:1.
  gold: "bg-gold text-midnight hover:bg-gold-deep",
  "outline-gold":
    "border border-gold text-ivory hover:bg-gold hover:text-midnight",
};

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
      <a href={href} target="_blank" rel="noopener noreferrer">
        {wrapped}
      </a>
    );
  }
  return <Link href={href}>{wrapped}</Link>;
}
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

const styles = {
  primary:
    "bg-cocoa text-bone hover:bg-cocoa",
  lime: "bg-ochre text-cocoa hover:bg-ochre",
  outline: "border border-current text-current hover:bg-cocoa hover:text-bone",
  cream: "bg-bone text-cocoa hover:bg-bone",
  // Midnight/gold pair: midnight on gold is 7.7:1, gold-deep hover 6.4:1.
  gold: "bg-ochre text-cocoa hover:bg-ochre",
  "outline-ochre":
    "border border-ochre text-bone hover:bg-ochre hover:text-cocoa",
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
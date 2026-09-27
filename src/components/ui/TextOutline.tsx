import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/utils";

type TextOutlineProps = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "div";
};

/**
 * Text with outline effect (transparent fill, colored stroke)
 * Used for display headings in Hero and PageHero
 */
export function TextOutline({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  as = "span",
}: TextOutlineProps) {
  return (
    <SplitText
      as={as}
      text={text}
      className={cn("block text-outline text-charcoal", className)}
      delay={delay}
      stagger={stagger}
    />
  );
}
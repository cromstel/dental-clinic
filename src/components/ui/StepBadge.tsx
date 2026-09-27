import { cn } from "@/lib/utils";

type StepBadgeProps = {
  step: string;
  total?: string;
  className?: string;
};

/**
 * Step indicator badge (e.g., "01 / 04")
 */
export function StepBadge({ step, total, className }: StepBadgeProps) {
  return (
    <span className={cn(
      "hidden font-display text-sm font-semibold text-charcoal/70 tabular-nums sm:block",
      className
    )}>
      {step}{total && ` / ${total}`}
    </span>
  );
}
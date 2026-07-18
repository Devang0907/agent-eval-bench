import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-white/[0.1] bg-white/[0.04] text-fog",
        accent: "border-accent/25 bg-accent/[0.12] text-accent-soft",
        good: "border-good/25 bg-good/[0.12] text-good",
        warn: "border-warn/25 bg-warn/[0.12] text-warn",
        bad: "border-bad/25 bg-bad/[0.12] text-bad",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const dotVariants: Record<NonNullable<VariantProps<typeof badgeVariants>["variant"]>, string> = {
  default: "bg-fog/70",
  accent: "bg-accent-soft",
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
};

export function Badge({
  className,
  variant = "default",
  showDot = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants> & {
    showDot?: boolean;
  }) {
  const resolved = variant ?? "default";

  return (
    <div className={cn(badgeVariants({ variant: resolved }), className)} {...props}>
      {showDot ? (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", dotVariants[resolved])}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </div>
  );
}

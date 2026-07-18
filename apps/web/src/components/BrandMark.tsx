import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} translate="no">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={cn("size-5 text-snow", markClassName)}
        fill="none"
      >
        <path
          d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12 7.5v9M8.5 9.75l7 4.5M15.5 9.75l-7 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark ? (
        <span className="font-display text-[15px] font-semibold tracking-tight text-snow">
          Agent Eval Bench
        </span>
      ) : null}
    </span>
  );
}

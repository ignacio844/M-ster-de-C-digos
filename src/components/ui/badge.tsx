import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
  {
    variants: {
      tone: {
        high: "bg-match-high/12 text-match-high",
        mid: "bg-match-mid/12 text-match-mid",
        low: "bg-match-low/12 text-match-low",
        none: "bg-chip text-muted",
        neutral: "bg-chip text-fg",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge, badgeVariants };

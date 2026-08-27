import { matchTone } from "@/lib/matching";
import { cn } from "@/lib/utils";

type MatchBy = "code" | "name" | "none";

interface MatchVisualProps {
  score: number;
  by: MatchBy;
  className?: string;
}

export function MatchPercent({ score, by, className }: MatchVisualProps) {
  const tone = matchTone(score, by);
  const toneColor = `var(--color-match-${tone})`;

  return (
    <span
      className={cn(
        "font-mono text-sm font-medium tabular-nums",
        by === "none" ? "text-subtle" : undefined,
        className,
      )}
      style={by !== "none" ? { color: toneColor } : undefined}
    >
      {by === "none" ? "—" : `${Math.round(score)}%`}
    </span>
  );
}

export function MatchBar({ score, by, className }: MatchVisualProps) {
  const tone = matchTone(score, by);
  const toneColor = `var(--color-match-${tone})`;
  const percentage =
    by === "none" ? 0 : Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-border",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${percentage}%`,
          background:
            by === "none"
              ? "transparent"
              : `linear-gradient(
                  90deg,
                  color-mix(in srgb, ${toneColor} 52%, white) 0%,
                  ${toneColor} 52%,
                  color-mix(in srgb, ${toneColor} 82%, black) 100%
                )`,
        }}
      />
    </div>
  );
}

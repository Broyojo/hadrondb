import { CircleDashed } from "lucide-react";
import { RATING_ICONS } from "@/components/rating-icons";
import { RATINGS, RATING_LIST, type RatingId } from "@/lib/ratings";
import { cn } from "@/lib/utils";


export function RatingBadge({
  rating,
  size = "md",
  className,
}: {
  rating?: RatingId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "gap-1 px-2 py-0.5 text-xs [&>svg]:size-3.5",
    md: "gap-1.5 px-2.5 py-1 text-sm [&>svg]:size-4",
    lg: "gap-2 px-3.5 py-1.5 text-base [&>svg]:size-5",
  }[size];
  if (!rating) {
    return (
      <span
        className={cn("inline-flex items-center rounded-full border border-dashed font-medium text-muted-foreground", sizes, className)}
      >
        <CircleDashed aria-hidden />
        No reports yet
      </span>
    );
  }
  const Icon = RATING_ICONS[rating];
  return (
    <span
      className={cn("inline-flex items-center rounded-full font-semibold whitespace-nowrap", sizes, className)}
      style={{ color: `var(--rating-${rating}-fg)`, backgroundColor: `var(--rating-${rating}-bg)` }}
    >
      <Icon aria-hidden />
      {RATINGS[rating].label}
    </span>
  );
}

/** How a game's reports divide over the ratings, as a bar with a text equivalent. */
export function RatingBar({ counts, total }: { counts: Record<RatingId, number>; total: number }) {
  if (total === 0) return null;
  const parts = RATING_LIST.filter((r) => counts[r.id] > 0);
  const text = parts.map((r) => `${counts[r.id]} ${r.label}`).join(", ");
  return (
    <div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`Reports: ${text}`}>
        {parts.map((r) => (
          <div
            key={r.id}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(counts[r.id] / total) * 100}%`, backgroundColor: `var(--rating-${r.id}-solid)` }}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {parts.map((r) => (
          <li key={r.id} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: `var(--rating-${r.id}-solid)` }} aria-hidden />
            {r.label}: {counts[r.id]}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { RATINGS, RATING_LIST, type RatingId } from "@/lib/ratings";
import { cn } from "@/lib/utils";

/** A square swatch in the rating's colour. */
export function Swatch({ rating, className }: { rating?: RatingId; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0", !rating && "border border-muted-foreground", className)}
      style={rating ? { backgroundColor: `var(--rating-${rating}-solid)` } : undefined}
    />
  );
}

/** Swatch and words. `full` uses the full label ("Runs perfectly"), otherwise the short word. */
export function RatingMark({ rating, full = false, className }: { rating?: RatingId; full?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap", className)}>
      <Swatch rating={rating} />
      {rating ? (
        <span title={full ? undefined : RATINGS[rating].label}>{full ? RATINGS[rating].label : RATINGS[rating].word}</span>
      ) : (
        <span className="text-muted-foreground">No reports</span>
      )}
    </span>
  );
}

/** How a game's reports divide over the ratings: a flat bar and its numbers. */
export function RatingBar({ counts, total }: { counts: Record<RatingId, number>; total: number }) {
  if (total === 0) return <span className="text-muted-foreground">None yet</span>;
  const parts = RATING_LIST.filter((r) => counts[r.id] > 0);
  return (
    <span className="flex flex-col gap-1.5">
      <span className="flex h-1.5 w-full max-w-60" aria-hidden>
        {parts.map((r) => (
          <span key={r.id} style={{ width: `${(counts[r.id] / total) * 100}%`, backgroundColor: `var(--rating-${r.id}-solid)` }} />
        ))}
      </span>
      <span className="flex flex-wrap gap-x-3">
        {parts.map((r) => (
          <span key={r.id} className="inline-flex items-center gap-1.5">
            <Swatch rating={r.id} className="size-2" />
            <span className="font-mono text-[12px]">{counts[r.id]}</span> {r.word.toLowerCase()}
          </span>
        ))}
      </span>
    </span>
  );
}

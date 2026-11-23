import { useState } from "react";
import type { Entry } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter((w) => w && !/^(of|the|a|an)$/i.test(w));
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase();
}

/**
 * Steam art in a fixed box: the small capsule for table rows, the header on a game's page.
 * Tries each source in turn and ends with a flat tile of the game's initials.
 */
export function GameArt({ entry, variant, className }: { entry: Entry; variant: "thumb" | "header"; className?: string }) {
  const sources = [...new Set((variant === "thumb" ? [entry.thumb, entry.image] : [entry.image]).filter(Boolean))] as string[];
  const [index, setIndex] = useState(0);
  const box = cn("relative shrink-0 overflow-hidden bg-muted", variant === "thumb" ? "aspect-[184/69]" : "aspect-[460/215]", className);
  const src = sources[index];
  if (!src) {
    return (
      <span className={cn(box, "flex items-center justify-center bg-[#16181D] font-mono text-[#F2F1EC]")} aria-hidden>
        <span className={variant === "thumb" ? "text-[11px]" : "text-2xl"}>{initials(entry.name)}</span>
      </span>
    );
  }
  return (
    <span className={cn(box, "block")}>
      <img
        src={src}
        alt=""
        width={variant === "thumb" ? 184 : 460}
        height={variant === "thumb" ? 69 : 215}
        loading={variant === "thumb" ? "lazy" : "eager"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setIndex((i) => i + 1)}
        className="size-full object-cover"
      />
    </span>
  );
}

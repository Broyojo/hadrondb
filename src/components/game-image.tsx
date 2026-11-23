import { useState } from "react";
import type { Entry } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase();
}

/** Steam's header image (460x215), or a plain tile with the game's initials when there is none. */
export function GameImage({ entry, className, eager = false }: { entry: Entry; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const box = cn("relative aspect-[460/215] w-full overflow-hidden bg-muted", className);
  if (!entry.image || failed) {
    return (
      <div className={cn(box, "flex items-center justify-center bg-[#16181D]")} aria-hidden>
        <div
          className="absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(120% 90% at 0% 100%, #2a3a78 0%, transparent 60%)" }}
        />
        <span className="relative text-3xl font-semibold tracking-tight text-[#F2F1EC]/90">{initials(entry.name)}</span>
        {entry.kind === "program" && (
          <span className="absolute right-2 bottom-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[#F2F1EC] uppercase">
            Not on Steam
          </span>
        )}
      </div>
    );
  }
  return (
    <div className={box}>
      <img
        src={entry.image}
        alt=""
        width={460}
        height={215}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </div>
  );
}

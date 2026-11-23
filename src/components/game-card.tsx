import { Link } from "react-router";
import type { Row } from "@/lib/filters";
import { GRAPHICS_INFO } from "@/lib/graphics";
import { shortVersion } from "@/lib/versions";
import { GameImage } from "@/components/game-image";
import { RatingBadge } from "@/components/rating";

export function GameCard({ row }: { row: Row }) {
  const { entry, summary } = row;
  const api = entry.graphicsApis[0];
  return (
    <li>
      <Link
        to={entry.path}
        className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-md"
      >
        <GameImage entry={entry} />
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <h2 className="truncate font-semibold group-hover:text-primary" title={entry.name}>
              {entry.name}
            </h2>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {api !== "unknown" ? GRAPHICS_INFO[api].label : "Graphics API not known"}
              {entry.arch !== "unknown" && ` · ${entry.arch}`}
              {entry.kind === "program" && " · not on Steam"}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
            <RatingBadge rating={summary.rating} size="sm" />
            {summary.total > 0 && (
              <span className="text-xs text-muted-foreground">
                {summary.total} {summary.total === 1 ? "report" : "reports"}
                {summary.latestVersion && ` · ${shortVersion(summary.latestVersion)}`}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

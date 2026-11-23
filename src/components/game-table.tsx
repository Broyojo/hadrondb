import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import { GameArt } from "@/components/game-image";
import { RatingMark } from "@/components/rating";
import { chipFamily } from "@/lib/chips";
import type { Filters, Row, Sort } from "@/lib/filters";
import { GRAPHICS_INFO } from "@/lib/graphics";
import { parseVersion } from "@/lib/versions";
import { cn } from "@/lib/utils";

const NATURAL: Record<Sort, string> = {
  name: "A to Z",
  rating: "best first",
  api: "A to Z",
  version: "newest first",
  reports: "most first",
  recent: "newest first",
};

function chips(row: Row): string {
  const seen = new Set(row.entry.reports.map((r) => chipFamily(r.system?.chip)).filter(Boolean) as string[]);
  return [...seen].sort().join(" ");
}

function version(v: string | undefined): string {
  if (!v) return "–";
  const p = parseVersion(v);
  return p?.dev ? `<${p.major}.${p.minor}.${p.patch}` : v;
}

function Head({
  sort,
  children,
  className,
  filters,
  onSort,
}: {
  sort?: Sort;
  children: ReactNode;
  className?: string;
  filters: Filters;
  onSort: (s: Sort) => void;
}) {
    const active = sort !== undefined && filters.sort === sort;
    const naturalAscending = sort === "name" || sort === "api" || sort === "rating";
    const ariaSort = active ? (naturalAscending !== filters.reverse ? "ascending" : "descending") : undefined;
    return (
      <th
        scope="col"
        aria-sort={sort ? (ariaSort ?? "none") : undefined}
        className={cn("label h-8 border-b border-rule px-2 text-left align-bottom font-medium whitespace-nowrap", className)}
      >
        {sort ? (
          <button
            type="button"
            onClick={() => onSort(sort)}
            className={cn("inline-flex items-center gap-1 uppercase hover:text-foreground", active && "text-foreground")}
            title={`Sort ${NATURAL[sort]}${active ? ", click again to reverse" : ""}`}
          >
            {children}
            {active &&
              (filters.reverse ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}
          </button>
        ) : (
          children
        )}
      </th>
    );
  }

export function GameTable({ rows, filters, onSort }: { rows: Row[]; filters: Filters; onSort: (s: Sort) => void }) {
  const navigate = useNavigate();


  return (
    <table className="w-full border-collapse text-[13px]">
      <caption className="sr-only">Games and their ratings on Hadron. Column buttons sort the table.</caption>
      <thead>
        <tr>
          <th scope="col" className="hidden h-8 w-[100px] border-b border-rule md:table-cell">
            <span className="sr-only">Image</span>
          </th>
          <Head filters={filters} onSort={onSort} sort="name">Game</Head>
          <Head filters={filters} onSort={onSort} sort="rating">Rating</Head>
          <Head filters={filters} onSort={onSort} sort="api" className="hidden md:table-cell">
            API
          </Head>
          <Head filters={filters} onSort={onSort} className="hidden lg:table-cell">Chips</Head>
          <Head filters={filters} onSort={onSort} sort="version" className="text-right">
            Hadron
          </Head>
          <Head filters={filters} onSort={onSort} sort="reports" className="hidden text-right sm:table-cell">
            Reports
          </Head>
          <Head filters={filters} onSort={onSort} sort="recent" className="hidden text-right md:table-cell">
            Last report
          </Head>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const { entry, summary } = row;
          const api = entry.graphicsApis[0];
          return (
            <tr
              key={entry.key}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("a")) return;
                navigate(entry.path);
              }}
              className="cursor-pointer border-b hover:bg-muted"
            >
              <td className="hidden py-1 pl-0 md:table-cell">
                <GameArt entry={entry} variant="thumb" className="w-[92px]" />
              </td>
              <td className="w-full max-w-0 px-2 py-2 md:py-1">
                <Link to={entry.path} className="block truncate font-medium hover:underline">
                  {entry.name}
                </Link>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                  {entry.appId ?? "not on Steam"}
                  {api !== "unknown" && <span className="md:hidden"> · {GRAPHICS_INFO[api].label}</span>}
                </span>
              </td>
              <td className="px-2 whitespace-nowrap">
                <RatingMark rating={summary.rating} />
              </td>
              <td className="hidden px-2 whitespace-nowrap md:table-cell">
                {api === "unknown" ? <span className="text-muted-foreground">–</span> : GRAPHICS_INFO[api].label}
                {entry.arch === "32-bit" && <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">32-bit</span>}
              </td>
              <td className="hidden px-2 font-mono text-[12px] whitespace-nowrap text-muted-foreground lg:table-cell">
                {chips(row) || "–"}
              </td>
              <td className="px-2 text-right font-mono text-[12px] whitespace-nowrap" title={summary.latestVersion}>
                {version(summary.latestVersion)}
              </td>
              <td className="hidden px-2 text-right font-mono text-[12px] sm:table-cell">{summary.total || "–"}</td>
              <td className="hidden px-2 text-right font-mono text-[12px] whitespace-nowrap text-muted-foreground md:table-cell">
                {summary.lastDate ?? "–"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

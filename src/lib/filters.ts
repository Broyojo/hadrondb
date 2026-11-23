// Search, filters and sorting for the home page. The chip and version filters narrow the
// reports; the rating filter then applies to the rating those reports give.

import type { Entry } from "./catalog.ts";
import { chipFamily } from "./chips.ts";
import type { GraphicsApi } from "./graphics.ts";
import { RATINGS, RATING_IDS, type RatingId } from "./ratings.ts";
import type { Report } from "./schema.ts";
import { summarize, type Summary } from "./summary.ts";
import { parseVersion } from "./versions.ts";

export const SORTS = ["recent", "rating", "name"] as const;
export type Sort = (typeof SORTS)[number];

/** "dev" matches every development build. */
export const DEV_VERSIONS = "dev";

export interface Filters {
  q: string;
  ratings: RatingId[];
  api?: GraphicsApi;
  chip?: string;
  version?: string;
  sort: Sort;
}

export const EMPTY_FILTERS: Filters = { q: "", ratings: [], sort: "recent" };

export interface Row {
  entry: Entry;
  summary: Summary;
}

/** Lowercase, without accents or trademark signs, for matching what people type. */
export function normalise(s: string): string {
  // Trademark signs go first: NFKD would turn ™ into "TM".
  return s
    .replace(/[™®©]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchesQuery(entry: Entry, q: string): boolean {
  const query = normalise(q);
  if (!query) return true;
  const hay = normalise([entry.name, entry.appId ?? "", entry.slug ?? "", entry.engine ?? ""].join(" "));
  return query.split(" ").every((word) => hay.includes(word));
}

function reportMatches(r: Report, f: Filters): boolean {
  if (f.chip && chipFamily(r.system?.chip) !== f.chip) return false;
  if (f.version) {
    if (f.version === DEV_VERSIONS) return parseVersion(r.hadronVersion)?.dev === true;
    if (r.hadronVersion !== f.version) return false;
  }
  return true;
}

export function applyFilters(entries: Entry[], f: Filters): Row[] {
  const narrowsReports = Boolean(f.chip || f.version);
  const rows: Row[] = [];
  for (const entry of entries) {
    if (!matchesQuery(entry, f.q)) continue;
    if (f.api && !entry.graphicsApis.includes(f.api)) continue;
    const reports = narrowsReports ? entry.reports.filter((r) => reportMatches(r, f)) : entry.reports;
    if (narrowsReports && reports.length === 0) continue;
    const summary = summarize(reports);
    if (f.ratings.length > 0 && !(summary.rating && f.ratings.includes(summary.rating))) continue;
    rows.push({ entry, summary });
  }
  return sortRows(rows, f.sort);
}

function rank(s: Summary): number {
  return s.rating ? RATINGS[s.rating].rank : RATING_IDS.length + 1;
}

export function sortRows(rows: Row[], sort: Sort): Row[] {
  const byName = (a: Row, b: Row) => a.entry.name.localeCompare(b.entry.name, "en");
  const byRecent = (a: Row, b: Row) => (b.summary.lastDate ?? "").localeCompare(a.summary.lastDate ?? "");
  return [...rows].sort((a, b) => {
    if (sort === "name") return byName(a, b);
    if (sort === "rating") return rank(a.summary) - rank(b.summary) || byRecent(a, b) || byName(a, b);
    return byRecent(a, b) || byName(a, b);
  });
}

/** Filters to and from the page's query string, so that a filtered list can be linked to. */
export function filtersFromParams(p: URLSearchParams): Filters {
  const ratings = (p.get("rating") ?? "")
    .split(",")
    .filter((r): r is RatingId => (RATING_IDS as readonly string[]).includes(r));
  const sort = p.get("sort");
  return {
    q: p.get("q") ?? "",
    ratings,
    api: (p.get("api") as GraphicsApi | null) ?? undefined,
    chip: p.get("chip") ?? undefined,
    version: p.get("version") ?? undefined,
    sort: (SORTS as readonly string[]).includes(sort ?? "") ? (sort as Sort) : "recent",
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.ratings.length) p.set("rating", f.ratings.join(","));
  if (f.api) p.set("api", f.api);
  if (f.chip) p.set("chip", f.chip);
  if (f.version) p.set("version", f.version);
  if (f.sort !== "recent") p.set("sort", f.sort);
  return p;
}

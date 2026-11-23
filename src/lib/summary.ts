import { RATINGS, RATING_IDS, type RatingId } from "./ratings.ts";
import type { Report } from "./schema.ts";
import { compareVersions, parseVersion } from "./versions.ts";

export interface Summary {
  /** The headline rating; undefined when there are no reports. */
  rating?: RatingId;
  /** The reports the headline rating comes from. */
  basis: Report[];
  /** The newest Hadron version any report names. */
  latestVersion?: string;
  counts: Record<RatingId, number>;
  total: number;
  /** Date of the newest report. */
  lastDate?: string;
}

/** Newest first: by date, then by Hadron version. */
export function sortReports(reports: Report[]): Report[] {
  return [...reports].sort(
    (a, b) => b.date.localeCompare(a.date) || compareVersions(b.hadronVersion, a.hadronVersion),
  );
}

/** The middle rating of a set of reports; with an even count, the worse of the two middle ones,
 * so that one good report doesn't outweigh one bad one. */
export function medianRating(reports: Report[]): RatingId | undefined {
  if (reports.length === 0) return undefined;
  const ranks = reports.map((r) => RATINGS[r.rating].rank).sort((a, b) => a - b);
  const rank = ranks[Math.floor(ranks.length / 2)];
  return RATING_IDS[rank - 1];
}

/**
 * A game's headline rating comes from the reports on the newest Hadron version anyone has tried
 * it on: Hadron changes fast, and an old result says little about the current one. Reports that
 * don't name a version count only when no report does.
 */
export function summarize(reports: Report[]): Summary {
  const counts = Object.fromEntries(RATING_IDS.map((id) => [id, 0])) as Record<RatingId, number>;
  for (const r of reports) counts[r.rating]++;
  const sorted = sortReports(reports);
  const known = reports.filter((r) => parseVersion(r.hadronVersion));
  let latestVersion: string | undefined;
  let basis: Report[];
  if (known.length > 0) {
    latestVersion = known.map((r) => r.hadronVersion).sort(compareVersions).at(-1);
    basis = sorted.filter((r) => r.hadronVersion === latestVersion);
  } else {
    basis = sorted;
  }
  return {
    rating: medianRating(basis),
    basis,
    latestVersion,
    counts,
    total: reports.length,
    lastDate: sorted[0]?.date,
  };
}

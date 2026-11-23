// Turns the data files into the entries the site lists. The site trusts the files, which CI
// has checked (validate.ts); loading them doesn't pull the schema library into the page.

import type { Program, Report, SteamGame } from "./schema.ts";
import { sortReports } from "./summary.ts";

export interface Entry {
  kind: "steam" | "program";
  /** Unique across the catalog: "steam-400", "program-unvanquished". */
  key: string;
  /** The site path of its page. */
  path: string;
  sourceFile: string;
  name: string;
  appId?: number;
  slug?: string;
  storeUrl?: string;
  website?: string;
  /** Steam's header image, or undefined for programs. */
  image?: string;
  hasMacVersion: boolean;
  graphicsApis: SteamGame["graphicsApis"];
  arch: SteamGame["arch"];
  engine?: string;
  antiCheat?: string;
  tips: string[];
  /** Newest first. */
  reports: Report[];
}

export function steamHeaderUrl(appId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export function steamStoreUrl(appId: number): string {
  return `https://store.steampowered.com/app/${appId}/`;
}

export function steamEntry(game: SteamGame, sourceFile: string): Entry {
  return {
    kind: "steam",
    key: `steam-${game.appId}`,
    path: `/game/${game.appId}`,
    sourceFile,
    name: game.name,
    appId: game.appId,
    storeUrl: steamStoreUrl(game.appId),
    image: game.headerImage ?? steamHeaderUrl(game.appId),
    hasMacVersion: game.hasMacVersion ?? false,
    graphicsApis: game.graphicsApis,
    arch: game.arch,
    engine: game.engine,
    antiCheat: game.antiCheat,
    tips: game.tips ?? [],
    reports: sortReports(game.reports),
  };
}

export function programEntry(program: Program, sourceFile: string): Entry {
  return {
    kind: "program",
    key: `program-${program.slug}`,
    path: `/program/${program.slug}`,
    sourceFile,
    name: program.name,
    slug: program.slug,
    website: program.website,
    hasMacVersion: false,
    graphicsApis: program.graphicsApis,
    arch: program.arch,
    engine: program.engine,
    antiCheat: program.antiCheat,
    tips: program.tips ?? [],
    reports: sortReports(program.reports),
  };
}

const FILE_PATTERN = /(?:^|\/)data\/(games|programs)\/([^/]+)\.json$/;

export function parseDataPath(path: string): { dir: "games" | "programs"; base: string; sourceFile: string } | null {
  const m = FILE_PATTERN.exec(path);
  if (!m) return null;
  const dir = m[1] as "games" | "programs";
  return { dir, base: m[2], sourceFile: `data/${dir}/${m[2]}.json` };
}

/** Entries from data files already checked by CI, without checking them again. */
export function buildCatalog(files: Record<string, unknown>): Entry[] {
  const entries: Entry[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const p = parseDataPath(path);
    if (!p) continue;
    entries.push(p.dir === "games" ? steamEntry(raw as SteamGame, p.sourceFile) : programEntry(raw as Program, p.sourceFile));
  }
  return entries;
}

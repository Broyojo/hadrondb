// Checks the data files against the schema while loading them: for CI, the tests and the build.

import { programEntry, steamEntry, parseDataPath, type Entry } from "./catalog.ts";
import { ProgramSchema, SteamGameSchema, formatIssues } from "./schema.ts";

export interface Catalog {
  entries: Entry[];
  errors: string[];
}

/**
 * Validates and loads data files. `files` maps a path ending in data/games/<appid>.json or
 * data/programs/<slug>.json to the file's parsed contents.
 */
export function loadCatalog(files: Record<string, unknown>): Catalog {
  const entries: Entry[] = [];
  const errors: string[] = [];
  for (const [path, raw] of Object.entries(files).sort(([a], [b]) => a.localeCompare(b))) {
    const p = parseDataPath(path);
    if (!p) {
      errors.push(`${path}: not in data/games or data/programs`);
      continue;
    }
    const { dir, base, sourceFile } = p;
    let entry: Entry;
    if (dir === "games") {
      const parsed = SteamGameSchema.safeParse(raw);
      if (!parsed.success) {
        errors.push(...formatIssues(parsed.error).map((e) => `${sourceFile}: ${e}`));
        continue;
      }
      if (String(parsed.data.appId) !== base) {
        errors.push(`${sourceFile}: appId ${parsed.data.appId} doesn't match the file name`);
        continue;
      }
      entry = steamEntry(parsed.data, sourceFile);
    } else {
      const parsed = ProgramSchema.safeParse(raw);
      if (!parsed.success) {
        errors.push(...formatIssues(parsed.error).map((e) => `${sourceFile}: ${e}`));
        continue;
      }
      if (parsed.data.slug !== base) {
        errors.push(`${sourceFile}: slug "${parsed.data.slug}" doesn't match the file name`);
        continue;
      }
      entry = programEntry(parsed.data, sourceFile);
    }
    const ids = new Set<string>();
    for (const r of entry.reports) {
      if (ids.has(r.id)) errors.push(`${sourceFile}: report id "${r.id}" is used twice`);
      ids.add(r.id);
    }
    entries.push(entry);
  }
  return { entries, errors };
}

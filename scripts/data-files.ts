// Reads every data file from disk, for the validator, the tests and the report workflow.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface DataFile {
  /** Relative to the repository root, e.g. data/games/400.json. */
  path: string;
  text: string;
  json: unknown;
  parseError?: string;
}

export function readDataFiles(root: string): DataFile[] {
  const files: DataFile[] = [];
  for (const dir of ["games", "programs"]) {
    for (const name of readdirSync(join(root, "data", dir)).sort()) {
      if (!name.endsWith(".json")) continue;
      const path = `data/${dir}/${name}`;
      const text = readFileSync(join(root, path), "utf8");
      try {
        files.push({ path, text, json: JSON.parse(text) });
      } catch (e) {
        files.push({ path, text, json: undefined, parseError: (e as Error).message });
      }
    }
  }
  return files;
}

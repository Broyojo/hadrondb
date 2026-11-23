// Checks every file in data/ against the schema, and that each is formatted the one way the
// report workflow writes files. Run by CI and `pnpm validate`.

import { fileURLToPath } from "node:url";
import { loadCatalog } from "../src/lib/validate.ts";
import { serialise, type GameFile } from "../src/lib/merge.ts";
import { readDataFiles } from "./data-files.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const files = readDataFiles(root);
const errors: string[] = [];
for (const f of files) {
  if (f.parseError) errors.push(`${f.path}: not valid JSON: ${f.parseError}`);
  else if (serialise(f.json as GameFile) !== f.text) {
    errors.push(`${f.path}: not formatted as JSON.stringify(data, null, 2) plus a newline`);
  }
}
const catalog = loadCatalog(Object.fromEntries(files.filter((f) => !f.parseError).map((f) => [f.path, f.json])));
errors.push(...catalog.errors);

if (errors.length) {
  for (const e of errors) console.error(e);
  console.error(`\n${errors.length} problem(s) in data/.`);
  process.exit(1);
}
const reports = catalog.entries.reduce((n, e) => n + e.reports.length, 0);
console.log(`data/ is valid: ${catalog.entries.length} games and programs, ${reports} reports.`);

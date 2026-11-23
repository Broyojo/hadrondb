// Adds an accepted report to its game's data file, or starts the file.

import type { Target } from "./report-form.ts";
import { ProgramSchema, SteamGameSchema, formatIssues, type Program, type Report, type SteamGame } from "./schema.ts";

export type GameFile = SteamGame | Program;

export function dataPath(target: Target): string {
  return target.kind === "steam" ? `data/games/${target.appId}.json` : `data/programs/${target.slug}.json`;
}

/** The one formatting every data file uses, so that changes show up as small diffs. */
export function serialise(file: GameFile): string {
  return JSON.stringify(file, null, 2) + "\n";
}

export type MergeResult = { ok: true; file: GameFile; created: boolean; replaced: boolean } | { ok: false; errors: string[] };

/**
 * `existing` is the file's current contents, or undefined if there is none. A report with the same
 * id (the same issue, accepted again after an edit) replaces the earlier one. A new file takes the
 * game's details from the form; `steamName`, Steam's own name for the app ID, wins over the typed one.
 */
export function mergeReport(existing: unknown, target: Target, report: Report, steamName?: string): MergeResult {
  const schema = target.kind === "steam" ? SteamGameSchema : ProgramSchema;
  let file: GameFile;
  let created = false;
  let replaced = false;
  if (existing === undefined) {
    created = true;
    const common = {
      name: (target.kind === "steam" && steamName) || target.name,
      graphicsApis: [target.graphicsApi ?? "unknown"],
      arch: target.arch,
      ...(target.antiCheat ? { antiCheat: target.antiCheat } : {}),
    };
    file =
      target.kind === "steam"
        ? ({ $schema: "../../schema/game.schema.json", appId: target.appId!, ...common, reports: [report] } as SteamGame)
        : ({
            $schema: "../../schema/program.schema.json",
            slug: target.slug!,
            ...common,
            ...(target.website ? { website: target.website } : {}),
            reports: [report],
          } as Program);
  } else {
    const parsed = schema.safeParse(existing);
    if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error).map((e) => `existing file: ${e}`) };
    const reports = [...parsed.data.reports];
    const i = reports.findIndex((r) => r.id === report.id);
    if (i >= 0) {
      reports[i] = report;
      replaced = true;
    } else {
      reports.push(report);
    }
    // Keep the existing key order: only the reports change.
    file = { ...(existing as GameFile), reports };
  }
  const checked = schema.safeParse(file);
  if (!checked.success) return { ok: false, errors: formatIssues(checked.error) };
  return { ok: true, file, created, replaced };
}

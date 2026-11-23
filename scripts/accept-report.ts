// Run by .github/workflows/accept-report.yml when a maintainer labels a report issue "accepted".
// Reads the issue from the workflow's event, turns its form answers into a report, and writes
// the game's data file. It writes, into $RUNNER_TEMP/hadrondb/, the texts the workflow posts:
// the pull request's title and body and the commit message, or, when the report can't be
// added, the comment saying why. It never runs anything the issue contains.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RATINGS } from "../src/lib/ratings.ts";
import { dataPath, mergeReport, serialise } from "../src/lib/merge.ts";
import { parseIssue, type IssueInfo } from "../src/lib/report-form.ts";
import { formatVersion } from "../src/lib/versions.ts";

export type Prepared =
  | { ok: true; path: string; content: string; branch: string; title: string; body: string; commitMessage: string }
  | { ok: false; comment: string };

export function cleanSteamName(name: string): string {
  return name.replace(/[™®©]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Pure: everything but the file system and the network. `readExisting` returns a data file's
 * parsed contents, or undefined when it doesn't exist. `steam` is what Steam's store said about
 * the app ID, when it could be asked.
 */
export function prepare(
  issue: IssueInfo,
  readExisting: (path: string) => unknown,
  steam?: { found: boolean; name?: string },
): Prepared {
  const parsed = parseIssue(issue);
  if (!parsed.ok) return { ok: false, comment: rejection(parsed.errors) };
  const { target, report } = parsed;
  const path = dataPath(target);
  const existing = readExisting(path);
  const steamName = steam?.name ? cleanSteamName(steam.name) : undefined;
  const merged = mergeReport(existing, target, report, steamName);
  if (!merged.ok) return { ok: false, comment: rejection(merged.errors) };

  const name = merged.file.name;
  const notes: string[] = [];
  if (merged.created) notes.push(`This starts \`${path}\`: check the game's details (graphics API, 32 or 64-bit, engine).`);
  if (merged.replaced) notes.push(`This replaces the report from issue #${issue.number} that was accepted before.`);
  if (target.kind === "steam" && steam && !steam.found) {
    notes.push(`Steam's store doesn't know app ID ${target.appId}; check it.`);
  } else if (target.kind === "steam" && steamName && steamName.toLowerCase() !== target.name.toLowerCase()) {
    notes.push(`The form says "${target.name}"; Steam calls app ${target.appId} "${steamName}".`);
  } else if (target.kind === "steam" && !steam) {
    notes.push(`Steam's store couldn't be asked about app ID ${target.appId}; check it.`);
  }

  const rating = RATINGS[report.rating].label;
  const body = [
    `Adds the report from #${issue.number} by @${issue.author} to \`${path}\`.`,
    "",
    `- **${name}**: ${rating}`,
    `- ${formatVersion(report.hadronVersion)}${report.system?.chip ? `, ${report.system.chip}` : ""}${report.system?.macos ? `, macOS ${report.system.macos}` : ""}`,
    "",
    ...(notes.length ? ["**To check:**", ...notes.map((n) => `- ${n}`), ""] : []),
    "Merging this publishes the report on HadronDB.",
    "",
    `Closes #${issue.number}`,
  ].join("\n");
  return {
    ok: true,
    path,
    content: serialise(merged.file),
    branch: `report/issue-${issue.number}`,
    title: `Report: ${name} (#${issue.number})`,
    body,
    commitMessage: `Add a report for ${name}\n\nFrom #${issue.number} by @${issue.author}.\n`,
  };
}

function rejection(errors: string[]): string {
  return [
    "Thanks for the report! It couldn't be added yet:",
    "",
    ...errors.map((e) => `- ${e}`),
    "",
    "Edit the issue to fix this; each heading in it is one of the form's fields. A maintainer will then accept it again.",
  ].join("\n");
}

async function askSteam(appId: number): Promise<{ found: boolean; name?: string } | undefined> {
  try {
    const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=en`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as Record<string, { success: boolean; data?: { name?: string } }>;
    const entry = json[String(appId)];
    if (!entry) return undefined;
    return { found: entry.success, name: entry.data?.name };
  } catch {
    return undefined;
  }
}

interface IssueEvent {
  issue: { number: number; user: { login: string }; created_at: string; html_url: string; body: string | null };
}

async function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const outDir = join(process.env.RUNNER_TEMP ?? join(root, ".report"), "hadrondb");
  const output = process.env.GITHUB_OUTPUT;
  if (!eventPath) throw new Error("GITHUB_EVENT_PATH is not set");
  const event = JSON.parse(readFileSync(eventPath, "utf8")) as IssueEvent;
  const issue: IssueInfo = {
    number: event.issue.number,
    author: event.issue.user.login,
    createdAt: event.issue.created_at,
    url: event.issue.html_url,
    body: event.issue.body ?? "",
  };

  const parsed = parseIssue(issue);
  const steam = parsed.ok && parsed.target.appId !== undefined ? await askSteam(parsed.target.appId) : undefined;
  const result = prepare(
    issue,
    (path) => (existsSync(join(root, path)) ? JSON.parse(readFileSync(join(root, path), "utf8")) : undefined),
    steam,
  );

  mkdirSync(outDir, { recursive: true });
  const outputs: Record<string, string> = { ok: String(result.ok) };
  if (result.ok) {
    mkdirSync(dirname(join(root, result.path)), { recursive: true });
    writeFileSync(join(root, result.path), result.content);
    writeFileSync(join(outDir, "pr-title.txt"), result.title);
    writeFileSync(join(outDir, "pr-body.md"), result.body);
    writeFileSync(join(outDir, "commit-message.txt"), result.commitMessage);
    outputs.path = result.path;
    outputs.branch = result.branch;
    console.log(`Wrote ${result.path}`);
  } else {
    writeFileSync(join(outDir, "comment.md"), result.comment);
    console.log(result.comment);
  }
  if (output) appendFileSync(output, Object.entries(outputs).map(([k, v]) => `${k}=${v}\n`).join(""));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}

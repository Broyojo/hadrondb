import { describe, expect, it } from "vitest";
import { cleanSteamName, prepare } from "../scripts/accept-report.ts";
import { mergeReport } from "../src/lib/merge.ts";
import { parseIssue, type IssueInfo } from "../src/lib/report-form.ts";
import { SteamGameSchema } from "../src/lib/schema.ts";
import { GOOD_ANSWERS, issueBody } from "./helpers.ts";

const issue = (answers = GOOD_ANSWERS, number = 42): IssueInfo => ({
  number,
  author: "octo-player",
  createdAt: "2026-11-20T10:00:00Z",
  url: `https://github.com/Broyojo/hadrondb/issues/${number}`,
  body: issueBody(answers),
});

const existing = {
  $schema: "../../schema/game.schema.json",
  appId: 620,
  name: "Portal 2",
  graphicsApis: ["D3D9"],
  arch: "32-bit",
  engine: "Source",
  reports: [{ id: "2026-09-30-maintainer", rating: "well", date: "2026-09-30", hadronVersion: "0.1.0-dev", reporter: "maintainer" }],
};

describe("mergeReport", () => {
  const parsed = parseIssue(issue());
  if (!parsed.ok) throw new Error("fixture doesn't parse");

  it("appends to an existing file and keeps its details", () => {
    const r = mergeReport(existing, parsed.target, parsed.report);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.created).toBe(false);
    expect(r.file).toMatchObject({ engine: "Source", name: "Portal 2" });
    expect(r.file.reports.map((x) => x.id)).toEqual(["2026-09-30-maintainer", "issue-42"]);
    expect(Object.keys(r.file)).toEqual(Object.keys(existing));
  });

  it("replaces the report from the same issue when it is accepted again", () => {
    const once = mergeReport(existing, parsed.target, parsed.report);
    if (!once.ok) throw new Error();
    const twice = mergeReport(once.file, parsed.target, { ...parsed.report, rating: "issues" });
    expect(twice.ok && twice.replaced).toBe(true);
    if (!twice.ok) return;
    expect(twice.file.reports).toHaveLength(2);
    expect(twice.file.reports[1].rating).toBe("issues");
  });

  it("starts a new file, named as Steam names the game", () => {
    const r = mergeReport(undefined, { ...parsed.target, name: "portal two" }, parsed.report, "Portal 2");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.created).toBe(true);
    expect(SteamGameSchema.parse(r.file)).toMatchObject({ appId: 620, name: "Portal 2", graphicsApis: ["D3D9"], arch: "32-bit" });
  });

  it("refuses to add to a file that is already invalid", () => {
    const r = mergeReport({ ...existing, arch: "16-bit" }, parsed.target, parsed.report);
    expect(r.ok).toBe(false);
  });
});

describe("prepare", () => {
  it("writes the data file, the branch and the pull request", () => {
    const r = prepare(issue(), (path) => (path === "data/games/620.json" ? existing : undefined), {
      found: true,
      name: "Portal 2",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.path).toBe("data/games/620.json");
    expect(r.branch).toBe("report/issue-42");
    expect(r.title).toBe("Report: Portal 2 (#42)");
    expect(r.body).toContain("Closes #42");
    expect(r.body).toContain("Runs well");
    expect(r.content.endsWith("}\n")).toBe(true);
    expect(JSON.parse(r.content).reports).toHaveLength(2);
  });

  it("asks the maintainer to check an app ID Steam doesn't know", () => {
    const r = prepare(issue(), () => undefined, { found: false });
    expect(r.ok && r.body).toMatch(/doesn't know app ID 620/);
  });

  it("points out a name that differs from Steam's", () => {
    const r = prepare(issue({ ...GOOD_ANSWERS, name: "portal 2 (2011)" }), () => undefined, { found: true, name: "Portal 2" });
    expect(r.ok && r.body).toMatch(/Steam calls app 620 "Portal 2"/);
    expect(r.ok && r.title).toBe("Report: Portal 2 (#42)");
  });

  it("explains what to fix when the form can't be read", () => {
    const r = prepare(issue({ ...GOOD_ANSWERS, "hadron-version": "newest" }), () => undefined);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.comment).toMatch(/^Thanks for the report! It couldn't be added yet:/);
    expect(r.comment).toMatch(/- Hadron version: "newest"/);
  });

  it("writes programs to data/programs", () => {
    const r = prepare(issue({ ...GOOD_ANSWERS, "app-id": "", name: "Unvanquished" }), () => undefined);
    expect(r.ok && r.path).toBe("data/programs/unvanquished.json");
  });
});

describe("cleanSteamName", () => {
  it("drops trademark signs", () => {
    expect(cleanSteamName("STAR WARS™: Squadrons")).toBe("STAR WARS: Squadrons");
    expect(cleanSteamName("Just Cause™ 3")).toBe("Just Cause 3");
  });
});

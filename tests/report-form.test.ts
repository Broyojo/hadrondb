import { describe, expect, it } from "vitest";
import {
  ARCH_OPTIONS,
  CHIP_OPTIONS,
  FIELDS,
  GRAPHICS_OPTIONS,
  parseIssue,
  RATING_OPTIONS,
  RETINA_OPTIONS,
  slugify,
  splitSections,
  type IssueInfo,
} from "../src/lib/report-form.ts";
import { formItems, GOOD_ANSWERS, issueBody } from "./helpers.ts";

const issue = (answers: Record<string, string | boolean>, extra: Partial<IssueInfo> = {}): IssueInfo => ({
  number: 42,
  author: "octo-player",
  createdAt: "2026-11-20T10:00:00Z",
  url: "https://github.com/Broyojo/hadrondb/issues/42",
  body: issueBody(answers),
  ...extra,
});

describe("the issue form and the parser agree", () => {
  const items = formItems();
  const byLabel = new Map(items.map((i) => [i.attributes.label, i]));

  it("has a field for every label the parser reads, and no others", () => {
    expect([...byLabel.keys()].sort()).toEqual(Object.values(FIELDS).sort());
  });

  it.each([
    [FIELDS.rating, RATING_OPTIONS],
    [FIELDS.graphicsApi, GRAPHICS_OPTIONS],
    [FIELDS.arch, ARCH_OPTIONS],
    [FIELDS.chip, CHIP_OPTIONS],
    [FIELDS.retina, RETINA_OPTIONS],
  ])("offers the parser's options for %s", (label, options) => {
    expect(byLabel.get(label)?.attributes.options).toEqual(options);
  });

  it("requires what the parser requires", () => {
    const required = items.filter((i) => i.validations?.required).map((i) => i.attributes.label);
    expect(required.sort()).toEqual(
      [FIELDS.name, FIELDS.rating, FIELDS.hadronVersion, FIELDS.chip, FIELDS.macos, FIELDS.notes].sort(),
    );
  });
});

describe("splitSections", () => {
  it("splits on ### headings and handles Windows line endings", () => {
    const s = splitSections("### A\r\n\r\none\r\ntwo\r\n\r\n### B\n\n_No response_\n");
    expect(s.get("A")).toBe("one\ntwo");
    expect(s.get("B")).toBe("_No response_");
  });
});

describe("parseIssue", () => {
  it("reads a complete report", () => {
    const r = parseIssue(issue(GOOD_ANSWERS));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.target).toEqual({
      kind: "steam",
      appId: 620,
      slug: undefined,
      name: "Portal 2",
      website: undefined,
      graphicsApi: "D3D9",
      arch: "32-bit",
      antiCheat: undefined,
    });
    expect(r.report).toEqual({
      id: "issue-42",
      rating: "well",
      date: "2026-11-20",
      hadronVersion: "0.3.3",
      reporter: "octo-player",
      system: { model: "MacBook Air 13-inch (2024)", chip: "M3", ramGB: 16, macos: "27.0.1" },
      graphicsApi: "D3D9",
      retinaMode: "off",
      launchOptions: "-novid",
      gameSettings: "1470x956, High",
      performance: "60 fps",
      issues: ["Intro video is black", "Quitting takes a few seconds"],
      notes: "Played the first chapter, about an hour.",
      links: [
        { type: "issue", url: "https://github.com/Broyojo/hadrondb/issues/42", title: "Report #42" },
        { type: "issue", url: "https://github.com/Broyojo/hadron/issues/177" },
        { type: "discord", url: "https://discord.com/channels/1/2/3" },
      ],
    });
  });

  it("reads a minimal report and leaves out what wasn't answered", () => {
    const r = parseIssue(
      issue({
        name: "Teardown",
        "app-id": "1167630",
        rating: RATING_OPTIONS[4],
        "hadron-version": "0.3.3",
        chip: "Other or not listed",
        macos: "27.1",
        notes: "Black screen.",
        privacy: true,
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.report).toEqual({
      id: "issue-42",
      rating: "broken",
      date: "2026-11-20",
      hadronVersion: "0.3.3",
      reporter: "octo-player",
      system: { macos: "27.1" },
      notes: "Black screen.",
      links: [{ type: "issue", url: "https://github.com/Broyojo/hadrondb/issues/42", title: "Report #42" }],
    });
    expect(r.target.arch).toBe("unknown");
    expect(r.target.graphicsApi).toBeUndefined();
  });

  it("takes the app ID out of a store address", () => {
    const r = parseIssue(issue({ ...GOOD_ANSWERS, "app-id": "https://store.steampowered.com/app/620/Portal_2/" }));
    expect(r.ok && r.target.appId).toBe(620);
  });

  it("makes a program without an app ID, named by a slug", () => {
    const r = parseIssue(
      issue({ ...GOOD_ANSWERS, "app-id": "", name: "World of Tanks", website: "https://worldoftanks.com/" }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.target).toMatchObject({ kind: "program", slug: "world-of-tanks", website: "https://worldoftanks.com/" });
  });

  it("takes links with a few words before them, or as Markdown links", () => {
    const r = parseIssue(
      issue({
        ...GOOD_ANSWERS,
        links: [
          "Discord thread tracking the issue: https://discord.com/channels/1/2/3",
          "- [Video of the bug](https://www.youtube.com/watch?v=abc)",
          "<https://github.com/Broyojo/hadron/issues/214>.",
          "PCGamingWiki: https://www.pcgamingwiki.com/wiki/Doom_(2016)",
          "(see https://example.com/a_(b))",
        ].join("\n"),
      }),
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.report.links?.slice(1)).toEqual([
      { type: "discord", url: "https://discord.com/channels/1/2/3", title: "Discord thread tracking the issue" },
      { type: "other", url: "https://www.youtube.com/watch?v=abc", title: "Video of the bug" },
      { type: "issue", url: "https://github.com/Broyojo/hadron/issues/214" },
      { type: "other", url: "https://www.pcgamingwiki.com/wiki/Doom_(2016)", title: "PCGamingWiki" },
      { type: "other", url: "https://example.com/a_(b)", title: "see" },
    ]);
  });

  it("refuses a links line with no address, two addresses or an http one", () => {
    const r = parseIssue(
      issue({ ...GOOD_ANSWERS, links: "see the thread\nhttps://a.example/ https://b.example/\nold: http://example.com/" }),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    const all = r.errors.join("\n");
    expect(all).toMatch(/"see the thread" has no https:\/\/ address/);
    expect(all).toMatch(/has more than one address/);
    expect(all).toMatch(/"http:\/\/example.com\/" isn't an https:\/\/ address/);
  });

  it("lists every problem at once", () => {
    const r = parseIssue(
      issue({
        ...GOOD_ANSWERS,
        "app-id": "portal",
        "hadron-version": "latest",
        ram: "lots",
        macos: "Tahoe",
        links: "not a link",
        privacy: false,
      }),
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toHaveLength(6);
    expect(r.errors.join("\n")).toMatch(/Steam app ID: "portal"/);
    expect(r.errors.join("\n")).toMatch(/Hadron version: "latest"/);
    expect(r.errors.join("\n")).toMatch(/Memory \(GB\): "lots"/);
    expect(r.errors.join("\n")).toMatch(/macOS version: "Tahoe"/);
    expect(r.errors.join("\n")).toMatch(/Links: "not a link"/);
    expect(r.errors.join("\n")).toMatch(/Privacy/);
  });

  it("requires the required fields", () => {
    const r = parseIssue(issue({ ...GOOD_ANSWERS, notes: "", rating: "" }));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors).toEqual(expect.arrayContaining([expect.stringMatching(/^Rating: /), expect.stringMatching(/^What happened: /)]));
  });

  it("refuses an issue that wasn't made with the form", () => {
    const r = parseIssue({ ...issue(GOOD_ANSWERS), body: "Portal 2 works great!" });
    expect(r).toEqual({ ok: false, errors: [expect.stringMatching(/wasn't made with the game report form/)] });
  });

  it("refuses reporters it can't record", () => {
    expect(parseIssue(issue(GOOD_ANSWERS, { author: "maintainer" })).ok).toBe(false);
    expect(parseIssue(issue(GOOD_ANSWERS, { author: "renovate[bot]" })).ok).toBe(false);
  });

  it("refuses very long answers", () => {
    const r = parseIssue(issue({ ...GOOD_ANSWERS, notes: "x".repeat(3001) }));
    expect(r.ok).toBe(false);
  });

  it("drops 'none' as an anti-cheat", () => {
    const r = parseIssue(issue({ ...GOOD_ANSWERS, "anti-cheat": "None" }));
    expect(r.ok && r.target.antiCheat).toBeUndefined();
  });
});

describe("slugify", () => {
  it.each([
    ["World of Tanks", "world-of-tanks"],
    ["Pokémon Showdown!", "pokemon-showdown"],
    ["Assassin's Creed", "assassins-creed"],
    ["Just Cause™ 3", "just-cause-3"],
    ["  --  ", ""],
  ])("%s -> %s", (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });
});

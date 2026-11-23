import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ReportSchema, SteamGameSchema, ProgramSchema } from "../src/lib/schema.ts";
import { serialise, type GameFile } from "../src/lib/merge.ts";
import { jsonSchemas } from "../scripts/json-schemas.ts";
import { readDataFiles } from "../scripts/data-files.ts";
import { ROOT } from "./helpers.ts";

const report = {
  id: "issue-1",
  rating: "well",
  date: "2026-11-20",
  hadronVersion: "0.3.3",
  reporter: "someone",
};

describe("report schema", () => {
  it("accepts a minimal report", () => {
    expect(ReportSchema.safeParse(report).success).toBe(true);
  });

  it.each([
    ["an unknown rating", { rating: "gold" }],
    ["a version that isn't one", { hadronVersion: "latest" }],
    ["a date that isn't one", { date: "2026-13-01" }],
    ["an id with capitals", { id: "Issue-1" }],
    ["a reporter that isn't a GitHub login", { reporter: "some one" }],
    ["a field the schema doesn't have", { stars: 5 }],
    ["a chip that isn't Apple silicon", { system: { chip: "Intel Core i9" } }],
    ["a link that isn't https", { links: [{ type: "other", url: "http://example.com" }] }],
    ["an empty note", { notes: "  " }],
  ])("rejects %s", (_, patch) => {
    expect(ReportSchema.safeParse({ ...report, ...patch }).success).toBe(false);
  });

  it("accepts development builds and unknown versions", () => {
    expect(ReportSchema.safeParse({ ...report, hadronVersion: "0.3.0-dev" }).success).toBe(true);
    expect(ReportSchema.safeParse({ ...report, hadronVersion: "unknown" }).success).toBe(true);
  });

  it("tells games and programs apart", () => {
    const base = { name: "X", graphicsApis: ["D3D11"], arch: "64-bit", reports: [] };
    expect(SteamGameSchema.safeParse({ ...base, appId: 1 }).success).toBe(true);
    expect(SteamGameSchema.safeParse({ ...base, slug: "x" }).success).toBe(false);
    expect(ProgramSchema.safeParse({ ...base, slug: "x" }).success).toBe(true);
    expect(ProgramSchema.safeParse({ ...base, slug: "Not A Slug" }).success).toBe(false);
    expect(SteamGameSchema.safeParse({ ...base, appId: 1, graphicsApis: [] }).success).toBe(false);
  });
});

describe("data files", () => {
  const files = readDataFiles(ROOT);

  it("are all valid JSON in the one format", () => {
    for (const f of files) {
      expect(f.parseError, f.path).toBeUndefined();
      expect(f.text, `${f.path} is not formatted like serialise() writes it`).toBe(serialise(f.json as GameFile));
    }
  });

  it("name the JSON Schema for their folder", () => {
    for (const f of files) {
      const expected = f.path.startsWith("data/games/") ? "../../schema/game.schema.json" : "../../schema/program.schema.json";
      expect((f.json as { $schema?: string }).$schema, f.path).toBe(expected);
    }
  });
});

describe("JSON Schema files", () => {
  it("are up to date with src/lib/schema.ts (run pnpm schema)", () => {
    for (const [name, schema] of Object.entries(jsonSchemas())) {
      const onDisk = JSON.parse(readFileSync(`${ROOT}schema/${name}`, "utf8"));
      expect(onDisk, name).toEqual(schema);
    }
  });
});

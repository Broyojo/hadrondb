import { describe, expect, it } from "vitest";
import { buildCatalog } from "../src/lib/catalog.ts";
import { loadCatalog } from "../src/lib/validate.ts";
import { readDataFiles } from "../scripts/data-files.ts";
import { ROOT } from "./helpers.ts";

const game = (appId: number, reports: unknown[] = []) => ({
  appId,
  name: `Game ${appId}`,
  graphicsApis: ["D3D11"],
  arch: "64-bit",
  reports,
});
const report = (id: string, date = "2026-11-01") => ({
  id,
  rating: "well",
  date,
  hadronVersion: "0.3.3",
  reporter: "maintainer",
});

describe("loadCatalog", () => {
  it("loads every data file in the repository without errors", () => {
    const files = readDataFiles(ROOT);
    const catalog = loadCatalog(Object.fromEntries(files.map((f) => [f.path, f.json])));
    expect(catalog.errors).toEqual([]);
    expect(catalog.entries.length).toBe(files.length);
    const keys = new Set(catalog.entries.map((e) => e.key));
    expect(keys.size).toBe(catalog.entries.length);
  });

  it("builds Steam entries with store and image links", () => {
    const { entries, errors } = loadCatalog({ "../data/games/400.json": game(400) });
    expect(errors).toEqual([]);
    expect(entries[0]).toMatchObject({
      kind: "steam",
      path: "/game/400",
      storeUrl: "https://store.steampowered.com/app/400/",
      image: "https://cdn.cloudflare.steamstatic.com/steam/apps/400/header.jpg",
      sourceFile: "data/games/400.json",
    });
  });

  it("builds program entries", () => {
    const { entries } = loadCatalog({
      "data/programs/foo-bar.json": { slug: "foo-bar", name: "Foo", graphicsApis: ["OpenGL"], arch: "64-bit", reports: [] },
    });
    expect(entries[0]).toMatchObject({ kind: "program", path: "/program/foo-bar" });
    expect(entries[0].image).toBeUndefined();
  });

  it("sorts reports newest first", () => {
    const { entries } = loadCatalog({
      "data/games/1.json": game(1, [report("a", "2026-10-01"), report("b", "2026-11-01")]),
    });
    expect(entries[0].reports.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("reports a file whose name doesn't match its app ID", () => {
    const { entries, errors } = loadCatalog({ "data/games/401.json": game(400) });
    expect(entries).toEqual([]);
    expect(errors[0]).toMatch(/appId 400 doesn't match/);
  });

  it("reports duplicate report ids", () => {
    const { errors } = loadCatalog({ "data/games/1.json": game(1, [report("a"), report("a")]) });
    expect(errors[0]).toMatch(/used twice/);
  });

  it("reports schema errors with the field's path", () => {
    const { errors } = loadCatalog({ "data/games/1.json": game(1, [{ ...report("a"), rating: "gold" }]) });
    expect(errors[0]).toMatch(/^data\/games\/1\.json: reports\.0\.rating:/);
  });

  it("rejects files outside the data folders", () => {
    expect(loadCatalog({ "data/other/1.json": game(1) }).errors[0]).toMatch(/not in data\/games/);
  });
});

describe("buildCatalog", () => {
  it("gives the same entries as loadCatalog for valid files", () => {
    const files = Object.fromEntries(readDataFiles(ROOT).map((f) => [f.path, f.json]));
    const byKey = (a: { key: string }, b: { key: string }) => a.key.localeCompare(b.key);
    expect(buildCatalog(files).sort(byKey)).toEqual(loadCatalog(files).entries.sort(byKey));
  });
});

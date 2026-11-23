import { describe, expect, it } from "vitest";
import type { Entry } from "../src/lib/catalog.ts";
import { applyFilters, EMPTY_FILTERS, filtersFromParams, filtersToParams, matchesQuery, normalise } from "../src/lib/filters.ts";
import type { Report } from "../src/lib/schema.ts";
import { medianRating, summarize } from "../src/lib/summary.ts";
import { compareVersions, formatVersion, normaliseVersionInput } from "../src/lib/versions.ts";

const r = (rating: Report["rating"], hadronVersion: string, date = "2026-11-01", chip?: string): Report => ({
  id: `${rating}-${hadronVersion}-${date}`,
  rating,
  date,
  hadronVersion,
  reporter: "maintainer",
  ...(chip ? { system: { chip } } : {}),
});

describe("versions", () => {
  it("orders releases, development builds and unknown", () => {
    const sorted = ["0.3.3", "unknown", "0.3.0-dev", "0.2.0", "0.3.0", "0.10.0", "0.1.0-dev"].sort(compareVersions);
    expect(sorted).toEqual(["unknown", "0.1.0-dev", "0.2.0", "0.3.0-dev", "0.3.0", "0.3.3", "0.10.0"]);
  });

  it("reads what people type", () => {
    expect(normaliseVersionInput("Hadron 0.3.3 (Homebrew cask)")).toBe("0.3.3");
    expect(normaliseVersionInput("v0.4.0-dev")).toBe("0.4.0-dev");
    expect(normaliseVersionInput("the latest")).toBeNull();
  });

  it("formats for people", () => {
    expect(formatVersion("0.3.3")).toBe("Hadron 0.3.3");
    expect(formatVersion("0.3.0-dev")).toBe("Development build before 0.3.0");
    expect(formatVersion("unknown")).toBe("Version not given");
  });
});

describe("summarize", () => {
  it("has no rating without reports", () => {
    expect(summarize([])).toMatchObject({ rating: undefined, total: 0 });
  });

  it("rates from the newest version only", () => {
    const s = summarize([r("perfect", "0.3.2", "2026-11-01"), r("broken", "0.3.3", "2026-10-01")]);
    expect(s.rating).toBe("broken");
    expect(s.latestVersion).toBe("0.3.3");
    expect(s.lastDate).toBe("2026-11-01");
    expect(s.counts).toMatchObject({ perfect: 1, broken: 1, well: 0 });
  });

  it("counts reports without a version only when none has one", () => {
    expect(summarize([r("broken", "unknown"), r("well", "0.3.3")]).rating).toBe("well");
    expect(summarize([r("broken", "unknown")]).rating).toBe("broken");
  });

  it("takes the middle rating, the worse one of two", () => {
    expect(medianRating([r("perfect", "1.0.0"), r("issues", "1.0.0"), r("broken", "1.0.0")])).toBe("issues");
    expect(medianRating([r("perfect", "1.0.0"), r("issues", "1.0.0")])).toBe("issues");
  });
});

const entry = (name: string, reports: Report[], extra: Partial<Entry> = {}): Entry => ({
  kind: "steam",
  key: name,
  path: `/game/${name}`,
  sourceFile: "",
  name,
  appId: 1,
  hasMacVersion: false,
  graphicsApis: ["D3D11"],
  arch: "64-bit",
  tips: [],
  reports,
  ...extra,
});

describe("filters", () => {
  const entries = [
    entry("Portal 2", [r("well", "0.3.3", "2026-11-02", "M5 Pro")], { graphicsApis: ["D3D9"], appId: 620 }),
    entry("Teardown", [r("broken", "0.3.3", "2026-10-01", "M2"), r("perfect", "0.3.0-dev", "2026-09-01", "M1 Max")], {
      graphicsApis: ["D3D12"],
    }),
    entry("Pokémon™ Thing", [], { appId: 5 }),
  ];

  it("matches names without accents or trademark signs, and app IDs", () => {
    expect(normalise("Pokémon™ Thing")).toBe("pokemon thing");
    expect(matchesQuery(entries[2], "pokemon")).toBe(true);
    expect(matchesQuery(entries[0], "620")).toBe(true);
    expect(matchesQuery(entries[0], "portal 3")).toBe(false);
  });

  it("sorts by latest report by default, games without reports last", () => {
    expect(applyFilters(entries, EMPTY_FILTERS).map((x) => x.entry.name)).toEqual(["Portal 2", "Teardown", "Pokémon™ Thing"]);
  });

  it("sorts by rating", () => {
    const rows = applyFilters(entries, { ...EMPTY_FILTERS, sort: "rating" });
    expect(rows.map((x) => x.entry.name)).toEqual(["Portal 2", "Teardown", "Pokémon™ Thing"]);
  });

  it("filters by graphics API and rating", () => {
    expect(applyFilters(entries, { ...EMPTY_FILTERS, api: "D3D12" }).map((x) => x.entry.name)).toEqual(["Teardown"]);
    expect(applyFilters(entries, { ...EMPTY_FILTERS, ratings: ["broken"] }).map((x) => x.entry.name)).toEqual(["Teardown"]);
  });

  it("rates from the matching reports when filtering by chip or version", () => {
    const m1 = applyFilters(entries, { ...EMPTY_FILTERS, chip: "M1" });
    expect(m1.map((x) => [x.entry.name, x.summary.rating])).toEqual([["Teardown", "perfect"]]);
    const dev = applyFilters(entries, { ...EMPTY_FILTERS, version: "dev" });
    expect(dev.map((x) => x.entry.name)).toEqual(["Teardown"]);
    expect(applyFilters(entries, { ...EMPTY_FILTERS, version: "0.3.3" })).toHaveLength(2);
  });

  it("round-trips through the query string", () => {
    const f = { q: "portal", ratings: ["well" as const, "issues" as const], api: "D3D9" as const, chip: "M5", version: "0.3.3", sort: "name" as const };
    expect(filtersFromParams(filtersToParams(f))).toEqual(f);
    expect(filtersFromParams(new URLSearchParams("rating=gold,well&sort=stars"))).toEqual({ ...EMPTY_FILTERS, ratings: ["well"] });
  });
});

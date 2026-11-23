// The game report issue form (.github/ISSUE_TEMPLATE/game-report.yml) and the parser that
// turns a submitted issue's body back into a report. tests/report-form.test.ts checks that the
// labels and options here and in the form's YAML agree.

import { CHIPS } from "./chips.ts";
import { GRAPHICS_APIS, GRAPHICS_INFO, graphicsApiByLabel, type Arch, type GraphicsApi } from "./graphics.ts";
import { RATING_LIST, ratingByLabel } from "./ratings.ts";
import { ReportSchema, REPORTER_PATTERN, type Report, type ReportLink } from "./schema.ts";
import { normaliseVersionInput } from "./versions.ts";

export const FIELDS = {
  name: "Game or program",
  appId: "Steam app ID",
  website: "Website (programs not on Steam)",
  rating: "Rating",
  hadronVersion: "Hadron version",
  graphicsApi: "Graphics API",
  arch: "32-bit or 64-bit",
  antiCheat: "Anti-cheat",
  macModel: "Mac model",
  chip: "Chip",
  ram: "Memory (GB)",
  macos: "macOS version",
  retina: "Retina mode",
  launchOptions: "Launch options and settings",
  gameSettings: "In-game settings",
  performance: "Frame rate",
  issues: "Issues",
  notes: "What happened",
  links: "Links",
  privacy: "Privacy",
} as const;
export type FieldId = keyof typeof FIELDS;

/** Dropdown options, as the form shows them. */
export const RATING_OPTIONS = RATING_LIST.map((r) => `${r.label}: ${r.short.charAt(0).toLowerCase()}${r.short.slice(1)}`);
export const GRAPHICS_OPTIONS = GRAPHICS_APIS.map((g) => GRAPHICS_INFO[g].label);
export const ARCH_OPTIONS = ["64-bit", "32-bit", "Not known"];
export const CHIP_OTHER = "Other or not listed";
export const CHIP_OPTIONS = [...CHIPS, CHIP_OTHER];
export const RETINA_OPTIONS = ["On (Hadron's default)", "Off (RetinaMode=n)", "Not known"];

const NO_RESPONSE = "_No response_";
const MAX_TEXT = 3000;

export interface IssueInfo {
  number: number;
  /** The author's GitHub login. */
  author: string;
  /** ISO timestamp the issue was opened. */
  createdAt: string;
  url: string;
  body: string;
}

export interface Target {
  kind: "steam" | "program";
  appId?: number;
  slug?: string;
  name: string;
  website?: string;
  graphicsApi?: GraphicsApi;
  arch: Arch;
  antiCheat?: string;
}

export type ParseResult = { ok: true; target: Target; report: Report } | { ok: false; errors: string[] };

/** Splits an issue form body into its sections: "### Label" headings, then the answer. */
export function splitSections(body: string): Map<string, string> {
  const sections = new Map<string, string>();
  let current: string | null = null;
  let lines: string[] = [];
  const flush = () => {
    if (current !== null) sections.set(current, lines.join("\n").trim());
  };
  for (const line of body.replace(/\r\n?/g, "\n").split("\n")) {
    const h = /^###\s+(.+?)\s*$/.exec(line);
    if (h) {
      flush();
      current = h[1];
      lines = [];
    } else if (current !== null) {
      lines.push(line);
    }
  }
  flush();
  return sections;
}

export function slugify(name: string): string {
  return name
    .replace(/[™®©]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

function linkType(url: URL): ReportLink["type"] {
  if (url.hostname === "github.com" && /\/issues\/\d+/.test(url.pathname)) return "issue";
  if (url.hostname === "github.com" && /\/pull\/\d+/.test(url.pathname)) return "pull";
  if (/(^|\.)discord(app)?\.com$/.test(url.hostname) || url.hostname === "discord.gg") return "discord";
  return "other";
}

export function parseIssue(issue: IssueInfo): ParseResult {
  const sections = splitSections(issue.body);
  const errors: string[] = [];

  const value = (id: FieldId): string => {
    const v = sections.get(FIELDS[id]) ?? "";
    return v === NO_RESPONSE ? "" : v;
  };
  const textValue = (id: FieldId): string | undefined => {
    const v = value(id);
    if (!v) return undefined;
    if (v.length > MAX_TEXT) errors.push(`${FIELDS[id]}: keep it under ${MAX_TEXT} characters.`);
    return v;
  };
  const required = (id: FieldId): string => {
    const v = value(id);
    if (!v) errors.push(`${FIELDS[id]}: this is required.`);
    return v;
  };

  if (!sections.has(FIELDS.rating)) {
    return { ok: false, errors: ["This issue wasn't made with the game report form, so it can't be read."] };
  }

  // What was tried.
  const name = required("name");
  if (name.length > 200) errors.push(`${FIELDS.name}: keep the name under 200 characters.`);
  const appIdRaw = value("appId");
  let appId: number | undefined;
  if (appIdRaw) {
    const m = /^\s*(\d{1,10})\s*$/.exec(appIdRaw) ?? /store\.steampowered\.com\/app\/(\d+)/.exec(appIdRaw);
    if (m && Number(m[1]) > 0) appId = Number(m[1]);
    else errors.push(`${FIELDS.appId}: "${appIdRaw}" isn't an app ID. It is the number in the game's store page address.`);
  }
  let website: string | undefined;
  const websiteRaw = value("website");
  if (websiteRaw) {
    try {
      const u = new URL(websiteRaw);
      if (u.protocol !== "https:") throw new Error();
      website = u.toString();
    } catch {
      errors.push(`${FIELDS.website}: "${websiteRaw}" isn't an https:// address.`);
    }
  }
  const slug = appId === undefined ? slugify(name) : undefined;
  if (appId === undefined && name && !slug) errors.push(`${FIELDS.name}: the name needs letters or digits.`);

  // The result.
  const ratingRaw = required("rating");
  const rating = ratingRaw ? ratingByLabel(ratingRaw.split(":")[0]) : undefined;
  if (ratingRaw && !rating) errors.push(`${FIELDS.rating}: "${ratingRaw}" isn't one of the ratings.`);

  const versionRaw = required("hadronVersion");
  const hadronVersion = versionRaw ? normaliseVersionInput(versionRaw) : null;
  if (versionRaw && !hadronVersion) {
    errors.push(`${FIELDS.hadronVersion}: "${versionRaw}" isn't a version such as 0.3.3 (hadron status prints it).`);
  }

  const apiRaw = value("graphicsApi");
  let graphicsApi: GraphicsApi | undefined;
  if (apiRaw) {
    graphicsApi = graphicsApiByLabel(apiRaw);
    if (!graphicsApi) errors.push(`${FIELDS.graphicsApi}: "${apiRaw}" isn't one of the options.`);
    if (graphicsApi === "unknown") graphicsApi = undefined;
  }
  const archRaw = value("arch");
  const arch: Arch = archRaw === "32-bit" || archRaw === "64-bit" ? archRaw : "unknown";
  const antiCheatRaw = textValue("antiCheat");
  const antiCheat = antiCheatRaw && !/^(none|no|n\/a|-)$/i.test(antiCheatRaw) ? antiCheatRaw : undefined;

  // The Mac.
  const chipRaw = required("chip");
  const chip = chipRaw && chipRaw !== CHIP_OTHER ? chipRaw : undefined;
  if (chipRaw && chipRaw !== CHIP_OTHER && !CHIPS.includes(chipRaw)) {
    errors.push(`${FIELDS.chip}: "${chipRaw}" isn't one of the options.`);
  }
  const ramRaw = value("ram");
  let ramGB: number | undefined;
  if (ramRaw) {
    const m = /^\s*(\d{1,4})\s*(gb|g)?\s*$/i.exec(ramRaw);
    if (m) ramGB = Number(m[1]);
    else errors.push(`${FIELDS.ram}: "${ramRaw}" isn't a number of gigabytes, such as 16.`);
  }
  const macosRaw = required("macos");
  const macosMatch = /\b(\d{2}(?:\.\d+){0,2})\b/.exec(macosRaw);
  if (macosRaw && !macosMatch) errors.push(`${FIELDS.macos}: "${macosRaw}" isn't a version such as 27.0.1.`);
  const retinaRaw = value("retina");
  const retinaMode = retinaRaw.startsWith("On") ? "on" : retinaRaw.startsWith("Off") ? "off" : undefined;

  // Free text.
  const issuesRaw = textValue("issues");
  const issues = issuesRaw
    ?.split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim())
    .filter(Boolean);
  const notes = required("notes");
  if (notes.length > MAX_TEXT) errors.push(`${FIELDS.notes}: keep it under ${MAX_TEXT} characters.`);

  const links: ReportLink[] = [{ type: "issue", url: issue.url, title: `Report #${issue.number}` }];
  for (const line of value("links").split("\n").map((l) => l.trim()).filter(Boolean)) {
    const raw = line.replace(/^[-*]\s+/, "");
    try {
      const u = new URL(raw);
      if (u.protocol !== "https:") throw new Error();
      links.push({ type: linkType(u), url: u.toString() });
    } catch {
      errors.push(`${FIELDS.links}: "${raw}" isn't an https:// address. Put one address on each line.`);
    }
  }

  const privacy = value("privacy");
  if (!/-\s*\[x\]/i.test(privacy)) errors.push(`${FIELDS.privacy}: please confirm that the report has no personal details.`);

  if (!REPORTER_PATTERN.test(issue.author) || ["maintainer", "community"].includes(issue.author.toLowerCase())) {
    errors.push(`The issue's author "${issue.author}" can't be recorded as a reporter.`);
  }

  const optionalText = (id: "launchOptions" | "gameSettings" | "performance") => {
    const v = textValue(id);
    return v ? { [id]: v } : {};
  };
  // Read before the error check, so that a too-long answer is reported with the rest.
  const model = textValue("macModel");
  const extras = { ...optionalText("launchOptions"), ...optionalText("gameSettings"), ...optionalText("performance") };

  if (errors.length > 0) return { ok: false, errors };

  const system = {
    ...(model ? { model } : {}),
    ...(chip ? { chip } : {}),
    ...(ramGB !== undefined ? { ramGB } : {}),
    ...(macosMatch ? { macos: macosMatch[1] } : {}),
  };
  const candidate = {
    id: `issue-${issue.number}`,
    rating: rating!.id,
    date: issue.createdAt.slice(0, 10),
    hadronVersion: hadronVersion!,
    reporter: issue.author,
    ...(Object.keys(system).length ? { system } : {}),
    ...(graphicsApi ? { graphicsApi } : {}),
    ...(retinaMode ? { retinaMode } : {}),
    ...extras,
    ...(issues && issues.length ? { issues } : {}),
    notes,
    links,
  };
  const checked = ReportSchema.safeParse(candidate);
  if (!checked.success) {
    return { ok: false, errors: checked.error.issues.map((i) => `${i.path.join(".") || "report"}: ${i.message}`) };
  }
  return {
    ok: true,
    target: {
      kind: appId === undefined ? "program" : "steam",
      appId,
      slug,
      name,
      website,
      graphicsApi,
      arch,
      antiCheat,
    },
    report: checked.data,
  };
}

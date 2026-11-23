// The data files' schema. scripts/validate-data.ts and the tests check every file in data/
// against it; scripts/generate-schema.ts writes it out as JSON Schema in schema/ for editors.

import { z } from "zod";
import { RATING_IDS } from "./ratings.ts";
import { GRAPHICS_APIS, ARCHES } from "./graphics.ts";
import { CHIP_PATTERN } from "./chips.ts";
import { VERSION_PATTERN } from "./versions.ts";

const text = z.string().trim().min(1);
const url = z.url({ protocol: /^https$/ });

/** GitHub logins are letters, digits and single hyphens, at most 39 characters. "maintainer"
 * marks a report by Hadron's maintainer, "community" one relayed from Discord or elsewhere by
 * someone who didn't file it themselves. */
export const REPORTER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

export const LINK_TYPES = ["issue", "pull", "discord", "doc", "other"] as const;

export const LinkSchema = z.strictObject({
  type: z.enum(LINK_TYPES),
  url,
  title: text.optional(),
});

export const SystemSchema = z.strictObject({
  model: text.optional().describe("Mac model, e.g. \"MacBook Pro 14-inch (2023)\""),
  chip: z.string().regex(CHIP_PATTERN, "a chip such as M2 Pro").optional(),
  ramGB: z.int().min(4).max(1024).optional().describe("Unified memory in GB"),
  macos: z
    .string()
    .regex(/^\d{2}(\.\d+){0,2}$/, "a macOS version such as 27.0.1")
    .optional(),
});

export const ReportSchema = z.strictObject({
  id: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]*$/, "lowercase letters, digits and hyphens")
    .describe("Unique within the file; reports from the issue form use issue-<number>"),
  rating: z.enum(RATING_IDS),
  date: z.iso.date().describe("When the game was tried (or, if unknown, when the report was recorded)"),
  hadronVersion: z
    .string()
    .refine((v) => v === "unknown" || VERSION_PATTERN.test(v), "a version such as 0.3.3, 0.3.0-dev, or unknown"),
  reporter: z.string().regex(REPORTER_PATTERN, "a GitHub user name, maintainer or community"),
  system: SystemSchema.optional(),
  graphicsApi: z.enum(GRAPHICS_APIS).optional().describe("The API this run used, when the game has several"),
  retinaMode: z.enum(["on", "off"]).optional().describe("on is Hadron's default; off is RetinaMode=n"),
  launchOptions: text.optional().describe("Steam launch options or games.conf settings used"),
  gameSettings: text.optional().describe("In-game settings: resolution, quality, renderer"),
  performance: text.optional().describe("Frame rate and smoothness"),
  issues: z.array(text).optional(),
  notes: text.optional(),
  followUp: text.optional().describe("What happens next: a fix on the way, a retest wanted"),
  links: z.array(LinkSchema).optional(),
});

const gameBase = {
  $schema: z.string().optional(),
  name: text,
  graphicsApis: z.array(z.enum(GRAPHICS_APIS)).min(1).describe("The game's renderers, its default first"),
  arch: z.enum(ARCHES),
  engine: text.optional(),
  antiCheat: text.optional(),
  tips: z.array(text).optional().describe("Advice that holds across reports"),
  reports: z.array(ReportSchema),
};

export const SteamGameSchema = z.strictObject({
  appId: z.int().positive(),
  ...gameBase,
  hasMacVersion: z
    .boolean()
    .optional()
    .describe("Steam installs the Mac version unless the compatibility tool is forced"),
  headerImage: url.optional().describe("Only when Steam's default header.jpg path doesn't exist"),
});

export const ProgramSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase words joined by hyphens"),
  ...gameBase,
  website: url.optional(),
});

export type Report = z.infer<typeof ReportSchema>;
export type SteamGame = z.infer<typeof SteamGameSchema>;
export type Program = z.infer<typeof ProgramSchema>;
export type ReportLink = z.infer<typeof LinkSchema>;

/** Human-readable list of what is wrong, one line per problem. */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((i) => {
    const path = i.path.length ? i.path.join(".") : "(file)";
    return `${path}: ${i.message}`;
  });
}

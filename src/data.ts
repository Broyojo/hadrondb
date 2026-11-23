// Every data file, bundled into the site at build time.
import { buildCatalog } from "@/lib/catalog";

// CI checks every file against the schema (pnpm validate), so the page doesn't do it again.
const files = import.meta.glob<unknown>("../data/{games,programs}/*.json", { eager: true, import: "default" });

export const catalog = { entries: buildCatalog(files) };

export const REPO_URL = "https://github.com/Broyojo/hadrondb";
export const HADRON_URL = "https://github.com/Broyojo/hadron";
export const DISCORD_URL = "https://discord.gg/ShNTcxWjKN";
export const REPORT_FORM_URL = `${REPO_URL}/issues/new?template=game-report.yml`;

export function reportFormUrl(name?: string, appId?: number): string {
  const p = new URLSearchParams({ template: "game-report.yml" });
  if (name) p.set("name", name);
  if (appId !== undefined) p.set("app-id", String(appId));
  return `${REPO_URL}/issues/new?${p.toString()}`;
}

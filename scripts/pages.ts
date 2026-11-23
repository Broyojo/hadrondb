// The site's pages and their titles and descriptions, for the static copies of index.html the
// build writes (vite.config.ts) and for sitemap.xml.

import type { Entry } from "../src/lib/catalog.ts";
import { loadCatalog } from "../src/lib/validate.ts";
import { RATINGS } from "../src/lib/ratings.ts";
import { summarize } from "../src/lib/summary.ts";
import { readDataFiles } from "./data-files.ts";

export const SITE_URL = "https://hadrondb.com";
const SITE_DESCRIPTION =
  "How Windows games run on Apple silicon Macs with Hadron: community reports, ratings and settings.";

export interface PageMeta {
  path: string;
  title: string;
  description: string;
  render(template: string, base: string): string;
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function entryDescription(e: Entry): string {
  const s = summarize(e.reports);
  if (!s.rating) return `${e.name} on Hadron: no reports yet. Tried it? Add a report.`;
  const n = s.total === 1 ? "1 report" : `${s.total} reports`;
  return `${e.name} on Hadron: ${RATINGS[s.rating].label}. ${n}, latest from ${s.lastDate}.`;
}

function page(path: string, title: string, description: string, image?: string): PageMeta {
  return {
    path,
    title,
    description,
    render(template, base) {
      const url = SITE_URL + (path === "/" ? "/" : path);
      const tags = [
        `<meta property="og:type" content="website">`,
        `<meta property="og:site_name" content="HadronDB">`,
        `<meta property="og:title" content="${escape(title)}">`,
        `<meta property="og:description" content="${escape(description)}">`,
        ...(path === "/404" ? [] : [`<meta property="og:url" content="${url}">`, `<link rel="canonical" href="${url}">`]),
        ...(image ? [`<meta property="og:image" content="${escape(image)}">`] : []),
      ].join("\n    ");
      return template
        .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
        .replace(/(<meta name="description" content=")[^"]*(">)/, `$1${escape(description)}$2`)
        .replace("<!--page-meta-->", tags)
        .replace(/__BASE__/g, base);
    },
  };
}

export function pageMeta(root: string): PageMeta[] {
  const files = readDataFiles(root);
  const { entries } = loadCatalog(Object.fromEntries(files.map((f) => [f.path, f.json])));
  return [
    page("/", "HadronDB: Windows games on Apple silicon Macs", SITE_DESCRIPTION),
    page("/report", "How to report a game · HadronDB", "What a good HadronDB report says, and how to send one."),
    page("/about", "About · HadronDB", "What HadronDB and Hadron are, where the data comes from, and its licence."),
    page("/404", "Page not found · HadronDB", SITE_DESCRIPTION),
    ...entries.map((e) => page(e.path, `${e.name} · HadronDB`, entryDescription(e), e.image)),
  ];
}

export function sitemap(root: string): string {
  const urls = pageMeta(root)
    .filter((p) => p.path !== "/404")
    .map((p) => `  <url><loc>${SITE_URL}${p.path === "/" ? "/" : p.path}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vitest/config";
import { pageMeta, sitemap } from "./scripts/pages.ts";

const root = dirname(fileURLToPath(import.meta.url));

/**
 * GitHub Pages serves files, not routes. After the build this writes a copy of index.html for
 * every page the site has (dist/game/400/index.html, ...), each with its own title and
 * description, so that a link to any page loads with status 200 and shows a useful preview
 * where it is shared. 404.html, the same app, catches anything else and shows "not found".
 */
function staticPages(): Plugin {
  let outDir = "dist";
  let base = "/";
  return {
    name: "hadrondb-static-pages",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      base = config.base;
    },
    closeBundle() {
      const template = readFileSync(join(outDir, "index.html"), "utf8");
      for (const page of pageMeta(root)) {
        const html = page.render(template, base);
        if (page.path === "/404") {
          writeFileSync(join(outDir, "404.html"), html);
          continue;
        }
        const file = page.path === "/" ? join(outDir, "index.html") : join(outDir, page.path, "index.html");
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, html);
      }
      if (base === "/") writeFileSync(join(outDir, "sitemap.xml"), sitemap(root));
    },
  };
}

export default defineConfig({
  // Served from the root of hadrondb.com. Without the custom domain, Pages serves the site
  // under /hadrondb/: build with BASE_PATH=/hadrondb/ for that.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react(), tailwindcss(), staticPages()],
  resolve: { alias: { "@": resolve(root, "src") } },
  build: {
    rollupOptions: {
      output: {
        // React and the router change rarely; a chunk of their own stays cached when data changes.
        manualChunks: (id) => (/node_modules\/\.pnpm\/(react|react-dom|react-router|scheduler)@/.test(id) ? "react" : undefined),
      },
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});

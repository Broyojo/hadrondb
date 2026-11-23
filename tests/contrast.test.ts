import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARD_BACKGROUND, PAGE_BACKGROUND, RATING_COLORS, RATING_IDS } from "../src/lib/ratings.ts";
import { ROOT } from "./helpers.ts";

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("rating colours (WCAG 2.2)", () => {
  for (const theme of ["light", "dark"] as const) {
    for (const id of RATING_IDS) {
      const c = RATING_COLORS[theme][id];
      it(`${theme} ${id}: badge text is at least 4.5:1`, () => {
        expect(contrast(c.fg, c.bg)).toBeGreaterThanOrEqual(4.5);
      });
      it(`${theme} ${id}: bar colour is at least 3:1 on cards and the page`, () => {
        expect(contrast(c.solid, CARD_BACKGROUND[theme])).toBeGreaterThanOrEqual(3);
        expect(contrast(c.solid, PAGE_BACKGROUND[theme])).toBeGreaterThanOrEqual(3);
      });
    }
  }
});

describe("theme colours in index.css", () => {
  const css = readFileSync(`${ROOT}src/index.css`, "utf8");
  const block = (selector: string) => {
    const m = new RegExp(`${selector.replace(".", "\\.")} \\{([^}]*)\\}`).exec(css);
    if (!m) throw new Error(`no ${selector} block`);
    return Object.fromEntries([...m[1].matchAll(/--([a-z-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1], x[2]]));
  };
  const pairs: [string, string, number][] = [
    ["foreground", "background", 4.5],
    ["foreground", "card", 4.5],
    ["muted-foreground", "background", 4.5],
    ["muted-foreground", "card", 4.5],
    ["muted-foreground", "muted", 4.5],
    ["primary", "background", 4.5],
    ["primary", "card", 4.5],
    ["primary-foreground", "primary", 4.5],
    ["accent-foreground", "accent", 4.5],
    ["secondary-foreground", "secondary", 4.5],
    ["input", "card", 1.4],
  ];
  for (const [selector, theme] of [[":root", "light"], [".dark", "dark"]] as const) {
    const vars = block(selector);
    it(`${theme} page background matches ratings.ts`, () => {
      expect(vars.background.toLowerCase()).toBe(PAGE_BACKGROUND[theme].toLowerCase());
      expect(vars.card.toLowerCase()).toBe(CARD_BACKGROUND[theme].toLowerCase());
    });
    for (const [fg, bg, min] of pairs) {
      it(`${theme}: ${fg} on ${bg} is at least ${min}:1`, () => {
        expect(contrast(vars[fg], vars[bg])).toBeGreaterThanOrEqual(min);
      });
    }
  }
});

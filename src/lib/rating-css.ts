import { RATING_COLORS, RATING_IDS } from "./ratings.ts";

/** CSS custom properties for the rating colours, from the one table in ratings.ts. */
export function ratingCss(): string {
  const vars = (theme: "light" | "dark") =>
    RATING_IDS.map((id) => {
      const c = RATING_COLORS[theme][id];
      return `--rating-${id}-fg:${c.fg};--rating-${id}-bg:${c.bg};--rating-${id}-solid:${c.solid};`;
    }).join("");
  return `:root{${vars("light")}}.dark{${vars("dark")}}`;
}

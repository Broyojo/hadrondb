// HadronDB's five ratings, best first. The ids are what data files store; the labels and
// descriptions are what people read, on the site and in the report form.

export const RATING_IDS = ["perfect", "well", "issues", "unplayable", "broken"] as const;
export type RatingId = (typeof RATING_IDS)[number];

export interface RatingInfo {
  id: RatingId;
  /** Rank, 1 is best. */
  rank: number;
  label: string;
  /** One line, used in the report form's dropdown and next to the badge. */
  short: string;
  /** What a report with this rating means, for the "How to report" page. */
  description: string;
}

export const RATINGS: Record<RatingId, RatingInfo> = {
  perfect: {
    id: "perfect",
    rank: 1,
    label: "Runs perfectly",
    short: "Plays as it does on Windows, nothing to work around",
    description:
      "Played at length, start to finish or for several sessions, and nothing went wrong: it starts from Steam, " +
      "renders correctly, sounds right, runs at a steady frame rate, and quits cleanly. No settings needed.",
  },
  well: {
    id: "well",
    rank: 2,
    label: "Runs well",
    short: "Plays well; small issues, if any, that don't get in the way",
    description:
      "You can play it the way it is meant to be played. There may be a small issue (an occasional frame-rate dip, " +
      "a cosmetic glitch, a setting to change) that doesn't spoil the game, or it was only tried for a short while.",
  },
  issues: {
    id: "issues",
    rank: 3,
    label: "Playable with issues",
    short: "Playable, but with issues you will notice",
    description:
      "You can play it, but something gets in the way: stutter, a low frame rate, broken effects, a control that " +
      "doesn't work, crashes now and then, or a workaround you have to know about.",
  },
  unplayable: {
    id: "unplayable",
    rank: 4,
    label: "Starts but unplayable",
    short: "Starts, maybe reaches the menu, but can't be played",
    description:
      "The game starts and may get to its menu or into a level, but it can't be played: it crashes there, the " +
      "screen is broken, it won't take input, or the frame rate is far too low.",
  },
  broken: {
    id: "broken",
    rank: 5,
    label: "Doesn't run",
    short: "Doesn't start, or never gets to its menu",
    description:
      "Nothing playable happens: it doesn't start, it quits or hangs while loading, or it needs something Hadron " +
      "doesn't support, such as kernel-level anti-cheat.",
  },
};

export const RATING_LIST: RatingInfo[] = RATING_IDS.map((id) => RATINGS[id]);

export function ratingByLabel(label: string): RatingInfo | undefined {
  const l = label.trim().toLowerCase();
  return RATING_LIST.find((r) => r.label.toLowerCase() === l);
}

/** Colours per theme. `fg` on `bg` is the badge's text and must meet WCAG AA (4.5:1);
 * `solid` is used for bars and dots on the card background and must meet 3:1 (non-text contrast).
 * tests/ratings.test.ts checks both, in both themes. */
export interface RatingColors {
  fg: string;
  bg: string;
  solid: string;
}

export const RATING_COLORS: Record<"light" | "dark", Record<RatingId, RatingColors>> = {
  light: {
    perfect: { fg: "#1B3A9E", bg: "#E3EAFF", solid: "#3159D6" },
    well: { fg: "#14532D", bg: "#DCF5E4", solid: "#1F8A47" },
    issues: { fg: "#6B3E06", bg: "#FCF0C8", solid: "#B7791F" },
    unplayable: { fg: "#7C2D12", bg: "#FFE5D3", solid: "#D35A1E" },
    broken: { fg: "#7F1D1D", bg: "#FDE2E2", solid: "#C62828" },
  },
  dark: {
    perfect: { fg: "#CBD7FF", bg: "#1D2A57", solid: "#7C9CFF" },
    well: { fg: "#BDF2CF", bg: "#123521", solid: "#4CC97A" },
    issues: { fg: "#FCE9A6", bg: "#3A2E0A", solid: "#E3B53B" },
    unplayable: { fg: "#FFD5B8", bg: "#3F200D", solid: "#F08A4B" },
    broken: { fg: "#FFCACA", bg: "#431616", solid: "#F06C6C" },
  },
};

/** The card background each theme draws ratings on, for the non-text contrast check. */
export const CARD_BACKGROUND = { light: "#FFFFFF", dark: "#1A1D23" } as const;
/** The page background. */
export const PAGE_BACKGROUND = { light: "#F6F5F1", dark: "#111317" } as const;

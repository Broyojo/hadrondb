// Apple silicon chips, as reports name them: a family (M1 to M5) and a tier.

export const CHIP_FAMILIES = ["M1", "M2", "M3", "M4", "M5"] as const;
export type ChipFamily = (typeof CHIP_FAMILIES)[number];
export const CHIP_TIERS = ["", " Pro", " Max", " Ultra"] as const;

/** Chips Apple has not made, left out of the form's list. */
const NOT_MADE = new Set(["M4 Ultra"]);

/** Every chip the report form offers, in order: M1, M1 Pro, M1 Max, M1 Ultra, M2, ... */
export const CHIPS: string[] = CHIP_FAMILIES.flatMap((f) => CHIP_TIERS.map((t) => f + t)).filter((c) => !NOT_MADE.has(c));

export const CHIP_PATTERN = /^M[1-9]\d?( Pro| Max| Ultra)?$/;

export function chipFamily(chip: string | undefined): string | undefined {
  if (!chip) return undefined;
  const m = /^(M\d+)/.exec(chip);
  return m ? m[1] : undefined;
}

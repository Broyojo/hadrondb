import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));

export interface FormItem {
  type: string;
  id?: string;
  attributes: { label?: string; options?: (string | { label: string })[] };
  validations?: { required?: boolean };
}

export function formItems(): FormItem[] {
  const form = parse(readFileSync(`${ROOT}.github/ISSUE_TEMPLATE/game-report.yml`, "utf8")) as { body: FormItem[] };
  return form.body.filter((i) => i.type !== "markdown");
}

/** An issue body as GitHub writes it for a submitted form: each field's label as a "###"
 * heading, then the answer, or "_No response_" when it was left empty. Keys are form ids. */
export function issueBody(answers: Record<string, string | boolean>): string {
  return formItems()
    .map((item) => {
      const a = answers[item.id!];
      let value: string;
      if (item.type === "checkboxes") {
        const label = (item.attributes.options![0] as { label: string }).label;
        value = `- [${a ? "X" : " "}] ${label}`;
      } else {
        value = typeof a === "string" && a !== "" ? a : "_No response_";
      }
      return `### ${item.attributes.label}\n\n${value}`;
    })
    .join("\n\n");
}

export const GOOD_ANSWERS: Record<string, string | boolean> = {
  name: "Portal 2",
  "app-id": "620",
  rating: "Runs well: plays well; small issues, if any, that don't get in the way",
  "hadron-version": "Hadron 0.3.3",
  "graphics-api": "Direct3D 9",
  arch: "32-bit",
  "mac-model": "MacBook Air 13-inch (2024)",
  chip: "M3",
  ram: "16 GB",
  macos: "macOS 27.0.1",
  retina: "Off (RetinaMode=n)",
  "launch-options": "-novid",
  "game-settings": "1470x956, High",
  performance: "60 fps",
  issues: "- Intro video is black\n- Quitting takes a few seconds\n",
  notes: "Played the first chapter, about an hour.",
  links: "https://github.com/Broyojo/hadron/issues/177\nhttps://discord.com/channels/1/2/3",
  privacy: true,
};

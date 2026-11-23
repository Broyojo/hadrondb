import { z } from "zod";
import { ProgramSchema, SteamGameSchema } from "../src/lib/schema.ts";

const BASE = "https://hadrondb.com/schema/";

export function jsonSchemas(): Record<string, unknown> {
  const make = (schema: z.ZodType, file: string, title: string) => ({
    ...z.toJSONSchema(schema, { target: "draft-2020-12", io: "input" }),
    $id: BASE + file,
    title,
  });
  return {
    "game.schema.json": make(SteamGameSchema, "game.schema.json", "HadronDB Steam game"),
    "program.schema.json": make(ProgramSchema, "program.schema.json", "HadronDB program not on Steam"),
  };
}

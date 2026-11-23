// Writes the data files' JSON Schema to schema/, for editors (each data file names its schema
// in "$schema"). tests/schema.test.ts fails when the files in schema/ are out of date.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { jsonSchemas } from "./json-schemas.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
for (const [name, schema] of Object.entries(jsonSchemas())) {
  writeFileSync(`${root}schema/${name}`, JSON.stringify(schema, null, 2) + "\n");
  console.log(`wrote schema/${name}`);
}

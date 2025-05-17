import { type SchemaTypeDefinition } from "sanity";

import { startup } from "@/sanity/schemaTypes/startup";
import { author } from "@/sanity/schemaTypes/author";
import { playlist } from "@/sanity/schemaTypes/playlist";
import { service } from "@/sanity/schemaTypes/service";

// ✅ Export an array directly, not an object
export const schemaTypes: SchemaTypeDefinition[] = [
  author,
  startup,
  playlist,
  service,
];

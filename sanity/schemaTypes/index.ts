import { type SchemaTypeDefinition } from "sanity";

import { author } from "./author";
import { playlist } from "./playlist";
import { service } from "./service";
import { availability } from "./availability";
import { booking } from "./booking";
// ✅ Export an array directly, not an object
export const schemaTypes: SchemaTypeDefinition[] = [
  author,
  playlist,
  service,
  availability,
  booking,
];

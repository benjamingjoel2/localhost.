import { importAllLuma } from "./luma";
import { importAllMeetup } from "./meetup";
import { importAllEventbrite } from "./eventbrite";
import type { ImportResult } from "./common";

export const SOURCES = { luma: importAllLuma, meetup: importAllMeetup, eventbrite: importAllEventbrite } as const;

export async function importAll(only?: (keyof typeof SOURCES)[]): Promise<ImportResult[]> {
  const names = only?.length ? only : (Object.keys(SOURCES) as (keyof typeof SOURCES)[]);
  const out: ImportResult[] = [];
  for (const n of names) out.push(...(await SOURCES[n]()));
  return out;
}

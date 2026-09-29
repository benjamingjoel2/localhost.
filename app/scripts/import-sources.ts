// one-off / build-time import of every external source. never fails the build: errors are reported per city, not thrown.
import { importAll, SOURCES } from "../src/lib/sources";
import { prisma } from "../src/lib/db";
const only = process.argv.slice(2).filter((a) => a in SOURCES) as (keyof typeof SOURCES)[];
importAll(only).then((r) => console.log(JSON.stringify(r, null, 2))).catch((e) => console.error("import failed:", e?.message)).finally(() => prisma.$disconnect());

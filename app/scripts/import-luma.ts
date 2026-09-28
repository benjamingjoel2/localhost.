// one-off / build-time import. never fails the build: network errors are reported, not thrown.
import { importAllLuma } from "../src/lib/sources/luma";
import { prisma } from "../src/lib/db";
importAllLuma().then((r) => { console.log(JSON.stringify(r, null, 2)); }).catch((e) => console.error("luma import failed:", e?.message)).finally(() => prisma.$disconnect());

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function currentUser() {
  const s = await auth();
  if (!s?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: s.user.id } });
}

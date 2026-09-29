import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const githubEnabled = () => Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    // GitHub sign-in switches on when AUTH_GITHUB_ID and AUTH_GITHUB_SECRET are set. Same email as an earlier magic-link login links to that account.
    ...(githubEnabled() ? [GitHub({ allowDangerousEmailAccountLinking: true })] : []),
    Resend({
      apiKey: process.env.RESEND_API_KEY || "re_dev_placeholder",
      from: process.env.EMAIL_FROM ?? "Localhost <onboarding@resend.dev>",
      // In development without a Resend key, print the magic link instead of sending it.
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        if (!process.env.RESEND_API_KEY) {
          console.log(`\n[auth:dev] magic link for ${identifier}:\n${url}\n`);
          return;
        }
        const { Resend: R } = await import("resend");
        await new R(provider.apiKey!).emails.send({
          from: provider.from as string,
          to: identifier,
          subject: "your localhost sign-in link",
          html: `<p>click to sign in to localhost:</p><p><a href="${url}">${url}</a></p><p>if you didn't ask for this, ignore it.</p>`,
        });
      },
    }),
  ],
  pages: { signIn: "/login", verifyRequest: "/login?sent=1" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not signed in");
  return session.user as { id: string; email: string; name?: string | null };
}

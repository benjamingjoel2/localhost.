import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { auth } from "@/auth";
import "./globals.css";

export const dynamic = "force-dynamic";

const manrope = localFont({ src: "../../public/fonts/manrope-latin-variable.woff2", weight: "200 800", display: "swap" });

export const metadata: Metadata = {
  title: "localhost — tech events, irl",
  description: "the event platform built only for tech.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className={manrope.className}>
      <body>
        <header className="hdr">
          <Link className="logo" href="/">&gt;localhost</Link>
          <nav>
            <Link href="/">explore</Link>
            <Link href="/create">create event</Link>
            {session?.user ? <Link href="/me">{session.user.email?.split("@")[0]}</Link> : <Link href="/login">log in</Link>}
          </nav>
        </header>
        {children}
        <footer><span>© {new Date().getFullYear()} localhost</span><span>free for free events · 3.5% + 0.30 on paid tickets</span></footer>
      </body>
    </html>
  );
}

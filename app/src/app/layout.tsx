import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

export const dynamic = "force-dynamic";
const manrope = localFont({ src: "../../public/fonts/manrope-latin-variable.woff2", weight: "200 800", display: "swap" });
export const metadata: Metadata = { title: "localhost — tech events, irl", description: "every tech event in your city, in one feed. luma, meetup, eventbrite and the ones hosted here.", icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2317160f'/%3E%3Ctext x='10' y='46' font-family='Helvetica,Arial,sans-serif' font-size='40' font-weight='700' fill='%23f4f1ea'%3E%3E_%3C/text%3E%3C/svg%3E" } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={manrope.className}><body>{children}</body></html>;
}

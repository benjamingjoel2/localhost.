import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "localhost — every event in your city", description: "every event in your city, in one feed. luma, meetup, eventbrite and the ones sold here. tickets by crowdbuzz.", icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%230a0a0a'/%3E%3Ctext x='13' y='42' font-family='Helvetica,Arial,sans-serif' font-size='26' font-weight='800' fill='%23fff'%3E%3E_%3C/text%3E%3C/svg%3E" } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" />
      </head>
      <body>{children}<script dangerouslySetInnerHTML={{ __html: "document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'){t.style.display='none'}},true)" }} /></body>
    </html>
  );
}

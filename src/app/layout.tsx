import type { Metadata } from "next";
import { Space_Grotesk, Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "FearSignal",
  description: "Market sentiment dashboard using VIX, Fear & Greed, and put/call data.",
  other: { "color-scheme": "dark" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${rubik.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

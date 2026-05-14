import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FearSignal",
  description: "Market sentiment dashboard using VIX, Fear & Greed, and put/call data.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

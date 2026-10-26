import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ChatWidget from "@/components/ChatWidget";
import { BRAND, TAGLINE } from "@/lib/brand";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-ui",
});

export const metadata: Metadata = {
  title: `${BRAND}: ${TAGLINE}`,
  description: TAGLINE,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plexMono.variable}>
      <body>
        <Header />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Space_Grotesk,
} from "next/font/google";

import "leaflet/dist/leaflet.css";
import "./globals.css";

import { Toaster } from "@/components/ui/toast";
import { getBrandingSettings } from "@/lib/branding/get-branding-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

/* =========================================================
   DYNAMIC SITE METADATA
========================================================= */

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();

  return {
    title: {
      default: "Emirate Global",
      template: "%s | Emirate Global",
    },

    description:
      branding.tagline ?? "Fast, reliable and secure delivery services.",

    icons: branding.favicon_url
      ? {
          icon: branding.favicon_url,
        }
      : undefined,
  };
}

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getBrandingSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${display.variable} ${geistMono.variable} ${mono.variable} h-full antialiased`}
    >
      <body
        className="min-h-screen bg-slate-50"
        style={
          {
            "--brand-primary": branding.primary_color,
            "--brand-secondary": branding.secondary_color,
          } as React.CSSProperties
        }
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

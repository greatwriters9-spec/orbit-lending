import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { AppProviders } from "@/components/providers/app-providers";
import { SitePathwardBadge } from "@/components/brand/site-pathward-badge";
import { getSiteMetadata } from "@/lib/site/metadata";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = getSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body
        className={`${inter.className} min-h-full bg-brand-background font-sans text-foreground`}
      >
        <OrganizationJsonLd />
        <AppProviders>{children}</AppProviders>
        <SitePathwardBadge />
      </body>
    </html>
  );
}


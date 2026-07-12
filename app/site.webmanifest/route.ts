import { NextResponse } from "next/server";

import { getCompanyContext } from "@/lib/company/server";

export async function GET() {
  const { company, branding } = await getCompanyContext();
  const iconPath = company.favicon ?? "/icon";
  const logoPath = company.logo ?? "/orbit-mortgage-logo.png";

  return NextResponse.json({
    name: company.companyName,
    short_name: company.companyName,
    description: branding.tagline,
    start_url: "/",
    display: "standalone",
    background_color: company.backgroundColor ?? "#ffffff",
    theme_color: company.primaryColor ?? "#0a2463",
    icons: [
      { src: iconPath, sizes: "48x48", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: logoPath, sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  });
}

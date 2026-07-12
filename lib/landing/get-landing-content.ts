import type { BrandingConfig } from "@/types/branding-config";
import type { CompanyRecord, CompanySocialLinks } from "@/types/company";

export type LandingContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroEyebrow: string | null;
  whyEyebrow: string;
  whyTitle: string;
  whySubtitle: string;
  footerBlurb: string;
  copyrightText: string;
  whyNavLabel: string;
  finalCtaTitle: string;
  finalCtaSubtitle: string;
  activitySubtitle: string;
  testimonialsSubtitle: string;
  phoneNumber: string | null;
  socialLinks: Array<{ label: string; href: string }>;
};

function firstBrandWord(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function getCompanySocialLinks(company: CompanyRecord): Array<{ label: string; href: string }> {
  const entries: Array<[keyof CompanySocialLinks, string]> = [
    ["facebook", "Facebook"],
    ["instagram", "Instagram"],
    ["linkedin", "LinkedIn"],
    ["twitter", "X"],
    ["tiktok", "TikTok"],
    ["youtube", "YouTube"],
    ["threads", "Threads"],
    ["telegram", "Telegram"],
    ["whatsapp", "WhatsApp"],
  ];

  return entries.flatMap(([key, label]) => {
    const href = company[key];
    return href ? [{ label, href }] : [];
  });
}

export function getLandingContent(
  company: CompanyRecord,
  branding: BrandingConfig,
): LandingContent {
  const brandWord = firstBrandWord(company.companyName);

  return {
    heroTitle: company.heroTitle ?? "Home Financing Made Simple",
    heroSubtitle:
      company.heroSubtitle ??
      "Get pre-qualified in minutes.\nKnow exactly how much home you can afford.",
    heroButtonText: company.heroButtonText ?? "Get Pre-Qualified",
    heroEyebrow: company.tagline ?? branding.tagline,
    whyEyebrow: `Why ${brandWord}`,
    whyTitle: `Why Homebuyers Choose ${brandWord}`,
    whySubtitle:
      company.whyChooseUs ??
      company.aboutUs ??
      "Built for speed, transparency, and modern mortgage experiences.",
    footerBlurb:
      company.footerText ??
      `Premium digital mortgage financing with transparent terms, real-time application tracking, and banking infrastructure powered by ${branding.bankPartnerName}. Helping you achieve your homeownership goals.`,
    copyrightText:
      company.copyrightText ??
      `© ${new Date().getFullYear()} ${company.companyName}. All rights reserved.`,
    whyNavLabel: `Why ${brandWord}`,
    finalCtaTitle: "Ready To Move Forward?",
    finalCtaSubtitle:
      company.mission ??
      "Helping you achieve your homeownership goals. Get pre-qualified, track your mortgage application, and move forward with confidence.",
    activitySubtitle: `See how homebuyers move from pre-qualification to closing with ${company.companyName}.`,
    testimonialsSubtitle: `Real experiences from clients who chose ${company.companyName}.`,
    phoneNumber: company.phoneNumber,
    socialLinks: getCompanySocialLinks(company),
  };
}

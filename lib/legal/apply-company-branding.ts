import type { BrandingConfig } from "@/types/branding-config";
import type {
  LegalDocument,
  LegalListBlock,
  LegalSection,
  LegalSubsection,
} from "@/lib/legal/types";

function normalizeDomain(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
}

function applyBrandingToText(text: string, branding: BrandingConfig): string {
  const websiteDomain = normalizeDomain(branding.websiteDomain);
  const websiteWithWww = websiteDomain.startsWith("www.")
    ? websiteDomain
    : `www.${websiteDomain}`;

  return text
    .replace(/Orbitt Mortgage/g, branding.institutionName)
    .replace(/Orbit Mortgage/g, branding.institutionName)
    .replace(/www\.orbittmortgage\.com/gi, websiteWithWww)
    .replace(/www\.orbitmortgage\.com/gi, websiteWithWww)
    .replace(/orbittmortgage\.com/gi, websiteDomain)
    .replace(/orbitmortgage\.com/gi, websiteDomain);
}

function applyBrandingToList(
  list: LegalListBlock | undefined,
  branding: BrandingConfig,
): LegalListBlock | undefined {
  if (!list) {
    return undefined;
  }

  return {
    intro: list.intro ? applyBrandingToText(list.intro, branding) : undefined,
    items: list.items.map((item) => applyBrandingToText(item, branding)),
  };
}

function applyBrandingToSubsection(
  subsection: LegalSubsection,
  branding: BrandingConfig,
): LegalSubsection {
  return {
    ...subsection,
    title: applyBrandingToText(subsection.title, branding),
    paragraphs: subsection.paragraphs?.map((paragraph) =>
      applyBrandingToText(paragraph, branding),
    ),
    list: applyBrandingToList(subsection.list, branding),
    closingParagraphs: subsection.closingParagraphs?.map((paragraph) =>
      applyBrandingToText(paragraph, branding),
    ),
  };
}

function applyBrandingToSection(
  section: LegalSection,
  branding: BrandingConfig,
): LegalSection {
  return {
    ...section,
    title: applyBrandingToText(section.title, branding),
    paragraphs: section.paragraphs?.map((paragraph) =>
      applyBrandingToText(paragraph, branding),
    ),
    list: applyBrandingToList(section.list, branding),
    closingParagraphs: section.closingParagraphs?.map((paragraph) =>
      applyBrandingToText(paragraph, branding),
    ),
    subsections: section.subsections?.map((subsection) =>
      applyBrandingToSubsection(subsection, branding),
    ),
  };
}

export function applyCompanyBrandingToLegalDocument(
  document: LegalDocument,
  branding: BrandingConfig,
): LegalDocument {
  return {
    ...document,
    title: applyBrandingToText(document.title, branding),
    shortDescription: applyBrandingToText(document.shortDescription, branding),
    sections: document.sections.map((section) =>
      applyBrandingToSection(section, branding),
    ),
  };
}

export function applyCompanyBrandingToLegalCopy(
  text: string,
  branding: BrandingConfig,
): string {
  return applyBrandingToText(text, branding);
}

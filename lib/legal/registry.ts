import { contactInformation } from "@/lib/legal/documents/contact-information";
import { cookiePolicy } from "@/lib/legal/documents/cookie-policy";
import { electronicCommunicationsConsent } from "@/lib/legal/documents/electronic-communications-consent";
import { fairLendingStatement } from "@/lib/legal/documents/fair-lending-statement";
import { mortgageApplicationDisclosure } from "@/lib/legal/documents/mortgage-application-disclosure";
import { privacyPolicy } from "@/lib/legal/documents/privacy-policy";
import { termsOfUse } from "@/lib/legal/documents/terms-of-use";
import type { LegalDocument, LegalDocumentMeta } from "@/lib/legal/types";

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  termsOfUse,
  privacyPolicy,
  cookiePolicy,
  electronicCommunicationsConsent,
  mortgageApplicationDisclosure,
  fairLendingStatement,
  contactInformation,
];

export const LEGAL_DOCUMENTS_BY_SLUG: Record<string, LegalDocument> =
  Object.fromEntries(LEGAL_DOCUMENTS.map((doc) => [doc.slug, doc]));

export const LEGAL_DOCUMENT_META: LegalDocumentMeta[] = LEGAL_DOCUMENTS.map(
  ({ slug, title, shortDescription, lastUpdated }) => ({
    slug,
    title,
    shortDescription,
    lastUpdated,
  }),
);

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS_BY_SLUG[slug];
}

export function getLegalDocumentSlugs(): string[] {
  return LEGAL_DOCUMENTS.map((doc) => doc.slug);
}

export function getLegalTocItems(document: LegalDocument) {
  const items: { id: string; title: string; level: 2 | 3 }[] = [];

  for (const section of document.sections) {
    items.push({ id: section.id, title: section.title, level: 2 });
    for (const subsection of section.subsections ?? []) {
      items.push({ id: subsection.id, title: subsection.title, level: 3 });
    }
  }

  return items;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { applyCompanyBrandingToLegalDocument } from "@/lib/legal/apply-company-branding";
import { getLegalDocument, getLegalDocumentSlugs } from "@/lib/legal/registry";
import { getCompanyContext } from "@/lib/company/server";

type LegalDocumentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getLegalDocumentSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: LegalDocumentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const document = getLegalDocument(slug);

  if (!document) {
    return { title: "Legal Document" };
  }

  return {
    title: `${document.title}`,
    description: document.shortDescription,
  };
}

export default async function LegalDocumentPage({
  params,
}: LegalDocumentPageProps) {
  const { slug } = await params;
  const document = getLegalDocument(slug);

  if (!document) {
    notFound();
  }

  const { branding } = await getCompanyContext();
  const brandedDocument = applyCompanyBrandingToLegalDocument(document, branding);

  return <LegalDocumentView document={brandedDocument} />;
}

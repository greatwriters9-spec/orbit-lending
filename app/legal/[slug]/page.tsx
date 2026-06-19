import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocumentView } from "@/components/legal/legal-document-view";
import { getLegalDocument, getLegalDocumentSlugs } from "@/lib/legal/registry";

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
    return { title: "Legal Document | Orbit Mortgage" };
  }

  return {
    title: `${document.title} | Orbit Mortgage`,
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

  return <LegalDocumentView document={document} />;
}

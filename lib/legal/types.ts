export type LegalListBlock = {
  intro?: string;
  items: string[];
};

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: LegalListBlock;
  closingParagraphs?: string[];
  subsections?: LegalSubsection[];
};

export type LegalSubsection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: LegalListBlock;
  closingParagraphs?: string[];
};

export type LegalDocument = {
  slug: string;
  title: string;
  shortDescription: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export type LegalDocumentMeta = Pick<
  LegalDocument,
  "slug" | "title" | "shortDescription" | "lastUpdated"
>;

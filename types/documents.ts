export type ClientDocumentSource =
  | "application"
  | "document_request"
  | "payment_proof";

export type ClientDocument = {
  id: string;
  documentName: string;
  fileName: string;
  source: ClientDocumentSource;
  applicationId: string | null;
  applicationNumber: string | null;
  uploadedAt: string;
  downloadUrl: string | null;
};

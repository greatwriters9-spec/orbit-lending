import { createClient } from "@/lib/supabase/server";
import {
  APPLICATION_DOCUMENTS_BUCKET,
  createSignedDocumentUrl,
  extractStoragePathFromUrl,
  REPAYMENT_PROOFS_BUCKET,
} from "@/lib/documents/storage";
import type { ClientDocument } from "@/types/documents";

async function resolveDownloadUrl(
  fileUrl: string | null | undefined,
  bucket: string,
): Promise<string | null> {
  if (!fileUrl) {
    return null;
  }

  if (fileUrl.startsWith("http")) {
    const path = extractStoragePathFromUrl(fileUrl, bucket);
    if (path) {
      return createSignedDocumentUrl(bucket, path);
    }
    return fileUrl;
  }

  return createSignedDocumentUrl(bucket, fileUrl);
}

export async function fetchClientDocuments(
  userId: string,
): Promise<ClientDocument[]> {
  const supabase = await createClient();
  const documents: ClientDocument[] = [];

  const { data: applications } = await supabase
    .from("loan_applications")
    .select("id, application_number")
    .eq("user_id", userId);

  const applicationMap = new Map(
    (applications ?? []).map((app) => [app.id, app.application_number as string | null]),
  );
  const applicationIds = [...applicationMap.keys()];

  if (applicationIds.length > 0) {
    const { data: appDocs } = await supabase
      .from("loan_application_documents")
      .select("*")
      .in("application_id", applicationIds)
      .order("uploaded_at", { ascending: false });

    for (const doc of appDocs ?? []) {
      documents.push({
        id: doc.id,
        documentName: doc.document_name,
        fileName: doc.file_name,
        source: "application",
        applicationId: doc.application_id,
        applicationNumber: applicationMap.get(doc.application_id) ?? null,
        uploadedAt: doc.uploaded_at,
        downloadUrl: await resolveDownloadUrl(
          doc.file_url,
          APPLICATION_DOCUMENTS_BUCKET,
        ),
      });
    }

    const { data: requests } = await supabase
      .from("application_document_requests")
      .select("*")
      .in("application_id", applicationIds)
      .eq("fulfilled", true)
      .order("uploaded_at", { ascending: false });

    for (const request of requests ?? []) {
      if (!request.file_name) continue;

      const alreadyListed = documents.some(
        (item) =>
          item.applicationId === request.application_id &&
          item.fileName === request.file_name &&
          item.documentName === request.document_name,
      );

      if (alreadyListed) continue;

      documents.push({
        id: request.id,
        documentName: request.document_name,
        fileName: request.file_name,
        source: "document_request",
        applicationId: request.application_id,
        applicationNumber: applicationMap.get(request.application_id) ?? null,
        uploadedAt: request.uploaded_at ?? request.requested_at,
        downloadUrl: await resolveDownloadUrl(
          request.file_url,
          APPLICATION_DOCUMENTS_BUCKET,
        ),
      });
    }
  }

  const { data: repayments } = await supabase
    .from("loan_repayments")
    .select("id")
    .eq("borrower_id", userId);

  const repaymentIds = (repayments ?? []).map((row) => row.id);

  if (repaymentIds.length > 0) {
    const { data: submissions } = await supabase
      .from("payment_submissions")
      .select("id, proof_document_url, submitted_at, repayment_id")
      .in("repayment_id", repaymentIds)
      .not("proof_document_url", "is", null)
      .order("submitted_at", { ascending: false });

    for (const submission of submissions ?? []) {
      documents.push({
        id: submission.id,
        documentName: "Payment Proof",
        fileName: "Payment proof",
        source: "payment_proof",
        applicationId: null,
        applicationNumber: null,
        uploadedAt: submission.submitted_at,
        downloadUrl: await resolveDownloadUrl(
          submission.proof_document_url,
          REPAYMENT_PROOFS_BUCKET,
        ),
      });
    }
  }

  return documents.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export type DocumentReviewStatus =
  | "requested"
  | "pending_review"
  | "approved"
  | "rejected";

export type DocumentRequestRow = {
  id: string;
  document_name: string;
  description?: string | null;
  required?: boolean | null;
  fulfilled?: boolean | null;
  file_name?: string | null;
  file_url?: string | null;
  requested_at: string;
  due_date?: string | null;
  uploaded_at?: string | null;
  review_status?: string | null;
  application_id?: string;
};

export function resolveDocumentReviewStatus(
  row: Pick<DocumentRequestRow, "review_status" | "fulfilled" | "file_url">,
): DocumentReviewStatus {
  const explicit = row.review_status as DocumentReviewStatus | null | undefined;
  if (
    explicit === "requested" ||
    explicit === "pending_review" ||
    explicit === "approved" ||
    explicit === "rejected"
  ) {
    return explicit;
  }

  if (row.fulfilled) {
    return "approved";
  }

  if (row.file_url) {
    return "pending_review";
  }

  return "requested";
}

export function isDocumentOutstanding(status: DocumentReviewStatus): boolean {
  return status === "requested" || status === "rejected";
}

export function isDocumentPendingStaffReview(status: DocumentReviewStatus): boolean {
  return status === "pending_review";
}

export function isDocumentApproved(status: DocumentReviewStatus): boolean {
  return status === "approved";
}

export function mapDocumentRowsToReviewStatuses(
  rows: Array<Pick<DocumentRequestRow, "review_status" | "fulfilled" | "file_url">>,
): DocumentReviewStatus[] {
  return rows.map((row) => resolveDocumentReviewStatus(row));
}

export function hasOutstandingDocumentRequests(
  rows: Array<Pick<DocumentRequestRow, "review_status" | "fulfilled" | "file_url">>,
): boolean {
  return mapDocumentRowsToReviewStatuses(rows).some(isDocumentOutstanding);
}

export function hasPendingDocumentReview(
  rows: Array<Pick<DocumentRequestRow, "review_status" | "fulfilled" | "file_url">>,
): boolean {
  return mapDocumentRowsToReviewStatuses(rows).some(isDocumentPendingStaffReview);
}

export function allDocumentRequestsApproved(
  rows: Array<Pick<DocumentRequestRow, "review_status" | "fulfilled" | "file_url">>,
): boolean {
  if (rows.length === 0) {
    return true;
  }

  return mapDocumentRowsToReviewStatuses(rows).every(isDocumentApproved);
}

export function mapDocumentCenterStatus(
  status: DocumentReviewStatus,
): "required" | "pending" | "approved" | "rejected" {
  if (status === "approved") {
    return "approved";
  }
  if (status === "pending_review") {
    return "pending";
  }
  if (status === "rejected") {
    return "rejected";
  }
  return "required";
}

export function documentReviewStatusLabel(status: DocumentReviewStatus): string {
  switch (status) {
    case "requested":
      return "Required";
    case "pending_review":
      return "Under Review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Required";
  }
}

export function mapDocumentRequestRow(
  doc: DocumentRequestRow,
): {
  id: string;
  applicationId: string;
  documentName: string;
  description?: string;
  required: boolean;
  fulfilled: boolean;
  reviewStatus: DocumentReviewStatus;
  fileName?: string;
  requestedAt: string;
  dueDate?: string;
  uploadedAt?: string;
} {
  const reviewStatus = resolveDocumentReviewStatus(doc);

  return {
    id: doc.id,
    applicationId: doc.application_id ?? "",
    documentName: doc.document_name,
    description: doc.description ?? undefined,
    required: Boolean(doc.required ?? true),
    fulfilled: reviewStatus === "approved",
    reviewStatus,
    fileName: doc.file_name ?? undefined,
    requestedAt: doc.requested_at,
    dueDate: doc.due_date ?? undefined,
    uploadedAt: doc.uploaded_at ?? undefined,
  };
}

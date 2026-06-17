import { createClient } from "@/lib/supabase/server";
import { enrichApplicationDetail } from "@/lib/applications/mock-enrichment";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";
import type {
  ApplicationDetail,
  ApplicationMessage,
  ApplicationStatus,
  ApplicationStatusEntry,
  ApplicationSummary,
  DocumentRequest,
  LoanOffer,
} from "@/types/application-details";

type DbApplication = {
  id: string;
  application_number: string | null;
  loan_product_slug: string;
  requested_amount: number | null;
  selected_term_id: string | null;
  purpose: string | null;
  status: ApplicationStatus;
  personal_info: Record<string, unknown>;
  financial_info: Record<string, unknown>;
  requirement_documents: Record<
    string,
    { fileName?: string; fulfilled?: boolean; uploadedAt?: string }
  >;
  submitted_at: string | null;
  updated_at: string;
};

function mapSummary(row: DbApplication): ApplicationSummary {
  const product = getLoanProductBySlug(row.loan_product_slug);

  return {
    id: row.id,
    applicationNumber: row.application_number ?? "Pending",
    loanProductSlug: row.loan_product_slug,
    productName: product?.name ?? row.loan_product_slug,
    requestedAmount: Number(row.requested_amount ?? 0),
    status: row.status,
    submittedAt: row.submitted_at ?? undefined,
    updatedAt: row.updated_at,
    purpose: row.purpose ?? undefined,
  };
}

export async function fetchUserApplications(): Promise<ApplicationSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "draft")
    .order("updated_at", { ascending: false });

  return (data ?? []).map((row) => mapSummary(row as DbApplication));
}

export async function fetchApplicationDetail(
  applicationId: string,
): Promise<ApplicationDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: row } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .neq("status", "draft")
    .maybeSingle();

  if (!row) {
    return null;
  }

  const application = row as DbApplication;
  const summary = mapSummary(application);

  const [historyRes, messagesRes, docsRes, offersRes] = await Promise.all([
    supabase
      .from("application_status_history")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("application_messages")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: true }),
    supabase
      .from("application_document_requests")
      .select("*")
      .eq("application_id", applicationId)
      .order("requested_at", { ascending: true }),
    supabase
      .from("loan_offers")
      .select("*")
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false }),
  ]);

  const statusHistory: ApplicationStatusEntry[] = (historyRes.data ?? []).map(
    (entry) => ({
      id: entry.id,
      status: entry.status as ApplicationStatus,
      note: entry.note ?? undefined,
      createdAt: entry.created_at,
    }),
  );

  const messages: ApplicationMessage[] = (messagesRes.data ?? []).map((msg) => ({
    id: msg.id,
    applicationId: msg.application_id,
    senderId: msg.sender_id ?? undefined,
    senderRole: msg.sender_role as ApplicationMessage["senderRole"],
    senderName: msg.sender_name,
    message: msg.message,
    attachmentUrl: msg.attachment_url ?? undefined,
    createdAt: msg.created_at,
  }));

  const documentRequests: DocumentRequest[] = (docsRes.data ?? []).map(
    (doc) => ({
      id: doc.id,
      applicationId: doc.application_id,
      documentName: doc.document_name,
      description: doc.description ?? undefined,
      required: doc.required,
      fulfilled: doc.fulfilled,
      fileName: doc.file_name ?? undefined,
      requestedAt: doc.requested_at,
      dueDate: doc.due_date ?? undefined,
      uploadedAt: doc.uploaded_at ?? undefined,
    }),
  );

  const offers: LoanOffer[] = (offersRes.data ?? []).map((offer) => ({
    id: offer.id,
    applicationId: offer.application_id,
    requestedAmount: Number(offer.requested_amount),
    recommendedAmount: Number(offer.recommended_amount),
    finalAmount: Number(offer.final_amount),
    offeredInterestRate: Number(offer.offered_interest_rate),
    repaymentFrequency: offer.repayment_frequency,
    repaymentPeriod: offer.repayment_period,
    notes: offer.notes ?? undefined,
    acceptedByClient: offer.accepted_by_client,
    status: offer.status as LoanOffer["status"],
    expiresAt: offer.expires_at ?? undefined,
    createdAt: offer.created_at,
  }));

  const detail = enrichApplicationDetail(
    {
      ...summary,
      selectedTermId: application.selected_term_id ?? undefined,
      personalInfo: application.personal_info,
      financialInfo: application.financial_info,
    },
    { statusHistory, messages, documentRequests, offers },
  );

  const uploadedDocs = application.requirement_documents ?? {};
  detail.documentRequests = detail.documentRequests.map((request) => {
    const uploaded = uploadedDocs[request.id];
    if (!uploaded?.fulfilled) {
      return request;
    }

    return {
      ...request,
      fulfilled: true,
      fileName: uploaded.fileName ?? request.fileName,
      uploadedAt: uploaded.uploadedAt ?? request.uploadedAt,
    };
  });

  return detail;
}

export async function seedApplicationDetailsOnSubmit(
  applicationId: string,
  status: ApplicationStatus = "submitted",
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status,
    note: "Application submitted successfully and queued for review.",
  });

  await supabase.from("application_messages").insert({
    application_id: applicationId,
    sender_role: "system",
    sender_name: "Orbit Mortgage",
    message:
      "Your application has been received. A loan officer will review your submission within 24 hours.",
  });
}


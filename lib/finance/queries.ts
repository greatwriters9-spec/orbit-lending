import { createClient } from "@/lib/supabase/server";
import {
  mapDocumentRequestRow,
} from "@/lib/applications/document-request-status";
import { FINANCE_QUEUE_STATUSES } from "@/lib/applications/engine/statuses";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";
import type { ApplicationScores, ApplicationStatus } from "@/types/application-details";
import type {
  FinanceApplicationDetail,
  FinanceApplicationSummary,
  FinanceDashboardStats,
} from "@/types/finance";

type DbApplication = {
  id: string;
  user_id: string;
  application_number: string | null;
  loan_product_slug: string;
  requested_amount: number | null;
  approved_amount: number | null;
  selected_term_id: string | null;
  purpose: string | null;
  status: ApplicationStatus;
  personal_info: Record<string, unknown>;
  financial_info: Record<string, unknown>;
  submitted_at: string | null;
  updated_at: string;
};

function getApplicantName(personalInfo: Record<string, unknown>): string {
  const first = String(personalInfo.firstName ?? personalInfo.first_name ?? "");
  const last = String(personalInfo.lastName ?? personalInfo.last_name ?? "");
  const name = `${first} ${last}`.trim();
  return name || "Applicant";
}

function mapSummary(row: DbApplication): FinanceApplicationSummary {
  const product = getLoanProductBySlug(row.loan_product_slug);

  return {
    id: row.id,
    applicationNumber: row.application_number ?? "Pending",
    loanProductSlug: row.loan_product_slug,
    productName: product?.name ?? row.loan_product_slug,
    applicantName: getApplicantName(row.personal_info),
    requestedAmount: Number(row.requested_amount ?? 0),
    status: row.status,
    submittedAt: row.submitted_at ?? undefined,
    updatedAt: row.updated_at,
    purpose: row.purpose ?? undefined,
  };
}

const FINANCE_QUEUE = FINANCE_QUEUE_STATUSES;

export async function fetchFinanceDashboardStats(): Promise<FinanceDashboardStats> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loan_applications")
    .select("status, updated_at")
    .neq("status", "draft");

  const applications = data ?? [];
  const today = new Date().toDateString();

  return {
    pendingReview: applications.filter((a) =>
      ["submitted", "under_review"].includes(a.status),
    ).length,
    informationRequired: applications.filter(
      (a) => a.status === "information_required",
    ).length,
    pendingApproval: applications.filter(
      (a) =>
        a.status === "pending_finance_approval" || a.status === "offer_accepted",
    ).length,
    approvedToday: applications.filter(
      (a) =>
        a.status === "approved" &&
        new Date(a.updated_at).toDateString() === today,
    ).length,
  };
}

export async function fetchFinanceApplicationsQueue(
  statusFilter?: ApplicationStatus,
): Promise<FinanceApplicationSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("loan_applications")
    .select("*")
    .neq("status", "draft")
    .order("updated_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  } else {
    query = query.in("status", FINANCE_QUEUE);
  }

  const { data } = await query;
  return (data ?? []).map((row) => mapSummary(row as DbApplication));
}

export async function fetchFinanceApplicationDetail(
  applicationId: string,
): Promise<FinanceApplicationDetail | null> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", applicationId)
    .neq("status", "draft")
    .maybeSingle();

  if (!row) {
    return null;
  }

  const application = row as DbApplication;
  const summary = mapSummary(application);

  const { data: profile } = await supabase
    .from("profiles")
    .select("pathward_account_balance")
    .eq("id", application.user_id)
    .maybeSingle();

  const [historyRes, offersRes, notesRes, auditRes, docsRes, messagesRes, scoresRes] =
    await Promise.all([
      supabase
        .from("application_status_history")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("loan_offers")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("application_internal_notes")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("audit_logs")
        .select("*")
        .eq("entity_id", applicationId)
        .order("created_at", { ascending: false }),
      supabase
        .from("application_document_requests")
        .select("*")
        .eq("application_id", applicationId)
        .order("requested_at", { ascending: false }),
      supabase
        .from("application_messages")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("application_scores")
        .select("*")
        .eq("application_id", applicationId)
        .maybeSingle(),
    ]);

  const offerIds = (offersRes.data ?? []).map((offer) => offer.id);

  let offerAuditLogs: NonNullable<typeof auditRes.data> = [];
  if (offerIds.length > 0) {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_type", "loan_offer")
      .in("entity_id", offerIds)
      .order("created_at", { ascending: false });
    offerAuditLogs = data ?? [];
  }

  const auditById = new Map<string, NonNullable<typeof auditRes.data>[number]>();
  for (const log of auditRes.data ?? []) {
    auditById.set(log.id, log);
  }
  for (const log of offerAuditLogs) {
    auditById.set(log.id, log);
  }

  const mergedAuditLogs = [...auditById.values()].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const scoresRow = scoresRes.data;
  const scores: ApplicationScores | undefined = scoresRow
    ? {
        riskScore: Number(scoresRow.risk_score),
        incomeScore: Number(scoresRow.income_score),
        employmentScore: Number(scoresRow.employment_score),
        finalScore: Number(scoresRow.final_score),
        scoredAt: scoresRow.scored_at,
      }
    : undefined;

  return {
    ...summary,
    userId: application.user_id,
    approvedAmount: Number(application.approved_amount ?? 0) || undefined,
    pathwardBalance: Number(profile?.pathward_account_balance ?? 0),
    selectedTermId: application.selected_term_id ?? undefined,
    personalInfo: application.personal_info,
    financialInfo: application.financial_info,
    scores,
    statusHistory: (historyRes.data ?? []).map((entry) => ({
      id: entry.id,
      status: entry.status as ApplicationStatus,
      note: entry.note ?? undefined,
      createdAt: entry.created_at,
    })),
    offers: (offersRes.data ?? []).map((offer) => ({
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
      status: offer.status as FinanceApplicationDetail["offers"][0]["status"],
      expiresAt: offer.expires_at ?? undefined,
      createdAt: offer.created_at,
    })),
    internalNotes: (notesRes.data ?? []).map((note) => ({
      id: note.id,
      applicationId: note.application_id,
      authorId: note.author_id,
      authorName: note.author_name,
      note: note.note,
      createdAt: note.created_at,
    })),
    auditLogs: mergedAuditLogs.map((log) => ({
      id: log.id,
      userId: log.user_id ?? undefined,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      oldValues: log.old_values as Record<string, unknown> | undefined,
      newValues: log.new_values as Record<string, unknown> | undefined,
      createdAt: log.created_at,
    })),
    documentRequests: (docsRes.data ?? []).map((doc) => {
      const mapped = mapDocumentRequestRow(doc);
      return {
        id: mapped.id,
        documentName: mapped.documentName,
        description: mapped.description,
        required: mapped.required,
        fulfilled: mapped.fulfilled,
        reviewStatus: mapped.reviewStatus,
        fileName: mapped.fileName,
        requestedAt: mapped.requestedAt,
        dueDate: mapped.dueDate,
        uploadedAt: mapped.uploadedAt,
      };
    }),
    messages: (messagesRes.data ?? []).map((msg) => ({
      id: msg.id,
      senderRole: msg.sender_role,
      senderName: msg.sender_name,
      message: msg.message,
      createdAt: msg.created_at,
    })),
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getApplicationSnapshot,
  logApplicationAudit,
  scoreApplication,
  sendStaffMessage,
  transitionApplicationStatus,
} from "@/lib/applications/engine/processor";
import { allDocumentRequestsApproved } from "@/lib/applications/document-request-status";
import { notifyAdmin } from "@/lib/notifications/notify";
import { createClient } from "@/lib/supabase/server";
import type { FinanceActionState } from "@/types/finance";

const statusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum([
    "under_review",
    "pre_qualified",
    "pre_approved",
    "information_required",
    "pending_finance_approval",
    "approved",
    "rejected",
  ]),
  note: z.string().min(3, "Add a note explaining this status change."),
});

const noteSchema = z.object({
  applicationId: z.string().uuid(),
  note: z.string().min(3, "Note must be at least 3 characters."),
});

const messageSchema = z.object({
  applicationId: z.string().uuid(),
  message: z.string().min(3, "Message must be at least 3 characters."),
});

const requestDocumentSchema = z.object({
  name: z.string().min(2, "Document name is required."),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

const requestInfoSchema = z.object({
  applicationId: z.string().uuid(),
  documents: z.array(requestDocumentSchema).optional(),
  documentName: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  message: z.string().min(5),
});

const approveApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  approvedAmount: z.number().positive(),
  note: z.string().min(3, "Add a note explaining the approval."),
});

const offerSchema = z.object({
  applicationId: z.string().uuid(),
  requestedAmount: z.number().positive(),
  recommendedAmount: z.number().positive(),
  finalAmount: z.number().positive(),
  offeredInterestRate: z.number().min(0).max(100),
  repaymentFrequency: z.string().min(1),
  repaymentPeriod: z.number().int().positive(),
  notes: z.string().optional(),
});

async function getStaffName(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", userId)
    .maybeSingle();

  if (data?.first_name && data?.last_name) {
    return `${data.first_name} ${data.last_name}`;
  }

  return "Loan Officer";
}

function revalidateApplicationPaths(applicationId: string) {
  revalidatePath(`/finance/applications/${applicationId}`);
  revalidatePath("/finance/applications");
  revalidatePath("/finance/dashboard");
  revalidatePath(`/dashboard/loans/${applicationId}`);
}

const eligibilitySchema = z.object({
  applicationId: z.string().uuid(),
  eligibleAmount: z.number().positive(),
  note: z.string().min(3, "Add a note explaining the eligibility decision."),
});

export async function setMortgageEligibilityAction(
  input: z.infer<typeof eligibilitySchema>,
): Promise<FinanceActionState> {
  const parsed = eligibilitySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await getApplicationSnapshot(parsed.data.applicationId);
  if (!existing) {
    return { error: "Application not found." };
  }

  const result = await transitionApplicationStatus(
    parsed.data.applicationId,
    "pre_qualified",
    {
      note: parsed.data.note,
      auditAction: "application.eligibility_set",
      auditOldValues: {
        status: existing.status,
        approvedAmount: existing.approved_amount,
      },
      auditNewValues: {
        eligibleAmount: parsed.data.eligibleAmount,
        note: parsed.data.note,
      },
      systemMessage: `Your mortgage eligibility has been confirmed at $${parsed.data.eligibleAmount.toLocaleString()}. This amount reflects what you may qualify for — continue your application to proceed toward approval and funding.`,
      extraUpdates: { approved_amount: parsed.data.eligibleAmount },
    },
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidateApplicationPaths(parsed.data.applicationId);
  revalidatePath("/dashboard");
  return { success: "Mortgage eligibility amount set." };
}

export async function updateApplicationStatusAction(
  input: z.infer<typeof statusSchema>,
): Promise<FinanceActionState> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await transitionApplicationStatus(
    parsed.data.applicationId,
    parsed.data.status,
    { note: parsed.data.note },
  );

  if (result.error) {
    return { error: result.error };
  }

  if (parsed.data.status === "rejected") {
    const snapshot = await getApplicationSnapshot(parsed.data.applicationId);
    void notifyAdmin({
      event: "APPLICATION_REJECTED",
      severity: "high",
      payload: {
        applicationId: snapshot?.application_number ?? parsed.data.applicationId,
        message: parsed.data.note,
      },
      entityType: "application",
      entityId: parsed.data.applicationId,
      dashboardUrl: `/finance/applications/${parsed.data.applicationId}`,
    });
  }

  revalidateApplicationPaths(parsed.data.applicationId);
  return { success: "Application status updated." };
}

export async function addInternalNoteAction(
  input: z.infer<typeof noteSchema>,
): Promise<FinanceActionState> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const authorName = await getStaffName(supabase, user.id);

  const { error } = await supabase.from("application_internal_notes").insert({
    application_id: parsed.data.applicationId,
    author_id: user.id,
    author_name: authorName,
    note: parsed.data.note,
  });

  if (error) {
    return { error: error.message };
  }

  await logApplicationAudit(supabase, user.id, {
    action: "application.internal_note_added",
    entityType: "loan_application",
    entityId: parsed.data.applicationId,
    newValues: { note: parsed.data.note },
  });

  revalidateApplicationPaths(parsed.data.applicationId);
  return { success: "Internal note added." };
}

export async function sendFinanceMessageAction(
  input: z.infer<typeof messageSchema>,
): Promise<FinanceActionState> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const senderName = await getStaffName(supabase, user.id);
  const result = await sendStaffMessage(
    parsed.data.applicationId,
    parsed.data.message,
    senderName,
    "finance",
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidateApplicationPaths(parsed.data.applicationId);
  return { success: "Message sent to applicant." };
}

export async function requestInformationAction(
  input: z.infer<typeof requestInfoSchema>,
): Promise<FinanceActionState> {
  const parsed = requestInfoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const existing = await getApplicationSnapshot(parsed.data.applicationId);
  if (!existing) {
    return { error: "Application not found." };
  }

  const senderName = await getStaffName(supabase, user.id);
  const legacyDocumentName = parsed.data.documentName?.trim();
  const legacyDescription = parsed.data.description?.trim();
  const requestedDocuments =
    parsed.data.documents?.length
      ? parsed.data.documents
      : legacyDocumentName
        ? [
            {
              name: legacyDocumentName,
              description: legacyDescription || undefined,
              dueDate: parsed.data.dueDate,
            },
          ]
        : [];

  if (requestedDocuments.length > 0) {
    const { error: docError } = await supabase
      .from("application_document_requests")
      .insert(
        requestedDocuments.map((document) => ({
          application_id: parsed.data.applicationId,
          document_name: document.name.trim(),
          description: document.description?.trim() || null,
          required: true,
          due_date: document.dueDate || parsed.data.dueDate || null,
          review_status: "requested",
        })),
      );

    if (docError) {
      return { error: docError.message };
    }
  }

  await sendStaffMessage(
    parsed.data.applicationId,
    parsed.data.message,
    senderName,
    "finance",
  );

  const keepCurrentStatus = ["approved", "funded", "active"].includes(
    existing.status,
  );
  const documentNames = requestedDocuments.map((document) => document.name.trim());

  if (keepCurrentStatus) {
    await logApplicationAudit(supabase, user.id, {
      action: "application.information_requested",
      entityType: "loan_application",
      entityId: parsed.data.applicationId,
      oldValues: { status: existing.status },
      newValues: {
        documentNames,
        message: parsed.data.message,
        statusUnchanged: true,
      },
    });

    if (requestedDocuments.length > 0) {
      const { sendTimelineEmail } = await import("@/lib/email/hooks");
      const { data: applicationRow } = await supabase
        .from("loan_applications")
        .select("user_id")
        .eq("id", parsed.data.applicationId)
        .maybeSingle();

      if (applicationRow?.user_id) {
        void sendTimelineEmail({
          userId: applicationRow.user_id,
          template: "additional_documents_required",
          data: {
            actionUrl: `/dashboard/loans/${parsed.data.applicationId}`,
            message: parsed.data.message,
            documentNames: documentNames.join(", "),
          },
        });
      }
    }
  } else {
    const result = await transitionApplicationStatus(
      parsed.data.applicationId,
      "information_required",
      {
        note:
          documentNames.length > 0
            ? `Documents requested: ${documentNames.join(", ")}`
            : parsed.data.message,
        auditAction: "application.information_requested",
        auditOldValues: { status: existing.status },
        auditNewValues: {
          documentNames,
          message: parsed.data.message,
        },
        skipValidation: existing.status === "information_required",
        emailData: {
          documentNames: documentNames.join(", "),
          message: parsed.data.message,
        },
      },
    );

    if (result.error) {
      return { error: result.error };
    }
  }

  revalidateApplicationPaths(parsed.data.applicationId);
  return { success: "Information request sent to applicant." };
}

export async function approveApplicationAction(
  input: z.infer<typeof approveApplicationSchema>,
): Promise<FinanceActionState> {
  const parsed = approveApplicationSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await getApplicationSnapshot(parsed.data.applicationId);
  if (!existing) {
    return { error: "Application not found." };
  }

  if (["rejected", "defaulted", "completed", "funded", "active"].includes(existing.status)) {
    return { error: "This application can no longer be approved." };
  }

  const supabase = await createClient();
  const { data: documentRows } = await supabase
    .from("application_document_requests")
    .select("review_status, fulfilled, file_url")
    .eq("application_id", parsed.data.applicationId);

  if (!allDocumentRequestsApproved(documentRows ?? [])) {
    return {
      error:
        "Approve or review all requested documents before approving the mortgage application.",
    };
  }

  const result = await transitionApplicationStatus(
    parsed.data.applicationId,
    "approved",
    {
      note: parsed.data.note,
      auditAction: "application.approved",
      auditOldValues: {
        status: existing.status,
        approvedAmount: existing.approved_amount,
      },
      auditNewValues: {
        approvedAmount: parsed.data.approvedAmount,
        note: parsed.data.note,
      },
      systemMessage: `Your mortgage application has been approved for $${parsed.data.approvedAmount.toLocaleString()}. We may request additional documents before funding — check your messages and document requests for next steps.`,
      extraUpdates: { approved_amount: parsed.data.approvedAmount },
      skipValidation: false,
    },
  );

  if (result.error) {
    return { error: result.error };
  }

  void notifyAdmin({
    event: "APPLICATION_APPROVED",
    severity: "high",
    payload: {
      applicationId: existing.application_number ?? parsed.data.applicationId,
      amount: parsed.data.approvedAmount,
    },
    entityType: "application",
    entityId: parsed.data.applicationId,
    dashboardUrl: `/finance/applications/${parsed.data.applicationId}`,
  });

  revalidateApplicationPaths(parsed.data.applicationId);
  revalidatePath("/finance/funding");
  revalidatePath("/dashboard");
  return { success: "Application approved." };
}

export async function saveOfferAction(
  input: z.infer<typeof offerSchema>,
): Promise<FinanceActionState> {
  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const existing = await getApplicationSnapshot(parsed.data.applicationId);
  if (!existing) {
    return { error: "Application not found." };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const { data: offer, error } = await supabase
    .from("loan_offers")
    .insert({
      application_id: parsed.data.applicationId,
      requested_amount: parsed.data.requestedAmount,
      recommended_amount: parsed.data.recommendedAmount,
      final_amount: parsed.data.finalAmount,
      offered_interest_rate: parsed.data.offeredInterestRate,
      repayment_frequency: parsed.data.repaymentFrequency,
      repayment_period: parsed.data.repaymentPeriod,
      notes: parsed.data.notes ?? null,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const offerMessage = `A mortgage offer of $${parsed.data.finalAmount.toLocaleString()} at ${parsed.data.offeredInterestRate}% APR over ${parsed.data.repaymentPeriod} months has been prepared. Please review and accept or decline.`;

  const result = await transitionApplicationStatus(
    parsed.data.applicationId,
    "offer_sent",
    {
      note: "Mortgage offer sent to client for review.",
      auditAction: "application.offer_created",
      auditEntityType: "loan_offer",
      auditEntityId: offer.id,
      auditOldValues: {
        requestedAmount: existing.requested_amount,
        status: existing.status,
      },
      auditNewValues: parsed.data,
      systemMessage: offerMessage,
      extraUpdates: { requested_amount: parsed.data.finalAmount },
      skipValidation: true,
    },
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidateApplicationPaths(parsed.data.applicationId);
  return { success: "Mortgage offer saved and sent for client review." };
}

export async function approveFundingAction(
  applicationId: string,
  note: string,
): Promise<FinanceActionState> {
  const existing = await getApplicationSnapshot(applicationId);
  if (!existing) {
    return { error: "Application not found." };
  }

  const supabase = await createClient();
  const { data: offer } = await supabase
    .from("loan_offers")
    .select("final_amount")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const approvedAmount = Number(
    existing.approved_amount ??
      offer?.final_amount ??
      existing.requested_amount ??
      0,
  );

  return approveApplicationAction({
    applicationId,
    approvedAmount,
    note: note || "Application approved by Loan Officer.",
  });
}

export async function rejectFundingAction(
  applicationId: string,
  note: string,
): Promise<FinanceActionState> {
  return updateApplicationStatusAction({
    applicationId,
    status: "rejected",
    note: note || "Funding rejected by Loan Officer.",
  });
}

export async function recalculateScoresAction(
  applicationId: string,
): Promise<FinanceActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const result = await scoreApplication(applicationId, user.id);
  if (result.error) {
    return { error: result.error };
  }

  revalidateApplicationPaths(applicationId);
  return { success: "Application scores recalculated." };
}

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

const requestInfoSchema = z.object({
  applicationId: z.string().uuid(),
  documentName: z.string().min(2),
  description: z.string().min(5),
  dueDate: z.string().optional(),
  message: z.string().min(5),
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

  const { error: docError } = await supabase
    .from("application_document_requests")
    .insert({
      application_id: parsed.data.applicationId,
      document_name: parsed.data.documentName,
      description: parsed.data.description,
      required: true,
      due_date: parsed.data.dueDate || null,
    });

  if (docError) {
    return { error: docError.message };
  }

  await sendStaffMessage(
    parsed.data.applicationId,
    parsed.data.message,
    senderName,
    "finance",
  );

  const result = await transitionApplicationStatus(
    parsed.data.applicationId,
    "information_required",
    {
      note: `Document requested: ${parsed.data.documentName}`,
      auditAction: "application.information_requested",
      auditOldValues: { status: existing.status },
      auditNewValues: {
        documentName: parsed.data.documentName,
        message: parsed.data.message,
      },
    },
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidateApplicationPaths(parsed.data.applicationId);
  return { success: "Information request sent to applicant." };
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
    offer?.final_amount ?? existing.requested_amount ?? 0,
  );

  if (approvedAmount <= 0) {
    return { error: "Cannot approve without a valid approved amount." };
  }

  const result = await transitionApplicationStatus(applicationId, "approved", {
    note: note || "Funding approved by Loan Officer.",
    auditAction: "application.funding_approved",
    auditOldValues: {
      status: existing.status,
      approvedAmount: existing.approved_amount,
    },
    auditNewValues: { approvedAmount, note },
    systemMessage:
      "Your mortgage application has been approved. Your approved loan amount will be funded to your account. Deposit your required down payment into your Pathward Funding Account once it is set up — we will email you with next steps.",
    extraUpdates: { approved_amount: approvedAmount },
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidateApplicationPaths(applicationId);
  revalidatePath("/finance/funding");
  return { success: "Application approved for funding." };
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

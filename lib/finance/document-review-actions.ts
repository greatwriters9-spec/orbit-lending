"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  allDocumentRequestsApproved,
  resolveDocumentReviewStatus,
} from "@/lib/applications/document-request-status";
import {
  getApplicationSnapshot,
  logApplicationAudit,
  sendStaffMessage,
  transitionApplicationStatus,
} from "@/lib/applications/engine/processor";
import { createClient } from "@/lib/supabase/server";
import type { FinanceActionState } from "@/types/finance";

const reviewDocumentSchema = z.object({
  applicationId: z.string().uuid(),
  requestId: z.string().uuid(),
  note: z.string().optional(),
});

function revalidateDocumentPaths(applicationId: string) {
  revalidatePath(`/finance/applications/${applicationId}`);
  revalidatePath("/finance/applications");
  revalidatePath(`/dashboard/loans/${applicationId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/documents");
}

async function maybeAdvanceAfterDocumentReviews(
  applicationId: string,
): Promise<void> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("application_document_requests")
    .select("review_status, fulfilled, file_url")
    .eq("application_id", applicationId);

  if (!allDocumentRequestsApproved(rows ?? [])) {
    return;
  }

  const snapshot = await getApplicationSnapshot(applicationId);
  if (!snapshot || snapshot.status !== "information_required") {
    return;
  }

  await transitionApplicationStatus(applicationId, "under_review", {
    note: "All requested documents reviewed and approved.",
    systemMessage:
      "Your uploaded documents have been approved. Your application is back under review.",
    skipValidation: true,
  });
}

export async function approveDocumentRequestAction(
  input: z.infer<typeof reviewDocumentSchema>,
): Promise<FinanceActionState> {
  const parsed = reviewDocumentSchema.safeParse(input);
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

  const { data: request, error: fetchError } = await supabase
    .from("application_document_requests")
    .select("id, application_id, document_name, review_status, fulfilled, file_url")
    .eq("id", parsed.data.requestId)
    .eq("application_id", parsed.data.applicationId)
    .maybeSingle();

  if (fetchError || !request) {
    return { error: "Document request not found." };
  }

  const reviewStatus = resolveDocumentReviewStatus(request);
  if (reviewStatus !== "pending_review") {
    return { error: "Only uploaded documents awaiting review can be approved." };
  }

  const { error: updateError } = await supabase
    .from("application_document_requests")
    .update({
      review_status: "approved",
      fulfilled: true,
    })
    .eq("id", parsed.data.requestId);

  if (updateError) {
    return { error: updateError.message };
  }

  await logApplicationAudit(supabase, user.id, {
    action: "application.document_approved",
    entityType: "loan_application",
    entityId: parsed.data.applicationId,
    newValues: {
      requestId: parsed.data.requestId,
      documentName: request.document_name,
      note: parsed.data.note ?? null,
    },
  });

  const note = parsed.data.note?.trim();
  if (note) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    const senderName =
      profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : "Loan Officer";

    await sendStaffMessage(
      parsed.data.applicationId,
      note,
      senderName,
      "finance",
    );
  }

  await maybeAdvanceAfterDocumentReviews(parsed.data.applicationId);
  revalidateDocumentPaths(parsed.data.applicationId);
  return { success: `${request.document_name} approved.` };
}

export async function rejectDocumentRequestAction(
  input: z.infer<typeof reviewDocumentSchema> & { reason: string },
): Promise<FinanceActionState> {
  const parsed = reviewDocumentSchema
    .extend({
      reason: z.string().min(3, "Provide a reason for rejection."),
    })
    .safeParse(input);

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

  const { data: request, error: fetchError } = await supabase
    .from("application_document_requests")
    .select("id, application_id, document_name, review_status, fulfilled, file_url")
    .eq("id", parsed.data.requestId)
    .eq("application_id", parsed.data.applicationId)
    .maybeSingle();

  if (fetchError || !request) {
    return { error: "Document request not found." };
  }

  const reviewStatus = resolveDocumentReviewStatus(request);
  if (reviewStatus !== "pending_review") {
    return { error: "Only uploaded documents awaiting review can be rejected." };
  }

  const { error: updateError } = await supabase
    .from("application_document_requests")
    .update({
      review_status: "rejected",
      fulfilled: false,
      file_name: null,
      file_url: null,
      uploaded_at: null,
    })
    .eq("id", parsed.data.requestId);

  if (updateError) {
    return { error: updateError.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const senderName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : "Loan Officer";

  await sendStaffMessage(
    parsed.data.applicationId,
    `Your ${request.document_name} was rejected and needs to be re-uploaded. Reason: ${parsed.data.reason}`,
    senderName,
    "finance",
  );

  await logApplicationAudit(supabase, user.id, {
    action: "application.document_rejected",
    entityType: "loan_application",
    entityId: parsed.data.applicationId,
    newValues: {
      requestId: parsed.data.requestId,
      documentName: request.document_name,
      reason: parsed.data.reason,
    },
  });

  const snapshot = await getApplicationSnapshot(parsed.data.applicationId);
  if (
    snapshot &&
    !["information_required", "approved", "funded", "active"].includes(snapshot.status)
  ) {
    await transitionApplicationStatus(parsed.data.applicationId, "information_required", {
      note: `Document rejected: ${request.document_name}`,
      systemMessage: `Please re-upload ${request.document_name}. ${parsed.data.reason}`,
      skipValidation: true,
    });
  }

  revalidateDocumentPaths(parsed.data.applicationId);
  return { success: `${request.document_name} rejected. The client can upload again.` };
}

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { parseDownPaymentMeta } from "@/lib/dashboard/mortgage-journey";
import { createNotification } from "@/lib/wallet/notifications";
import { creditPathwardAccountBalance } from "@/lib/wallet/pathward-closing";
import type { DownPaymentMeta } from "@/types/mortgage-dashboard";
export type DownPaymentActionState = {
  error?: string;
  success?: string;
};

export async function submitDownPaymentVerificationAction(
  applicationId: string,
): Promise<DownPaymentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("id, user_id, personal_info, status")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  if (!["approved", "funded"].includes(application.status)) {
    return {
      error:
        "Down payment can only be submitted after your mortgage application is approved.",
    };
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const existing = parseDownPaymentMeta(personalInfo);
  const onboarding = personalInfo.onboarding as
    | { preQualification?: { estimatedDownPayment?: number } }
    | undefined;
  const requiredAmount =
    existing?.requiredAmount ??
    onboarding?.preQualification?.estimatedDownPayment ??
    0;

  const downPayment: DownPaymentMeta = {
    status: "pending_verification",
    requiredAmount,
    verificationRequestedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("loan_applications")
    .update({
      personal_info: {
        ...personalInfo,
        downPayment,
      },
    })
    .eq("id", applicationId);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("application_status_history").insert({
    application_id: applicationId,
    status: application.status,
    note: "Customer submitted down payment for verification.",
    changed_by: user.id,
  });

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["super_admin", "admin", "finance_officer"]);

  for (const admin of admins ?? []) {
    await createNotification({
      userId: admin.id,
      title: "Down Payment Verification Request",
      message: `A customer submitted a down payment verification request for application ${applicationId.slice(0, 8).toUpperCase()}.`,
      type: "application_update",
      metadata: { applicationId, userId: user.id },
    });
  }

  await createNotification({
    userId: user.id,
    title: "Deposit Submitted for Verification",
    message:
      "Your down payment has been submitted for review. Orbit Mortgage will verify your deposit shortly.",
    type: "application_update",
    metadata: { applicationId },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/loans/${applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/finance/applications");

  return { success: "Down payment submitted for verification." };
}

export async function reviewDownPaymentVerificationAction(input: {
  applicationId: string;
  decision: "approve" | "reject" | "request_proof";
  reason?: string;
}): Promise<DownPaymentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["super_admin", "admin", "finance_officer"].includes(profile.role)) {
    return { error: "You do not have permission to review down payments." };
  }

  const { data: application } = await supabase
    .from("loan_applications")
    .select("id, user_id, personal_info, status")
    .eq("id", input.applicationId)
    .maybeSingle();

  if (!application) {
    return { error: "Application not found." };
  }

  const personalInfo = (application.personal_info ?? {}) as Record<string, unknown>;
  const existing = parseDownPaymentMeta(personalInfo);
  const requiredAmount = existing?.requiredAmount ?? 0;
  const alreadyCredited = Number(existing?.pathwardCreditApplied ?? 0);

  const downPayment: DownPaymentMeta =
    input.decision === "approve"
      ? {
          status: "verified",
          requiredAmount,
          verificationRequestedAt: existing?.verificationRequestedAt,
          verifiedAt: new Date().toISOString(),
          verifiedBy: user.id,
          pathwardCreditApplied: alreadyCredited,
        }
      : input.decision === "reject"
        ? {
            status: "rejected",
            requiredAmount,
            verificationRequestedAt: existing?.verificationRequestedAt,
            rejectedReason: input.reason ?? "Deposit could not be verified.",
            pathwardCreditApplied: alreadyCredited,
          }
        : {
            status: "fully_funded",
            requiredAmount,
            verificationRequestedAt: existing?.verificationRequestedAt,
            rejectedReason: input.reason ?? "Additional proof requested.",
            pathwardCreditApplied: alreadyCredited,
          };

  if (input.decision === "approve" && existing?.status !== "verified") {
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select(
        "pathward_routing_number, pathward_account_number, pathward_account_balance",
      )
      .eq("id", application.user_id)
      .maybeSingle();

    if (
      !clientProfile?.pathward_routing_number ||
      !clientProfile?.pathward_account_number
    ) {
      return {
        error:
          "Link the client's Pathward account before verifying the down payment.",
      };
    }

    const currentPathwardBalance = Number(clientProfile.pathward_account_balance ?? 0);

    if (alreadyCredited < requiredAmount && requiredAmount > 0) {
      const depositAlreadyRecorded =
        currentPathwardBalance >= requiredAmount && alreadyCredited === 0;

      if (depositAlreadyRecorded) {
        downPayment.pathwardCreditApplied = requiredAmount;
      } else {
        const creditAmount = Math.max(0, requiredAmount - alreadyCredited);
        const creditResult = await creditPathwardAccountBalance(
          supabase,
          application.user_id,
          creditAmount,
        );

        if (creditResult.error) {
          return { error: creditResult.error };
        }

        downPayment.pathwardCreditApplied = alreadyCredited + creditResult.credited;
      }
    } else if (requiredAmount > 0) {
      downPayment.pathwardCreditApplied = requiredAmount;
    }
  }

  const { error } = await supabase
    .from("loan_applications")
    .update({
      personal_info: {
        ...personalInfo,
        downPayment,
      },
    })
    .eq("id", input.applicationId);

  if (error) {
    return { error: error.message };
  }

  const note =
    input.decision === "approve"
      ? downPayment.pathwardCreditApplied &&
        downPayment.pathwardCreditApplied > alreadyCredited
        ? `Down payment verified. $${(downPayment.pathwardCreditApplied - alreadyCredited).toFixed(2)} added to Pathward closing funds.`
        : downPayment.pathwardCreditApplied
          ? "Down payment verified and included in Pathward closing funds."
          : "Down payment verified by Orbit Mortgage."
      : input.decision === "reject"
        ? `Down payment rejected: ${input.reason ?? "Could not verify deposit."}`
        : `Additional proof requested: ${input.reason ?? "Please upload supporting documents."}`;

  await supabase.from("application_status_history").insert({
    application_id: input.applicationId,
    status: application.status,
    note,
    changed_by: user.id,
  });

  await createNotification({
    userId: application.user_id,
    title:
      input.decision === "approve"
        ? "Down Payment Verified"
        : input.decision === "reject"
          ? "Down Payment Verification Failed"
          : "Additional Proof Required",
    message:
      input.decision === "approve"
        ? `${note} Your verified down payment is now included in your Pathward closing balance toward the seller transfer.`
        : note,
    type: "application_update",
    metadata: { applicationId: input.applicationId, decision: input.decision },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/loans/${input.applicationId}`);
  revalidatePath(`/finance/applications/${input.applicationId}`);
  revalidatePath(`/admin/applications`);
  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");

  return {
    success:
      input.decision === "approve"
        ? "Down payment verified."
        : input.decision === "reject"
          ? "Down payment rejected."
          : "Additional proof requested.",
  };
}

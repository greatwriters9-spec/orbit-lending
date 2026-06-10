"use server";

import { revalidatePath } from "next/cache";

import {
  logApplicationAudit,
  transitionApplicationStatus,
} from "@/lib/applications/engine/processor";
import { uploadApplicationDocumentFile } from "@/lib/documents/storage";
import { createClient } from "@/lib/supabase/server";
import type { ApplicationActionState } from "@/types/application-details";

export async function sendApplicationMessageAction(
  applicationId: string,
  message: string,
): Promise<ApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to send messages." };
  }

  const trimmed = message.trim();
  if (trimmed.length < 1) {
    return { error: "Message cannot be empty." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const senderName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user.email ?? "Client";

  const { error } = await supabase.from("application_messages").insert({
    application_id: applicationId,
    sender_id: user.id,
    sender_role: "client",
    sender_name: senderName,
    message: trimmed,
  });

  if (error) {
    return { error: error.message };
  }

  await logApplicationAudit(supabase, user.id, {
    action: "application.client_message_sent",
    entityType: "loan_application",
    entityId: applicationId,
    newValues: { message: trimmed },
  });

  revalidatePath(`/dashboard/loans/${applicationId}`);
  return { success: "Message sent successfully." };
}

export async function uploadDocumentRequestAction(
  formData: FormData,
): Promise<ApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to upload documents." };
  }

  const applicationId = formData.get("applicationId")?.toString();
  const requestId = formData.get("requestId")?.toString();
  const file = formData.get("file");

  if (!applicationId || !requestId) {
    return { error: "Missing upload context." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Select a file to upload." };
  }

  const upload = await uploadApplicationDocumentFile({
    userId: user.id,
    applicationId,
    requirementId: requestId,
    file,
  });

  if (upload.error) {
    return { error: upload.error };
  }

  const fileName = file.name;

  const { data: request, error: fetchError } = await supabase
    .from("application_document_requests")
    .select("id, document_name, application_id")
    .eq("id", requestId)
    .eq("application_id", applicationId)
    .maybeSingle();

  if (fetchError || !request) {
    const { data: app, error: appError } = await supabase
      .from("loan_applications")
      .select("id, requirement_documents")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (appError || !app) {
      return { error: "Document request not found." };
    }

    const documents = (app.requirement_documents ?? {}) as Record<
      string,
      { fileName: string; uploadedAt: string; fulfilled: boolean; fileUrl?: string }
    >;

    documents[requestId] = {
      fileName,
      uploadedAt: new Date().toISOString(),
      fulfilled: true,
      fileUrl: upload.storagePath,
    };

    const { error: docUpdateError } = await supabase
      .from("loan_applications")
      .update({ requirement_documents: documents })
      .eq("id", applicationId);

    if (docUpdateError) {
      return { error: docUpdateError.message };
    }

    revalidatePath(`/dashboard/loans/${applicationId}`);
    revalidatePath("/dashboard/documents");
    return { success: "Document uploaded successfully." };
  }

  const { error: updateError } = await supabase
    .from("application_document_requests")
    .update({
      fulfilled: true,
      file_name: fileName,
      file_url: upload.storagePath,
      uploaded_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("loan_application_documents").insert({
    application_id: applicationId,
    requirement_id: requestId,
    document_name: request.document_name,
    file_name: fileName,
    file_url: upload.storagePath,
  });

  const { data: pendingRequests } = await supabase
    .from("application_document_requests")
    .select("id")
    .eq("application_id", applicationId)
    .eq("fulfilled", false);

  if ((pendingRequests ?? []).length === 0) {
    await transitionApplicationStatus(applicationId, "under_review", {
      note: "All requested documents uploaded. Application returned to review.",
      systemMessage:
        "Thank you for uploading the requested documents. Your application is back under review.",
      skipValidation: true,
    });
  }

  await logApplicationAudit(supabase, user.id, {
    action: "application.document_uploaded",
    entityType: "loan_application",
    entityId: applicationId,
    newValues: { documentName: request.document_name, fileName },
  });

  const { recordApplicationActivity } = await import("@/lib/notifications/service");
  await recordApplicationActivity(applicationId, {
    eventType: "document_uploaded",
    title: "Documents Uploaded",
    description: `${request.document_name} uploaded successfully.`,
    actorId: user.id,
    actorName: "You",
  });

  revalidatePath(`/dashboard/loans/${applicationId}`);
  revalidatePath("/dashboard/documents");
  return { success: "Document uploaded successfully." };
}

export async function respondToOfferAction(
  applicationId: string,
  offerId: string,
  response: "accept" | "decline",
): Promise<ApplicationActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to respond to offers." };
  }

  const { data: offer, error: fetchError } = await supabase
    .from("loan_offers")
    .select("id, status")
    .eq("id", offerId)
    .eq("application_id", applicationId)
    .maybeSingle();

  if (fetchError || !offer) {
    return { error: "Financing offer not found." };
  }

  if (offer.status !== "pending") {
    return { error: "This offer has already been responded to." };
  }

  const accepted = response === "accept";
  const { error: offerError } = await supabase
    .from("loan_offers")
    .update({
      accepted_by_client: accepted,
      status: accepted ? "accepted" : "declined",
    })
    .eq("id", offerId);

  if (offerError) {
    return { error: offerError.message };
  }

  if (accepted) {
    const acceptResult = await transitionApplicationStatus(
      applicationId,
      "offer_accepted",
      {
        note: "Client accepted the financing offer.",
        auditAction: "application.offer_accepted",
        systemMessage:
          "You accepted the financing offer. Your application is pending credit manager review.",
        skipValidation: true,
      },
    );

    if (acceptResult.error) {
      return { error: acceptResult.error };
    }

    const pendingResult = await transitionApplicationStatus(
      applicationId,
      "pending_finance_approval",
      {
        note: "Escalated to Credit Manager for final approval.",
        skipValidation: true,
      },
    );

    if (pendingResult.error) {
      return { error: pendingResult.error };
    }
  } else {
    const declineResult = await transitionApplicationStatus(
      applicationId,
      "offer_declined",
      {
        note: "Client declined the financing offer.",
        auditAction: "application.offer_declined",
        systemMessage:
          "You declined the financing offer. A loan officer may follow up with revised terms.",
        skipValidation: true,
      },
    );

    if (declineResult.error) {
      return { error: declineResult.error };
    }
  }

  await logApplicationAudit(supabase, user.id, {
    action: accepted ? "application.offer_accepted" : "application.offer_declined",
    entityType: "loan_offer",
    entityId: offerId,
    newValues: { response },
  });

  revalidatePath(`/dashboard/loans/${applicationId}`);
  revalidatePath(`/finance/applications/${applicationId}`);

  return {
    success: accepted
      ? "Offer accepted. Your application is pending credit manager review."
      : "Offer declined.",
  };
}

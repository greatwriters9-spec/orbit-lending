"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { US_PHONE_PATTERN } from "@/lib/auth/input-formatters";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { notifyAdmin } from "@/lib/notifications/notify";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  GuestConcernActionState,
  GuestConcernStatus,
} from "@/types/guest-support";

const guestConcernSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(US_PHONE_PATTERN, "Enter a valid US phone number."),
  concern: z
    .string()
    .trim()
    .min(10, "Please describe your concern in more detail."),
  source: z.string().trim().optional(),
  website: z.string().optional(),
});

function generateGuestConcernReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORB-CON-${date}-${suffix}`;
}

async function notifyAdminsOfGuestConcern(input: {
  referenceNumber: string;
  fullName: string;
  email: string;
  concern: string;
  concernId: string;
}) {
  void notifyAdmin({
    event: "GENERAL_INQUIRY",
    severity: "high",
    payload: {
      name: input.fullName,
      email: input.email,
      message: input.concern,
      referenceNumber: input.referenceNumber,
    },
    entityType: "guest_concern",
    entityId: input.concernId,
    dashboardUrl: "/super-admin/guest-concerns",
  });
}

export async function submitGuestConcernAction(
  input: z.infer<typeof guestConcernSchema>,
): Promise<GuestConcernActionState> {
  const parsed = guestConcernSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.website?.trim()) {
    return {
      success:
        "Thank you. An Orbit Mortgage support staff member will respond to your issue shortly.",
    };
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (envError) {
    console.error("[submitGuestConcernAction] service role client:", envError);
    return { error: "Unable to submit your concern. Please try again." };
  }

  const referenceNumber = generateGuestConcernReference();

  const { data: rows, error } = await supabase
    .from("guest_support_concerns")
    .insert({
      reference_number: referenceNumber,
      full_name: parsed.data.fullName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone,
      concern: parsed.data.concern,
      source: parsed.data.source ?? "onboarding",
      status: "open",
    })
    .select("id");

  const concern = rows?.[0];

  if (error || !concern) {
    console.error("[submitGuestConcernAction] insert failed:", error);
    return { error: "Unable to submit your concern. Please try again." };
  }

  try {
    await notifyAdminsOfGuestConcern({
      referenceNumber,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      concern: parsed.data.concern,
      concernId: concern.id,
    });
  } catch (notifyError) {
    console.error("[submitGuestConcernAction] notify failed:", notifyError);
  }

  revalidatePath("/super-admin/guest-concerns");

  return {
    success: `Thank you. An Orbit Mortgage support staff member will respond to your issue shortly. Your reference is ${referenceNumber}.`,
    referenceNumber,
  };
}

export async function updateGuestConcernStatusAction(input: {
  concernId: string;
  status: GuestConcernStatus;
}): Promise<GuestConcernActionState> {
  const ctx = await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("guest_support_concerns")
    .update({
      status: input.status,
      reviewed_at:
        input.status === "open" ? null : new Date().toISOString(),
      reviewed_by: input.status === "open" ? null : ctx.user.id,
    })
    .eq("id", input.concernId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/super-admin/guest-concerns");
  return { success: "Concern status updated." };
}

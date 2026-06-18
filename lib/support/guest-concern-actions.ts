"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { US_PHONE_PATTERN } from "@/lib/auth/input-formatters";
import { requireSuperAdmin } from "@/lib/auth/guards";
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

async function notifySuperAdminsOfGuestConcern(input: {
  referenceNumber: string;
  fullName: string;
  email: string;
  concern: string;
  concernId: string;
}) {
  const supabase = createServiceRoleClient();

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "super_admin");

  if (!admins?.length) {
    return;
  }

  const snippet =
    input.concern.length > 120
      ? `${input.concern.slice(0, 117)}...`
      : input.concern;

  await supabase.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      title: "New Guest Support Concern",
      message: `${input.fullName} (${input.email}) — ${snippet} Ref: ${input.referenceNumber}`,
      type: "general",
      category: "support",
      priority: "high",
      action_url: "/super-admin/guest-concerns",
      metadata: {
        concernId: input.concernId,
        referenceNumber: input.referenceNumber,
        guestEmail: input.email,
      },
      modal_dismissed: true,
    })),
  );
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
    await notifySuperAdminsOfGuestConcern({
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

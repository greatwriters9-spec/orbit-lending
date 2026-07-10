import type { SupabaseClient } from "@supabase/supabase-js";

import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

export async function syncProfileFromOnboardingDraft(
  supabase: SupabaseClient,
  userId: string,
  draft: MortgageApplicationDraft,
) {
  await supabase
    .from("profiles")
    .update({
      first_name: draft.firstName ?? null,
      middle_name: draft.middleName ?? null,
      last_name: draft.lastName ?? null,
      phone: draft.phone ?? null,
      country: "US",
      state: draft.address?.state ?? draft.targetLocation?.state ?? null,
      city: draft.address?.city ?? draft.targetLocation?.city ?? null,
      address: draft.address?.street ?? null,
      zip_code: draft.address?.zip ?? draft.targetLocation?.zip ?? null,
      date_of_birth: draft.dateOfBirth ?? null,
      profile_status:
        draft.firstName && draft.lastName ? "complete" : "incomplete",
    })
    .eq("id", userId);
}

export function enrichOnboardingDraft(
  draft: MortgageApplicationDraft,
  email?: string | null,
) {
  return {
    ...draft,
    email: draft.email ?? email ?? "",
    completedAt: draft.completedAt ?? new Date().toISOString(),
  };
}

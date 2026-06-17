import { getProfile } from "@/lib/auth/profile";
import {
  buildProfileCompletionFields,
  type ProfileCompletionFields,
} from "@/lib/auth/profile-completion-fields";
import { createClient } from "@/lib/supabase/server";

export type { ProfileCompletionFields };

export async function getProfileCompletionDefaults(
  userId: string,
): Promise<ProfileCompletionFields> {
  const profile = await getProfile(userId);
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("loan_applications")
    .select("personal_info")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const personalInfo =
    application?.personal_info && typeof application.personal_info === "object"
      ? (application.personal_info as Record<string, unknown>)
      : null;

  return buildProfileCompletionFields({ profile, personalInfo });
}

import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/profile";

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) {
    return false;
  }

  if (profile.profile_status === "complete" || profile.profile_status === "verified") {
    return true;
  }

  return Boolean(
    profile.first_name &&
      profile.last_name &&
      profile.phone &&
      profile.country &&
      profile.state &&
      profile.city &&
      profile.address &&
      profile.zip_code &&
      profile.date_of_birth,
  );
}

export function getDisplayName(profile: UserProfile | null, fallbackEmail?: string) {
  if (profile?.first_name) {
    return profile.first_name;
  }

  if (fallbackEmail) {
    return fallbackEmail.split("@")[0];
  }

  return "User";
}

export function getInitials(profile: UserProfile | null, fallbackEmail?: string) {
  const first = profile?.first_name?.[0] ?? "";
  const last = profile?.last_name?.[0] ?? "";

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  if (fallbackEmail) {
    return fallbackEmail.slice(0, 2).toUpperCase();
  }

  return "U";
}

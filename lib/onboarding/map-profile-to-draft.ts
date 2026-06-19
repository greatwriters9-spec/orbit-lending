import type { UserProfile } from "@/types/profile";
import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";

function pickString(...values: (string | null | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

export function mapProfileToOnboardingDraft(
  profile: UserProfile,
  email?: string | null,
): Partial<MortgageApplicationDraft> {
  const draft: Partial<MortgageApplicationDraft> = {
    firstName: pickString(profile.first_name),
    middleName: pickString(profile.middle_name),
    lastName: pickString(profile.last_name),
    dateOfBirth: pickString(profile.date_of_birth),
    email: pickString(email, profile.email),
    phone: pickString(profile.phone),
  };

  const street = pickString(profile.address);
  const city = pickString(profile.city);
  const state = pickString(profile.state);
  const zip = pickString(profile.zip_code);

  if (street || city || state || zip) {
    draft.address = {
      street: street ?? "",
      city: city ?? "",
      state: state ?? "",
      zip: zip ?? "",
      yearsAtAddress: "",
    };
  }

  return draft;
}

export function mergeOnboardingDraftWithProfile(
  stored: MortgageApplicationDraft,
  profileDraft: Partial<MortgageApplicationDraft>,
  useProfilePersonalDetails: boolean,
): MortgageApplicationDraft {
  if (!useProfilePersonalDetails) {
    return {
      ...profileDraft,
      ...stored,
      email: pickString(stored.email, profileDraft.email) ?? stored.email,
    };
  }

  return {
    ...stored,
    ...profileDraft,
    address: profileDraft.address ?? stored.address,
  };
}

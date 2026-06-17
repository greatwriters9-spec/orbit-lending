import type { MortgageApplicationDraft } from "@/types/mortgage-onboarding";
import type { UserProfile } from "@/types/profile";

export type ProfileCompletionFields = {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  state: string;
  city: string;
  zipCode: string;
  country: string;
};

function pickFirst(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

type MergeSources = {
  profile?: UserProfile | null;
  personalInfo?: Record<string, unknown> | null;
  draft?: MortgageApplicationDraft | null;
  existing?: ProfileCompletionFields | null;
};

export function buildProfileCompletionFields(
  sources: MergeSources,
): ProfileCompletionFields {
  const { profile, personalInfo, draft, existing } = sources;

  return {
    firstName: pickFirst(
      existing?.firstName,
      profile?.first_name,
      draft?.firstName,
      String(personalInfo?.firstName ?? ""),
    ),
    lastName: pickFirst(
      existing?.lastName,
      profile?.last_name,
      draft?.lastName,
      String(personalInfo?.lastName ?? ""),
    ),
    phone: pickFirst(
      existing?.phone,
      profile?.phone,
      draft?.phone,
      String(personalInfo?.phone ?? ""),
    ),
    dateOfBirth: pickFirst(
      existing?.dateOfBirth,
      profile?.date_of_birth,
      draft?.dateOfBirth,
      String(personalInfo?.dateOfBirth ?? ""),
    ),
    address: pickFirst(
      existing?.address,
      profile?.address,
      draft?.address?.street,
      String(personalInfo?.address ?? ""),
    ),
    state: pickFirst(
      existing?.state,
      profile?.state,
      draft?.address?.state,
      draft?.targetLocation?.state,
      String(personalInfo?.state ?? ""),
    ),
    city: pickFirst(
      existing?.city,
      profile?.city,
      draft?.address?.city,
      draft?.targetLocation?.city,
      String(personalInfo?.city ?? ""),
    ),
    zipCode: pickFirst(
      existing?.zipCode,
      profile?.zip_code,
      draft?.address?.zip,
      draft?.targetLocation?.zip,
      String(personalInfo?.zipCode ?? personalInfo?.zip_code ?? ""),
    ),
    country: pickFirst(
      existing?.country,
      profile?.country,
      "US",
      String(personalInfo?.country ?? ""),
    ),
  };
}

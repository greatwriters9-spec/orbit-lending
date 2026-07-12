import type {
  ApplicationSectionKey,
  FullMortgageApplication,
} from "@/types/mortgage-full-application";
import type { UserProfile } from "@/types/profile";

export function enrichApplicationFromProfile(
  application: FullMortgageApplication,
  profile: UserProfile,
  email: string,
): FullMortgageApplication {
  return {
    ...application,
    personal: {
      ...application.personal,
      firstName: application.personal.firstName || profile.first_name || "",
      middleName: application.personal.middleName || profile.middle_name || "",
      lastName: application.personal.lastName || profile.last_name || "",
      dateOfBirth: application.personal.dateOfBirth || profile.date_of_birth || "",
      phone: application.personal.phone || profile.phone || "",
      email: application.personal.email || profile.email || email,
    },
    residence: {
      ...application.residence,
      current: {
        ...application.residence.current,
        street: application.residence.current.street || profile.address || "",
        city: application.residence.current.city || profile.city || "",
        state: application.residence.current.state || profile.state || "",
        zip: application.residence.current.zip || profile.zip_code || "",
      },
    },
  };
}

export function prepareApplicationForWizard(input: {
  application: FullMortgageApplication;
  skipPersonalSection: boolean;
}): FullMortgageApplication {
  if (!input.skipPersonalSection) {
    return input.application;
  }

  const completedSections: ApplicationSectionKey[] =
    input.application.progress.completedSections.includes("personal")
      ? input.application.progress.completedSections
      : [...input.application.progress.completedSections, "personal"];

  const currentSection: ApplicationSectionKey =
    input.application.progress.currentSection === "personal"
      ? "residence"
      : input.application.progress.currentSection;

  return {
    ...input.application,
    progress: {
      ...input.application.progress,
      completedSections,
      currentSection,
    },
  };
}

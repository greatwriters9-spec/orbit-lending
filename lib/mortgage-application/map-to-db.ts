import { generateDocumentChecklist } from "@/lib/mortgage-application/document-checklist";
import type { FullMortgageApplication } from "@/types/mortgage-full-application";
import type { PreQualificationResult } from "@/types/mortgage-onboarding";
import { DEFAULT_BRANDING_CONFIG } from "@/types/branding-config";

function sumIncome(income: FullMortgageApplication["income"]): number {
  let total = 0;
  if (income.selectedSources.includes("baseSalary")) total += income.baseSalary;
  if (income.selectedSources.includes("overtime")) total += income.overtime;
  if (income.selectedSources.includes("bonus")) total += income.bonus;
  if (income.selectedSources.includes("commission")) total += income.commission;
  if (income.selectedSources.includes("selfEmployment")) total += income.selfEmployment;
  if (income.selectedSources.includes("rental")) total += income.rental;
  if (income.selectedSources.includes("retirement")) total += income.retirement;
  if (income.selectedSources.includes("socialSecurity")) total += income.socialSecurity;
  if (income.selectedSources.includes("other")) total += income.other;
  return total;
}

function sumLiabilities(liabilities: FullMortgageApplication["liabilities"]): number {
  const sumItems = (items: { monthlyPayment: number }[]) =>
    items.reduce((sum, item) => sum + item.monthlyPayment, 0);

  return (
    sumItems(liabilities.creditCards) +
    sumItems(liabilities.studentLoans) +
    sumItems(liabilities.autoLoans) +
    sumItems(liabilities.personalLoans) +
    liabilities.childSupport +
    liabilities.alimony +
    liabilities.otherMonthly
  );
}

function sumAssets(assets: FullMortgageApplication["assets"]): number {
  return (
    assets.checking +
    assets.savings +
    assets.investments +
    assets.retirement +
    assets.cash +
    assets.giftFunds +
    assets.other
  );
}

export function mapFullApplicationToDbPayload(input: {
  application: FullMortgageApplication;
  preQualification?: PreQualificationResult | null;
  existingPersonalInfo?: Record<string, unknown>;
  institutionName?: string;
}) {
  const { application, preQualification, existingPersonalInfo = {} } = input;
  const onboarding =
    existingPersonalInfo.onboarding && typeof existingPersonalInfo.onboarding === "object"
      ? (existingPersonalInfo.onboarding as Record<string, unknown>)
      : {};

  const checklist =
    application.documentChecklist.length > 0
      ? application.documentChecklist
      : generateDocumentChecklist(application);

  const annualIncome = sumIncome(application.income);
  const monthlyIncome = annualIncome / 12;
  const totalLiabilities = sumLiabilities(application.liabilities);

  const personalInfo = {
    ...existingPersonalInfo,
    firstName: application.personal.firstName,
    middleName: application.personal.middleName,
    lastName: application.personal.lastName,
    email: application.personal.email,
    phone: application.personal.phone,
    dateOfBirth: application.personal.dateOfBirth,
    address: application.residence.current.street,
    city: application.residence.current.city,
    state: application.residence.current.state,
    zipCode: application.residence.current.zip,
    yearsAtAddress: application.residence.current.moveInDate,
    onboarding: {
      ...onboarding,
      preQualification: preQualification ?? onboarding.preQualification,
      homeFound: application.property.hasProperty,
      propertyAddress: application.property.hasProperty
        ? {
            street: application.property.street,
            city: application.property.city,
            state: application.property.state,
            zip: application.property.zip,
          }
        : onboarding.propertyAddress,
      purchasePrice: application.property.purchasePrice,
      propertyType: application.property.propertyType,
      propertyUse: application.property.occupancy,
      plannedDownPayment: application.loanDetails.desiredDownPayment,
    },
    fullApplication: {
      ...application,
      documentChecklist: checklist,
    },
    applicationProgress: application.progress,
  };

  const financialInfo = {
    employmentStatus: application.employment.current.employmentStatus,
    employerName: application.employment.current.isSelfEmployed
      ? application.employment.current.businessName
      : application.employment.current.employerName,
    jobTitle: application.employment.current.jobTitle,
    monthlyIncome,
    monthlyExpenses: application.residence.current.monthlyPayment + totalLiabilities,
    existingDebt: totalLiabilities,
    employmentType: application.employment.current.isSelfEmployed
      ? "self_employed"
      : "full_time",
    yearsEmployed: application.employment.current.yearsInBusiness,
    annualIncome,
    assets: {
      checkingBalance: application.assets.checking,
      savingsBalance: application.assets.savings,
      investmentBalance: application.assets.investments + application.assets.retirement,
    },
    citizenshipStatus: application.personal.citizenship,
    maritalStatus: application.personal.maritalStatus,
    incomeSources: application.income,
    liabilities: application.liabilities,
    totalAssets: sumAssets(application.assets),
    residence: application.residence,
    employment: application.employment,
    loanDetails: application.loanDetails,
    declarations: application.declarations,
    consents: application.consents,
  };

  return {
    personalInfo,
    financialInfo,
    requestedAmount: application.loanDetails.desiredLoanAmount,
    selectedTermId: preQualification?.loanTermId,
    loanProductSlug: preQualification?.loanProductSlug,
    purpose: buildPurpose(
      application,
      input.institutionName ?? DEFAULT_BRANDING_CONFIG.institutionName,
    ),
    documentChecklist: checklist,
  };
}

function buildPurpose(
  application: FullMortgageApplication,
  institutionName: string,
): string {
  if (application.loanDetails.loanPurpose === "refinance") {
    return `Refinance through ${institutionName}`;
  }
  if (application.property.hasProperty && application.property.street) {
    return `Purchase at ${application.property.street}, ${application.property.city}, ${application.property.state}`;
  }
  if (application.property.state) {
    return `Purchase in ${application.property.state}`;
  }
  return `Purchase through ${institutionName}`;
}

export function extractFullApplicationFromPersonalInfo(
  personalInfo: Record<string, unknown> | null | undefined,
): FullMortgageApplication | null {
  if (!personalInfo?.fullApplication || typeof personalInfo.fullApplication !== "object") {
    return null;
  }
  return personalInfo.fullApplication as FullMortgageApplication;
}

export function extractDocumentChecklistFromPersonalInfo(
  personalInfo: Record<string, unknown> | null | undefined,
) {
  const app = extractFullApplicationFromPersonalInfo(personalInfo);
  return app?.documentChecklist ?? [];
}

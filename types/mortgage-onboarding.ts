export type PurchaseTimeline =
  | "within_30_days"
  | "2_3_months"
  | "4_6_months"
  | "6_plus_months";

export type BuyingStage =
  | "just_getting_started"
  | "looking_at_listings"
  | "working_with_agent"
  | "ready_to_make_offer";

export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family";

export type PropertyUse =
  | "primary_residence"
  | "vacation_home"
  | "investment_property";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "self_employed"
  | "contractor"
  | "retired";

export type TargetLocation = {
  city: string;
  state: string;
  zip: string;
};

export type PropertyAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type CurrentAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  yearsAtAddress: string;
};

export type EmploymentInfo = {
  employerName: string;
  employmentType: EmploymentType;
  position: string;
  yearsEmployed: string;
  annualIncome: number;
};

export type AssetInfo = {
  checkingBalance: number;
  savingsBalance: number;
  investmentBalance: number;
};

export type CreditProfile = {
  ssn: string;
  citizenshipStatus: string;
  maritalStatus: string;
};

export type MortgagePreferences = {
  downPaymentMode: "percent" | "custom";
  downPaymentPercent?: number;
  downPaymentAmount?: number;
  termMonths: number;
};

export type PreQualificationResult = {
  maximumHomePrice: number;
  estimatedMortgageAmount: number;
  estimatedDownPayment: number;
  estimatedMonthlyPayment: number;
  interestRate: number;
  loanTermMonths: number;
  loanTermId: string;
  loanProductSlug: string;
};

export type MortgageApplicationDraft = {
  homeFound?: boolean;
  purchaseTimeline?: PurchaseTimeline;
  buyingStage?: BuyingStage;
  targetLocation?: TargetLocation;
  targetHomePrice?: number;
  propertyAddress?: PropertyAddress;
  purchasePrice?: number;
  propertyType?: PropertyType;
  propertyUse?: PropertyUse;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: CurrentAddress;
  employment?: EmploymentInfo;
  assets?: AssetInfo;
  creditProfile?: CreditProfile;
  mortgagePreferences?: MortgagePreferences;
  preQualification?: PreQualificationResult;
  completedAt?: string;
};

export const MORTGAGE_APPLICATION_DRAFT_KEY = "mortgageApplicationDraft";

export const ONBOARDING_ROUTES = {
  getStarted: "/get-started",
  createAccount: "/create-account",
} as const;

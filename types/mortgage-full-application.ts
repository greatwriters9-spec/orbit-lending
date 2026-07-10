export type ApplicationSectionKey =
  | "personal"
  | "residence"
  | "employment"
  | "income"
  | "assets"
  | "liabilities"
  | "property"
  | "loan-details"
  | "declarations"
  | "documents"
  | "review"
  | "consent";

export const APPLICATION_SECTIONS: ApplicationSectionKey[] = [
  "personal",
  "residence",
  "employment",
  "income",
  "assets",
  "liabilities",
  "property",
  "loan-details",
  "declarations",
  "documents",
  "review",
  "consent",
];

export const APPLICATION_SECTION_LABELS: Record<ApplicationSectionKey, string> = {
  personal: "Personal Information",
  residence: "Residence History",
  employment: "Employment",
  income: "Income",
  assets: "Assets",
  liabilities: "Debts",
  property: "Property Information",
  "loan-details": "Loan Details",
  declarations: "Declarations",
  documents: "Document Checklist",
  review: "Review",
  consent: "Consent",
};

export type HousingStatus = "own" | "rent" | "other";

export type ResidenceAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  moveInDate: string;
  housingStatus: HousingStatus;
  monthlyPayment: number;
};

export type PreviousAddress = ResidenceAddress;

export type FullEmploymentRecord = {
  employmentStatus: string;
  employerName: string;
  jobTitle: string;
  employerStreet: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  employerPhone: string;
  startDate: string;
  isSelfEmployed: boolean;
  businessName: string;
  yearsInBusiness: string;
};

export type PreviousEmploymentRecord = {
  employerName: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
};

export type IncomeSources = {
  baseSalary: number;
  overtime: number;
  bonus: number;
  commission: number;
  selfEmployment: number;
  rental: number;
  retirement: number;
  socialSecurity: number;
  other: number;
  selectedSources: string[];
};

export type FullAssetInfo = {
  checking: number;
  savings: number;
  investments: number;
  retirement: number;
  cash: number;
  giftFunds: number;
  other: number;
};

export type LiabilityItem = {
  type: string;
  creditor: string;
  monthlyPayment: number;
  balance: number;
};

export type FullLiabilities = {
  creditCards: LiabilityItem[];
  studentLoans: LiabilityItem[];
  autoLoans: LiabilityItem[];
  personalLoans: LiabilityItem[];
  childSupport: number;
  alimony: number;
  otherMonthly: number;
};

export type PropertyAgentInfo = {
  name: string;
  company: string;
  phone: string;
  email: string;
};

export type FullPropertyInfo = {
  hasProperty: boolean;
  street: string;
  city: string;
  state: string;
  zip: string;
  purchasePrice: number;
  propertyType: string;
  occupancy: string;
  agent?: PropertyAgentInfo;
  sellerName: string;
  sellerContact: string;
};

export type FullLoanDetails = {
  desiredLoanAmount: number;
  desiredDownPayment: number;
  loanPurpose: string;
  loanTermMonths: number;
  interestPreference: string;
  occupancyType: string;
};

export type FullDeclarations = {
  bankruptcy: boolean;
  bankruptcyDetails: string;
  foreclosure: boolean;
  foreclosureDetails: string;
  judgments: boolean;
  judgmentsDetails: string;
  lawsuits: boolean;
  lawsuitsDetails: string;
  coSigner: boolean;
  coSignerDetails: string;
  otherPropertyOwnership: boolean;
  otherPropertyDetails: string;
  occupancyIntent: boolean;
  ethnicity: string;
  sex: string;
  race: string;
};

export type DocumentChecklistStatus =
  | "pending"
  | "required_later"
  | "optional"
  | "not_requested"
  | "requested"
  | "uploaded"
  | "verified"
  | "rejected";

export type DocumentChecklistItem = {
  id: string;
  name: string;
  status: DocumentChecklistStatus;
  description?: string;
};

export type ApplicationConsents = {
  identityVerification: boolean;
  creditAuthorization: boolean;
  employmentVerification: boolean;
  incomeVerification: boolean;
  assetVerification: boolean;
  fraudPrevention: boolean;
  electronicConsent: boolean;
  privacyPolicy: boolean;
  termsOfService: boolean;
  acknowledgedAt?: string;
};

export type ApplicationProgress = {
  currentSection: ApplicationSectionKey;
  completedSections: ApplicationSectionKey[];
  lastSavedAt?: string;
  locked?: boolean;
  startedAt?: string;
};

export type FullMortgageApplication = {
  personal: {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    citizenship: string;
    maritalStatus: string;
    phone: string;
    email: string;
  };
  residence: {
    current: ResidenceAddress;
    previousAddresses: PreviousAddress[];
  };
  employment: {
    current: FullEmploymentRecord;
    previousEmployments: PreviousEmploymentRecord[];
  };
  income: IncomeSources;
  assets: FullAssetInfo;
  liabilities: FullLiabilities;
  property: FullPropertyInfo;
  loanDetails: FullLoanDetails;
  declarations: FullDeclarations;
  documentChecklist: DocumentChecklistItem[];
  consents: ApplicationConsents;
  progress: ApplicationProgress;
};

export const MORTGAGE_APPLICATION_ROUTES = {
  intro: (applicationId: string) =>
    `/mortgage-application/${applicationId}` as const,
  apply: (applicationId: string) =>
    `/mortgage-application/${applicationId}/apply` as const,
  submitted: (applicationId: string) =>
    `/mortgage-application/${applicationId}/submitted` as const,
};

export function createEmptyFullMortgageApplication(
  seed?: Partial<FullMortgageApplication>,
): FullMortgageApplication {
  return {
    personal: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      ssn: "",
      citizenship: "",
      maritalStatus: "",
      phone: "",
      email: "",
      ...seed?.personal,
    },
    residence: {
      current: {
        street: "",
        city: "",
        state: "",
        zip: "",
        moveInDate: "",
        housingStatus: "rent",
        monthlyPayment: 0,
      },
      previousAddresses: [],
      ...seed?.residence,
    },
    employment: {
      current: {
        employmentStatus: "",
        employerName: "",
        jobTitle: "",
        employerStreet: "",
        employerCity: "",
        employerState: "",
        employerZip: "",
        employerPhone: "",
        startDate: "",
        isSelfEmployed: false,
        businessName: "",
        yearsInBusiness: "",
      },
      previousEmployments: [],
      ...seed?.employment,
    },
    income: {
      baseSalary: 0,
      overtime: 0,
      bonus: 0,
      commission: 0,
      selfEmployment: 0,
      rental: 0,
      retirement: 0,
      socialSecurity: 0,
      other: 0,
      selectedSources: ["baseSalary"],
      ...seed?.income,
    },
    assets: {
      checking: 0,
      savings: 0,
      investments: 0,
      retirement: 0,
      cash: 0,
      giftFunds: 0,
      other: 0,
      ...seed?.assets,
    },
    liabilities: {
      creditCards: [],
      studentLoans: [],
      autoLoans: [],
      personalLoans: [],
      childSupport: 0,
      alimony: 0,
      otherMonthly: 0,
      ...seed?.liabilities,
    },
    property: {
      hasProperty: false,
      street: "",
      city: "",
      state: "",
      zip: "",
      purchasePrice: 0,
      propertyType: "single_family",
      occupancy: "primary_residence",
      sellerName: "",
      sellerContact: "",
      ...seed?.property,
    },
    loanDetails: {
      desiredLoanAmount: 0,
      desiredDownPayment: 0,
      loanPurpose: "purchase",
      loanTermMonths: 360,
      interestPreference: "fixed",
      occupancyType: "primary_residence",
      ...seed?.loanDetails,
    },
    declarations: {
      bankruptcy: false,
      bankruptcyDetails: "",
      foreclosure: false,
      foreclosureDetails: "",
      judgments: false,
      judgmentsDetails: "",
      lawsuits: false,
      lawsuitsDetails: "",
      coSigner: false,
      coSignerDetails: "",
      otherPropertyOwnership: false,
      otherPropertyDetails: "",
      occupancyIntent: true,
      ethnicity: "",
      sex: "",
      race: "",
      ...seed?.declarations,
    },
    documentChecklist: seed?.documentChecklist ?? [],
    consents: {
      identityVerification: false,
      creditAuthorization: false,
      employmentVerification: false,
      incomeVerification: false,
      assetVerification: false,
      fraudPrevention: false,
      electronicConsent: false,
      privacyPolicy: false,
      termsOfService: false,
      ...seed?.consents,
    },
    progress: {
      currentSection: "personal",
      completedSections: [],
      ...seed?.progress,
    },
  };
}

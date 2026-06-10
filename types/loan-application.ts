export type LoanApplicationDocument = {
  requirementId: string;
  documentName: string;
  fileName: string;
  fileUrl?: string | null;
  storagePath?: string | null;
  uploadedAt: string;
};

export type LoanApplicationConfiguration = {
  requestedAmount: number;
  selectedTermId: string;
  repaymentFrequency: string;
  purpose: string;
};

export type LoanApplicationPersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  country: string;
};

export type LoanApplicationFinancialInfo = {
  employmentStatus: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingDebt: number;
};

export type LoanApplicationDraft = {
  applicationId?: string;
  applicationNumber?: string;
  currentStep: number;
  loanProductSlug: string;
  configuration: LoanApplicationConfiguration;
  personalInfo: LoanApplicationPersonalInfo;
  financialInfo: LoanApplicationFinancialInfo;
  documents: Record<string, LoanApplicationDocument>;
  submittedAt?: string;
};

export type LoanCalculatorResult = {
  installmentAmount: number;
  totalRepayment: number;
  totalInterest: number;
  numberOfPayments: number;
  apr: number;
};

export type WizardStepDefinition = {
  id: number;
  key: string;
  label: string;
  shortLabel: string;
};

export type LoanApplicationActionState = {
  error?: string;
  success?: string;
  applicationId?: string;
  applicationNumber?: string;
};

export type LoanProductStatus = "draft" | "active" | "hidden" | "archived";

export const LOAN_PRODUCT_STATUSES: LoanProductStatus[] = [
  "draft",
  "active",
  "hidden",
  "archived",
];

export const LOAN_PRODUCT_STATUS_LABELS: Record<LoanProductStatus, string> = {
  draft: "Draft",
  active: "Active",
  hidden: "Hidden",
  archived: "Archived",
};

export type AdminLoanProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  defaultApr: number | null;
  minApr: number | null;
  maxApr: number | null;
  minTerm: number | null;
  maxTerm: number | null;
  weeklyRepaymentSupported: boolean;
  monthlyRepaymentSupported: boolean;
  productStatus: LoanProductStatus;
  active: boolean;
  country: string;
  eligibilitySummary: string | null;
  createdAt: string;
  updatedAt: string;
  /** True when shown from the default catalog but not yet saved to the database. */
  catalogOnly?: boolean;
};

export type AdminLoanProductInput = {
  name: string;
  slug: string;
  category: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  defaultApr: number;
  minApr: number;
  maxApr: number;
  minTerm: number;
  maxTerm: number;
  weeklyRepaymentSupported: boolean;
  monthlyRepaymentSupported: boolean;
  productStatus: LoanProductStatus;
  country: string;
  eligibilitySummary?: string;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  accountStatus: string;
  profileStatus: string;
  createdAt: string;
  applicationCount: number;
};

export type AdminUserDetail = AdminUserSummary & {
  phone: string | null;
  country: string | null;
  accountStatusReason: string | null;
  accountStatusChangedAt: string | null;
  pathwardAccountHolderName: string | null;
  pathwardRoutingNumber: string | null;
  pathwardAccountNumber: string | null;
  pathwardAccountBalance: number;
  pathwardLinkedAt: string | null;
  pathwardWithdrawableApprovedAt: string | null;
  fundingBankName: string | null;
};

export type AdminUserFundingApplication = {
  id: string;
  status: string;
  personalInfo: Record<string, unknown>;
};

export type AdminUserApplication = {
  id: string;
  applicationNumber: string;
  productSlug: string;
  status: string;
  requestedAmount: number;
  submittedAt: string | null;
  updatedAt: string;
};

export type AdminUserLoan = AdminUserApplication;

export type AdminUserWallet = {
  id: string;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
};

export type AdminUserTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

export type AdminUserMessage = {
  id: string;
  applicationId: string;
  applicationNumber: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
};

export type PlatformAuditLog = {
  id: string;
  userId: string | null;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  reason: string | null;
  createdAt: string;
};

export type AdminActionState = {
  error?: string;
  success?: string;
};

export type PlatformSetting = {
  key: string;
  value: Record<string, unknown>;
  updatedAt: string;
};

import { z } from "zod";

export const loanConfigurationSchema = z.object({
  requestedAmount: z
    .number({ error: "Enter a valid loan amount" })
    .positive("Loan amount must be greater than zero"),
  selectedTermId: z.string().min(1, "Select a repayment term"),
  repaymentFrequency: z.string().min(1, "Select a repayment frequency"),
  purpose: z
    .string()
    .min(10, "Describe your loan purpose in at least 10 characters")
    .max(500, "Purpose must be 500 characters or fewer"),
});

export const personalInformationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(2, "Country is required"),
});

export const financialInformationSchema = z.object({
  employmentStatus: z.string().min(1, "Employment status is required"),
  employerName: z.string().min(1, "Employer or business name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  monthlyIncome: z
    .number({ error: "Enter a valid monthly income" })
    .positive("Monthly income must be greater than zero"),
  monthlyExpenses: z
    .number({ error: "Enter valid monthly expenses" })
    .min(0, "Monthly expenses cannot be negative"),
  existingDebt: z
    .number({ error: "Enter valid existing debt amount" })
    .min(0, "Existing debt cannot be negative"),
});

export type LoanConfigurationInput = z.infer<typeof loanConfigurationSchema>;
export type PersonalInformationInput = z.infer<typeof personalInformationSchema>;
export type FinancialInformationInput = z.infer<typeof financialInformationSchema>;

export function validateLoanConfiguration(
  data: unknown,
  minAmount: number,
  maxAmount: number,
): { ok: true; data: LoanConfigurationInput } | { ok: false; message: string } {
  const parsed = loanConfigurationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid loan configuration.",
    };
  }

  if (parsed.data.requestedAmount < minAmount) {
    return {
      ok: false,
      message: `Minimum loan amount is $${minAmount.toLocaleString()}`,
    };
  }

  if (parsed.data.requestedAmount > maxAmount) {
    return {
      ok: false,
      message: `Maximum loan amount is $${maxAmount.toLocaleString()}`,
    };
  }

  return { ok: true, data: parsed.data };
}

export function validateRequirementsDocuments(
  documents: Record<string, { fileName: string }>,
  requiredRequirementIds: string[],
) {
  const missing = requiredRequirementIds.filter(
    (id) => !documents[id]?.fileName,
  );

  if (missing.length > 0) {
    return {
      success: false as const,
      error: "Upload all required documents before continuing.",
    };
  }

  return { success: true as const };
}

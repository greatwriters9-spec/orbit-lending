import type { ReactNode } from "react";

import { SectionHeader } from "@/components/ui-kit/section-header";
import { parseOnboardingMeta } from "@/lib/onboarding/parse-application";
import { formatCurrency } from "@/lib/loans/queries";
import type { AssetInfo } from "@/types/mortgage-onboarding";

type ApplicantDetailsPanelProps = {
  applicantName: string;
  purpose?: string;
  productName: string;
  requestedAmount: number;
  approvedAmount?: number;
  pathwardBalance: number;
  personalInfo: Record<string, unknown>;
  financialInfo: Record<string, unknown>;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
      <span className="w-[38%] shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right font-medium leading-snug text-brand-navy">
        {value}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="divide-y divide-brand-border/70 rounded-lg border border-brand-border/60 bg-brand-background/30">
        {children}
      </div>
    </div>
  );
}

function formatLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAddress(parts: {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}): string {
  const line1 = parts.street?.trim();
  const line2 = [parts.city, parts.state, parts.zip].filter(Boolean).join(", ");
  return [line1, line2].filter(Boolean).join(", ") || "—";
}

export function ApplicantDetailsPanel({
  applicantName,
  purpose,
  productName,
  requestedAmount,
  approvedAmount,
  pathwardBalance,
  personalInfo,
  financialInfo,
}: ApplicantDetailsPanelProps) {
  const onboarding = parseOnboardingMeta(personalInfo);
  const assets = financialInfo.assets as AssetInfo | undefined;
  const liquidAssets =
    (assets?.checkingBalance ?? 0) +
    (assets?.savingsBalance ?? 0) +
    (assets?.investmentBalance ?? 0);

  const propertyAddress =
    onboarding?.propertyAddress ??
    (onboarding?.targetLocation
      ? {
          street: "",
          city: onboarding.targetLocation.city,
          state: onboarding.targetLocation.state,
          zip: onboarding.targetLocation.zip,
        }
      : undefined);

  const preQual = onboarding?.preQualification;
  const currentAddress = formatAddress({
    street: String(personalInfo.address ?? ""),
    city: String(personalInfo.city ?? ""),
    state: String(personalInfo.state ?? ""),
    zip: String(personalInfo.zipCode ?? ""),
  });

  return (
    <section className="card-surface p-5 md:p-6">
      <SectionHeader
        title="Applicant Details"
        description="Submitted application data at a glance."
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4">
          <DetailSection title="Application">
            <DetailRow label="Applicant" value={applicantName} />
            <DetailRow label="Product" value={productName} />
            <DetailRow
              label="Requested"
              value={formatCurrency(requestedAmount)}
            />
            <DetailRow
              label="Approved"
              value={approvedAmount ? formatCurrency(approvedAmount) : "—"}
            />
            <DetailRow label="Purpose" value={purpose ?? "—"} />
            <DetailRow
              label="Pathward Balance"
              value={formatCurrency(pathwardBalance)}
            />
          </DetailSection>

          <DetailSection title="Contact Info">
            <DetailRow label="Email" value={String(personalInfo.email ?? "—")} />
            <DetailRow label="Phone" value={String(personalInfo.phone ?? "—")} />
          </DetailSection>

          <DetailSection title="Employment & Income">
            <DetailRow
              label="Employment Status"
              value={String(financialInfo.employmentStatus ?? "—")}
            />
            <DetailRow
              label="Employer"
              value={String(financialInfo.employerName ?? "—")}
            />
            <DetailRow
              label="Job Title"
              value={String(financialInfo.jobTitle ?? "—")}
            />
            <DetailRow
              label="Employment Type"
              value={
                financialInfo.employmentType
                  ? formatLabel(String(financialInfo.employmentType))
                  : "—"
              }
            />
            <DetailRow
              label="Years Employed"
              value={String(financialInfo.yearsEmployed ?? "—")}
            />
            <DetailRow
              label="Annual Income"
              value={
                financialInfo.annualIncome
                  ? formatCurrency(Number(financialInfo.annualIncome))
                  : "—"
              }
            />
            <DetailRow
              label="Monthly Income"
              value={formatCurrency(Number(financialInfo.monthlyIncome ?? 0))}
            />
            <DetailRow
              label="Monthly Expenses"
              value={formatCurrency(Number(financialInfo.monthlyExpenses ?? 0))}
            />
            <DetailRow
              label="Existing Debt"
              value={formatCurrency(Number(financialInfo.existingDebt ?? 0))}
            />
          </DetailSection>

          {preQual ? (
            <DetailSection title="Pre-Qualification">
              <DetailRow
                label="Max Home Price"
                value={formatCurrency(preQual.maximumHomePrice)}
              />
              <DetailRow
                label="Est. Mortgage"
                value={formatCurrency(preQual.estimatedMortgageAmount)}
              />
              <DetailRow
                label="Est. Down Payment"
                value={formatCurrency(preQual.estimatedDownPayment)}
              />
              <DetailRow
                label="Est. Monthly Payment"
                value={formatCurrency(preQual.estimatedMonthlyPayment)}
              />
            </DetailSection>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <DetailSection title="Personal Details">
            <DetailRow label="Full Name" value={applicantName} />
            <DetailRow
              label="Date of Birth"
              value={String(personalInfo.dateOfBirth ?? "—")}
            />
            <DetailRow
              label="Citizenship"
              value={String(financialInfo.citizenshipStatus ?? "—")}
            />
            <DetailRow
              label="Marital Status"
              value={String(financialInfo.maritalStatus ?? "—")}
            />
            <DetailRow label="Current Address" value={currentAddress} />
            <DetailRow
              label="Years at Address"
              value={String(personalInfo.yearsAtAddress ?? "—")}
            />
          </DetailSection>

          <DetailSection title="Property & Purchase">
            <DetailRow
              label="Home Found"
              value={onboarding?.homeFound ? "Yes" : "No"}
            />
            <DetailRow
              label="Property Type"
              value={
                onboarding?.propertyType
                  ? formatLabel(onboarding.propertyType)
                  : "—"
              }
            />
            <DetailRow
              label="Property Use"
              value={
                onboarding?.propertyUse
                  ? formatLabel(onboarding.propertyUse)
                  : "—"
              }
            />
            <DetailRow
              label="Target / Property Address"
              value={propertyAddress ? formatAddress(propertyAddress) : "—"}
            />
            <DetailRow
              label="Purchase Price"
              value={
                onboarding?.purchasePrice
                  ? formatCurrency(onboarding.purchasePrice)
                  : "—"
              }
            />
            <DetailRow
              label="Target Home Price"
              value={
                onboarding?.targetHomePrice
                  ? formatCurrency(onboarding.targetHomePrice)
                  : "—"
              }
            />
          </DetailSection>

          <DetailSection title="Asset Balances">
            <DetailRow
              label="Checking"
              value={formatCurrency(assets?.checkingBalance ?? 0)}
            />
            <DetailRow
              label="Savings"
              value={formatCurrency(assets?.savingsBalance ?? 0)}
            />
            <DetailRow
              label="Investments"
              value={formatCurrency(assets?.investmentBalance ?? 0)}
            />
            <DetailRow
              label="Total Liquid"
              value={formatCurrency(liquidAssets)}
            />
          </DetailSection>
        </div>
      </div>
    </section>
  );
}

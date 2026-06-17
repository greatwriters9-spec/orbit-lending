"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgePercent,
  Building2,
  Check,
  CircleDollarSign,
  Landmark,
  Lock,
  Wallet,
} from "lucide-react";

import { submitDownPaymentVerificationAction } from "@/lib/dashboard/down-payment-actions";
import { formatCurrency } from "@/lib/loans/queries";
import {
  resolveStatusColorVariant,
  STATUS_BADGE_BASE,
  statusBadgeClasses,
} from "@/lib/status-colors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-kit/button";
import { StatusLabelBadge } from "@/components/ui-kit/status-badge";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

type FeatureCardVariant = "navy" | "mint" | "surface";

function FeatureStatusPill({
  children,
  className,
}: {
  children: React.ReactNode;
  variant?: FeatureCardVariant;
  className?: string;
}) {
  const label = String(children);
  const colorVariant = resolveStatusColorVariant(label);

  return (
    <span
      className={cn(
        STATUS_BADGE_BASE,
        "shrink-0 rounded-full",
        statusBadgeClasses(colorVariant),
        className,
      )}
    >
      {children}
    </span>
  );
}

function CompactFeatureHeader({
  title,
  eyebrow,
  icon,
  variant = "surface",
  statusLabel,
  titleClassName,
}: {
  title: string;
  eyebrow?: string;
  icon: React.ReactNode;
  variant?: FeatureCardVariant;
  statusLabel?: string;
  titleClassName?: string;
}) {
  const isNavy = variant === "navy";
  const isMint = variant === "mint";

  return (
    <div className="relative flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            isNavy && "bg-white/12 ring-1 ring-white/15",
            isMint && "bg-[#4338CA]/14 ring-1 ring-[#4338CA]/30",
            variant === "surface" && "bg-brand-blue/8 ring-1 ring-brand-border",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          {eyebrow ? (
            <p
              className={cn(
                "dashboard-label",
                isNavy && "dashboard-label-light !text-white/60",
                isMint && "!text-[#4338CA]",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h3
            className={cn(
              titleClassName ?? "text-xl font-bold leading-snug tracking-tight",
              isNavy ? "text-white" : "text-brand-navy",
              eyebrow ? "mt-1" : "",
            )}
          >
            {title}
          </h3>
        </div>
      </div>
      {statusLabel ? (
        <FeatureStatusPill variant={variant}>{statusLabel}</FeatureStatusPill>
      ) : null}
    </div>
  );
}

function FeatureCardShell({
  title,
  eyebrow,
  icon,
  variant = "surface",
  statusLabel,
  children,
  className,
  id,
  footer,
  titleClassName,
}: {
  title: string;
  eyebrow?: string;
  icon: React.ReactNode;
  variant?: FeatureCardVariant;
  statusLabel?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  footer?: React.ReactNode;
  titleClassName?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden p-6",
        variant === "navy" && "dashboard-card-navy",
        variant === "mint" && "dashboard-card-mint",
        variant === "surface" && "dashboard-card",
        className,
      )}
    >
      <CompactFeatureHeader
        title={title}
        eyebrow={eyebrow}
        icon={icon}
        variant={variant}
        statusLabel={statusLabel}
        titleClassName={titleClassName}
      />

      <div className="relative mt-5 flex flex-1 flex-col">{children}</div>

      {footer ? <div className="relative mt-5">{footer}</div> : null}
    </section>
  );
}

function CardPrimaryAmount({
  label,
  value,
  variant = "surface",
}: {
  label: string;
  value: string;
  variant?: FeatureCardVariant;
}) {
  const isNavy = variant === "navy";
  const isMint = variant === "mint";

  return (
    <div>
      <p
        className={cn(
          isNavy && "dashboard-balance-primary",
          isMint && "dashboard-balance-mint",
          !isNavy && !isMint && "financial-value text-brand-navy",
        )}
      >
        {value}
      </p>
      <p
        className={cn(
          "mt-2",
          isNavy && "dashboard-balance-label",
          isMint && "text-sm font-semibold text-brand-navy/75",
          !isNavy && !isMint && "text-sm font-medium text-brand-navy/55",
        )}
      >
        {label}
      </p>
    </div>
  );
}

function NavyInsetPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-1 backdrop-blur-sm">
      {children}
    </div>
  );
}

function SummaryListRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <span className="text-sm font-medium text-white/65">{label}</span>
      <span className="text-[15px] font-semibold tracking-tight tabular-nums text-white">
        {value}
      </span>
    </div>
  );
}

function MetricTile({
  label,
  value,
  badge,
  prominent = false,
  className,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  prominent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border bg-white px-4 py-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "tracking-tight tabular-nums text-brand-navy",
            prominent
              ? "text-[22px] font-bold leading-tight"
              : "text-[15px] font-semibold",
          )}
        >
          {value}
        </p>
        {badge}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-brand-navy/70">{label}</p>
    </div>
  );
}

function formatDisplayAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length >= 8) {
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }
  return accountNumber;
}

function maskAccountNumberDisplay(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  const last4 = digits.slice(-4) || "••••";
  return `•••• ${last4}`;
}

function PathwardBankCardSummary({
  bankName,
  accountNumber,
  onViewDetails,
}: {
  bankName: string;
  accountNumber: string;
  onViewDetails: () => void;
}) {
  return (
    <div className="py-3">
      <p className="dashboard-label-light">{bankName}</p>
      <button type="button" onClick={onViewDetails} className="mt-2 w-full text-left">
        <p className="font-mono text-sm font-semibold tracking-wide text-white tabular-nums">
          {maskAccountNumberDisplay(accountNumber)}
        </p>
        <p className="mt-2 text-xs font-semibold text-white/80">View wire details</p>
      </button>
    </div>
  );
}

function PathwardDepositInstructionsModal({
  open,
  onClose,
  amount,
  bankName,
  accountHolder,
  routingNumber,
  accountNumber,
  canMarkPaid,
  isSubmitting,
  onMarkPaid,
  error,
}: {
  open: boolean;
  onClose: () => void;
  amount: string;
  bankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumber: string;
  canMarkPaid: boolean;
  isSubmitting: boolean;
  onMarkPaid: () => void;
  error?: string | null;
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="pathward-deposit-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="pathward-deposit-title" className="text-lg font-bold text-brand-navy">
          Deposit Instructions
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Deposit <span className="font-semibold text-brand-navy">{amount}</span> to your
          linked Pathward account using the wire details below.
        </p>

        <div className="mt-5 space-y-3 rounded-xl border border-brand-border bg-brand-background/50 px-4 py-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Bank</span>
            <span className="font-semibold text-brand-navy">{bankName}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Account Holder</span>
            <span className="text-right font-semibold text-brand-navy">{accountHolder}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Routing Number</span>
            <span className="font-mono font-semibold text-brand-navy tabular-nums">
              {routingNumber}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Account Number</span>
            <span className="font-mono font-semibold text-brand-navy tabular-nums">
              {formatDisplayAccountNumber(accountNumber)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-brand-border pt-3 text-sm">
            <span className="text-muted-foreground">Amount to Deposit</span>
            <span className="font-semibold text-brand-navy">{amount}</span>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          After you send your deposit, press Paid. Orbit Mortgage will verify your transfer
          and update your funding status.
        </p>

        {error ? (
          <p className="mt-3 rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-3 py-2 text-sm text-brand-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {canMarkPaid ? (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={onMarkPaid}
              className="h-10 flex-1 bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              {isSubmitting ? "Submitting..." : "Paid"}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function PathwardDownPaymentStrip({
  requiredAmount,
  isPendingApproval,
  isVerified,
  onMakePayment,
}: {
  requiredAmount: string;
  isPendingApproval: boolean;
  isVerified: boolean;
  onMakePayment: () => void;
}) {
  const needsPayment = !isVerified && !isPendingApproval;

  return (
    <div className="border-b border-white/10 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-white/65">Required Down Payment</span>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-success/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-100">
              <Check className="size-3.5" />
              Verified
            </span>
          ) : isPendingApproval ? (
            <FeatureStatusPill>Pending</FeatureStatusPill>
          ) : null}
          <span className="text-[15px] font-semibold tracking-tight tabular-nums text-white">
            {requiredAmount}
          </span>
        </div>
      </div>

      {needsPayment ? (
        <button
          type="button"
          onClick={onMakePayment}
          className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-white text-xs font-semibold text-brand-blue transition-colors hover:bg-white/90"
        >
          Make Payment
        </button>
      ) : null}
    </div>
  );
}

function FundingProgressFooter({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-white/70">
        <span>Funding Progress</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-white transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function MortgageSummaryCard({ view }: { view: MortgageDashboardView }) {
  const summaryRows = [
    {
      label: "Down Payment",
      value: formatCurrency(view.summary.requiredDownPayment),
    },
    {
      label: "Interest Rate",
      value: `${view.details.interestRate.toFixed(2)}%`,
    },
    {
      label: "Monthly Payment",
      value: formatCurrency(view.summary.estimatedMonthlyPayment),
    },
  ];

  return (
    <FeatureCardShell
      title="Mortgage"
      icon={<Landmark className="size-5 text-white" strokeWidth={1.75} />}
      variant="navy"
      statusLabel={view.summary.statusLabel}
    >
      <div className="flex flex-1 flex-col justify-between gap-6">
        <CardPrimaryAmount
          label={view.summary.amountLabel}
          value={formatCurrency(view.summary.approvedMortgageAmount)}
          variant="navy"
        />

        {view.summary.isEligibleAmount ? (
          <p className="text-sm leading-relaxed text-white/70">
            This amount reflects your eligibility. Continue your application to proceed
            toward approval and funding.
          </p>
        ) : null}

        <NavyInsetPanel>
          {summaryRows.map((row) => (
            <SummaryListRow key={row.label} label={row.label} value={row.value} />
          ))}
        </NavyInsetPanel>
      </div>
    </FeatureCardShell>
  );
}

export function PathwardFundingAccountCard({ view }: { view: MortgageDashboardView }) {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const funding = view.pathwardFunding;
  const dp = view.downPayment;
  const accountNumber = view.linkedAccount?.accountNumber ?? `••••${funding.accountNumberLast4}`;

  const isPendingApproval =
    dp.status === "pending_verification" ||
    funding.fundingStatus === "Pending";
  const isVerified =
    dp.status === "verified" || funding.fundingStatus === "Verified";
  const requiredDownPayment = formatCurrency(
    view.summary.requiredDownPayment || funding.requiredDeposit,
  );

  const openDepositModal = () => {
    setSubmitError(null);
    setDepositModalOpen(true);
  };
  const closeDepositModal = () => {
    setSubmitError(null);
    setDepositModalOpen(false);
  };

  const handleMarkAsPaid = () => {
    if (!view.applicationId) return;
    startTransition(async () => {
      const result = await submitDownPaymentVerificationAction(view.applicationId!);
      if (result.error) {
        setSubmitError(result.error);
        return;
      }
      setDepositModalOpen(false);
      router.refresh();
    });
  };

  if (!funding.linked) {
    const statusLabel = funding.setupPending ? "Setup Pending" : "Not Linked";
    const message = funding.setupPending
      ? "Your Funding Account is being set up. You will receive an email with wire instructions once it is ready."
      : view.state === "approved"
        ? "Your Funding Account will be linked after application approval."
        : "Your Funding Account will appear here once your application is approved.";

    return (
      <FeatureCardShell
        id="pathward-funding"
        title="Funding Account"
        icon={<Building2 className="size-5 text-white" strokeWidth={1.75} />}
        variant="navy"
        statusLabel={statusLabel}
        footer={<FundingProgressFooter percent={0} />}
      >
        <CardPrimaryAmount label="Current Balance" value="$0.00" variant="navy" />
        <p className="mt-4 text-sm leading-relaxed text-white/70">{message}</p>
      </FeatureCardShell>
    );
  }

  return (
    <>
      <FeatureCardShell
        id="pathward-funding"
        title="Funding Account"
        icon={<Building2 className="size-5 text-white" strokeWidth={1.75} />}
        variant="navy"
        statusLabel={funding.fundingStatus}
        footer={<FundingProgressFooter percent={funding.fundingPercent} />}
      >
        <CardPrimaryAmount
          label="Current Balance"
          value={formatCurrency(funding.currentBalance)}
          variant="navy"
        />

        <NavyInsetPanel>
          {funding.showFundingActions ? (
            <>
              <PathwardDownPaymentStrip
                requiredAmount={requiredDownPayment}
                isPendingApproval={isPendingApproval}
                isVerified={isVerified}
                onMakePayment={openDepositModal}
              />

              <PathwardBankCardSummary
                bankName={funding.bankName}
                accountNumber={accountNumber}
                onViewDetails={openDepositModal}
              />
            </>
          ) : (
            <p className="py-3 text-sm leading-relaxed text-white/70">
              Deposit instructions will be available once your application is approved.
            </p>
          )}
        </NavyInsetPanel>
      </FeatureCardShell>

      <PathwardDepositInstructionsModal
        open={depositModalOpen}
        onClose={closeDepositModal}
        amount={requiredDownPayment}
        bankName={funding.bankName}
        accountHolder={funding.accountHolder}
        routingNumber={funding.routingNumber}
        accountNumber={accountNumber}
        canMarkPaid={!isPendingApproval && !isVerified && Boolean(view.applicationId)}
        isSubmitting={isSubmitting}
        onMarkPaid={handleMarkAsPaid}
        error={submitError}
      />
    </>
  );
}

export function ClosingFundsCard({
  view,
  className,
}: {
  view: MortgageDashboardView;
  className?: string;
}) {
  const funds = view.closingFunds;
  const locked = funds.status === "locked";
  const pendingRelease = funds.status === "ready_for_closing";
  const canTransfer = funds.canTransferToEscrow && funds.transferableBalance > 0;

  return (
    <FeatureCardShell
      title="Closing Funds"
      eyebrow="Closing Disbursement"
      icon={
        locked ? (
          <Lock className="size-5 text-[#4338CA]" strokeWidth={1.75} />
        ) : (
          <CircleDollarSign className="size-5 text-[#4338CA]" strokeWidth={1.75} />
        )
      }
      variant="mint"
      statusLabel={funds.statusLabel}
      className={cn("ring-1 ring-[#4338CA]/10", className)}
    >
      <div className="flex flex-1 flex-col justify-between gap-5">
        <CardPrimaryAmount
          label="Total Closing Amount"
          value={formatCurrency(funds.projectedTransferAmount)}
          variant="mint"
        />

        <MetricTile
          label={
            pendingRelease ? "Pathward Closing Balance" : "Transferable Balance"
          }
          value={formatCurrency(
            pendingRelease ? funds.pendingPathwardBalance : funds.transferableBalance,
          )}
          prominent
          className="border-[#4338CA]/25 bg-white/90 shadow-md"
        />

        {locked ? (
          <p className="text-sm font-medium leading-relaxed text-brand-navy/75">
            Includes your approved mortgage and verified down payment. Available after
            both are in Pathward and Orbit Mortgage releases closing funds.
          </p>
        ) : pendingRelease ? (
          <p className="text-sm font-medium leading-relaxed text-brand-navy/75">
            Your mortgage and down payment are in Pathward (
            {formatCurrency(funds.pendingPathwardBalance)}). Orbit Mortgage will release
            the full amount for escrow transfer shortly.
          </p>
        ) : canTransfer ? (
          <Link
            href="/wallet/withdraw"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
          >
            Transfer to seller via escrow
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <p className="text-sm font-medium leading-relaxed text-brand-navy/75">
            Closing funds are being prepared for transfer.
          </p>
        )}
      </div>
    </FeatureCardShell>
  );
}

function FactBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-info-panel">
      <p className="dashboard-label">{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-brand-navy">{value}</p>
    </div>
  );
}

export function MortgageDetailsCard({ view }: { view: MortgageDashboardView }) {
  return (
    <section className="dashboard-card p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
          <BadgePercent className="size-5 text-brand-blue" strokeWidth={1.75} />
        </div>
        <div>
          <p className="dashboard-label">Loan Terms</p>
          <h2 className="mt-1 text-xl font-bold text-brand-navy">Mortgage Details</h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FactBlock label="Program" value={view.details.productName} />
        <FactBlock
          label="Interest Rate"
          value={`${view.details.interestRate.toFixed(2)}%`}
        />
        <FactBlock label="Mortgage Term" value={`${view.details.termYears} Years`} />
        <FactBlock label="Property Type" value={view.details.propertyType} />
        <FactBlock label="Occupancy Type" value={view.details.propertyUsage} />
        <FactBlock label="LTV" value={`${view.details.loanToValue}%`} />
      </div>
    </section>
  );
}

export function RequiredDownPaymentCard({ view }: { view: MortgageDashboardView }) {
  const dp = view.downPayment;
  const linked = view.linkedAccount;
  const funding = view.pathwardFunding;
  const isVerified = dp.status === "verified";
  const isComplete = dp.remainingAmount <= 0;

  return (
    <section id="down-payment" className="dashboard-card overflow-hidden">
      <div className="border-b border-brand-border px-6 py-6 md:px-8">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
            <Wallet className="size-5 text-brand-blue" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Required Down Payment</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Deposit funds to your Pathward account after your application is approved.
              Orbit Mortgage will verify your deposit before closing funds are released.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.4fr_1fr] md:gap-8 md:px-8 md:py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricTile
            label="Required Deposit"
            value={formatCurrency(dp.requiredAmount)}
          />
          <MetricTile
            label="Received Amount"
            value={formatCurrency(dp.amountReceived)}
            badge={
              isVerified ? (
                <StatusLabelBadge
                  label="Verified"
                  className="inline-flex items-center gap-1"
                  uppercase={false}
                />
              ) : undefined
            }
          />
          <MetricTile
            label="Remaining Amount"
            value={formatCurrency(dp.remainingAmount)}
            badge={
              isComplete ? (
                <StatusLabelBadge label="Complete" uppercase={false} />
              ) : undefined
            }
          />
        </div>

        {linked && funding.linked ? (
          <div className="dashboard-info-panel">
            <p className="text-sm font-semibold text-brand-navy">Deposit to Pathward Account</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-brand-navy/55">Routing Number</span>
                <span className="font-mono font-semibold text-brand-navy tabular-nums">
                  {funding.routingNumber}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-brand-navy/55">Account Number</span>
                <span className="font-mono font-semibold text-brand-navy tabular-nums">
                  {maskAccountNumberDisplay(linked.accountNumber)}
                </span>
              </div>
            </div>
            <Link
              href="#pathward-funding"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
            >
              View deposit instructions
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="dashboard-info-panel">
            <p className="text-sm font-semibold text-brand-navy">Funding Account Details</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your Pathward account will appear here once linked by Orbit Mortgage after
              application approval.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

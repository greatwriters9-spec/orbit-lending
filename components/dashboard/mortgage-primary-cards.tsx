"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-kit/button";
import type { MortgageDashboardView } from "@/types/mortgage-dashboard";

type FeatureCardVariant = "navy" | "mint" | "surface";

function FeatureStatusPill({
  children,
  variant = "navy",
  className,
}: {
  children: React.ReactNode;
  variant?: FeatureCardVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
        variant === "navy"
          ? "border border-brand-blue/30 bg-brand-blue/15 text-brand-blue"
          : variant === "mint"
            ? "border border-brand-success/30 bg-brand-success/10 text-brand-success"
            : "border border-brand-border bg-brand-background text-brand-navy",
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
            isMint && "bg-brand-success/10 ring-1 ring-brand-success/20",
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
                isMint && "!text-brand-navy/45",
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
        <FeatureStatusPill
          variant={variant}
          className={
            isNavy
              ? "border-white/20 bg-white/12 text-white"
              : undefined
          }
        >
          {statusLabel}
        </FeatureStatusPill>
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
          isMint && "text-sm font-medium text-brand-navy/60",
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
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  prominent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white px-4 py-4 shadow-sm">
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
      <p className="mt-1.5 text-sm font-medium text-brand-navy/55">{label}</p>
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

function PathwardBankCardPanel({
  bankName,
  accountHolder,
  routingNumber,
  accountNumber,
  open,
  onOpen,
  panelRef,
}: {
  bankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumber: string;
  open: boolean;
  onOpen: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={panelRef} id="pathward-bank-details" className="mt-3">
      <p className="dashboard-label-light">{bankName}</p>
      {open ? (
        <div className="mt-2 space-y-2">
          <p className="font-mono text-sm font-semibold tracking-wide text-white tabular-nums">
            {formatDisplayAccountNumber(accountNumber)}
          </p>
          <p className="truncate text-xs font-medium text-white/65">{accountHolder}</p>
          <div className="flex items-baseline gap-2 border-t border-white/10 pt-2">
            <span className="dashboard-label-light">Routing</span>
            <span className="font-mono text-xs font-semibold text-white tabular-nums">
              {routingNumber}
            </span>
          </div>
        </div>
      ) : (
        <button type="button" onClick={onOpen} className="mt-2 w-full text-left">
          <p className="font-mono text-sm font-semibold tracking-wide text-white tabular-nums">
            {maskAccountNumberDisplay(accountNumber)}
          </p>
          <p className="mt-2 text-xs font-semibold text-white/80">View wire details</p>
        </button>
      )}
    </div>
  );
}

function PathwardDownPaymentStrip({
  requiredAmount,
  isPendingApproval,
  isVerified,
  canSubmitDepositCompleted,
  isSubmitting,
  onDepositCompleted,
  onMakePayment,
}: {
  requiredAmount: string;
  isPendingApproval: boolean;
  isVerified: boolean;
  canSubmitDepositCompleted: boolean;
  isSubmitting: boolean;
  onDepositCompleted: () => void;
  onMakePayment: () => void;
}) {
  const needsPayment = !isVerified && !isPendingApproval && !canSubmitDepositCompleted;

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
            <FeatureStatusPill className="border-white/20 bg-white/12 text-white">
              Pending
            </FeatureStatusPill>
          ) : null}
          <span className="text-[15px] font-semibold tracking-tight tabular-nums text-white">
            {requiredAmount}
          </span>
        </div>
      </div>

      {canSubmitDepositCompleted ? (
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onDepositCompleted}
          className="mt-3 h-9 w-full rounded-xl bg-white text-xs font-semibold text-brand-blue hover:bg-white/90"
        >
          {isSubmitting ? "Submitting..." : "Deposit Completed"}
        </Button>
      ) : needsPayment ? (
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
      title="Mortgage Summary"
      eyebrow="Loan Account"
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
  const [isSubmitting, startTransition] = useTransition();
  const [bankDetailsOpen, setBankDetailsOpen] = useState(false);
  const bankDetailsRef = useRef<HTMLDivElement>(null);
  const funding = view.pathwardFunding;
  const dp = view.downPayment;
  const accountNumber = view.linkedAccount?.accountNumber ?? `••••${funding.accountNumberLast4}`;

  useEffect(() => {
    if (!bankDetailsOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        bankDetailsRef.current &&
        !bankDetailsRef.current.contains(event.target as Node)
      ) {
        setBankDetailsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [bankDetailsOpen]);

  const revealBankDetails = () => {
    setBankDetailsOpen(true);
    requestAnimationFrame(() => {
      bankDetailsRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  };

  const isPendingApproval =
    dp.status === "pending_verification" ||
    funding.fundingStatus === "Pending Verification";
  const isVerified =
    dp.status === "verified" || funding.fundingStatus === "Verified";
  const requiredDownPayment = formatCurrency(
    view.summary.requiredDownPayment || funding.requiredDeposit,
  );

  const handleDepositCompleted = () => {
    if (!view.applicationId) return;
    startTransition(async () => {
      await submitDownPaymentVerificationAction(view.applicationId!);
    });
  };

  if (!funding.linked) {
    const statusLabel = funding.setupPending ? "Setup Pending" : "Not Linked";
    const message = funding.setupPending
      ? "Your Pathward Funding Account is being set up. You will receive an email with wire instructions once it is ready."
      : view.state === "approved"
        ? "Your Pathward Funding Account will be linked after application approval."
        : "Your Pathward Funding Account will appear here once your application is approved.";

    return (
      <FeatureCardShell
        id="pathward-funding"
        title="Pathward Funding Account"
        eyebrow="Funding Account"
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
    <FeatureCardShell
      id="pathward-funding"
      title="Pathward Funding Account"
      eyebrow="Funding Account"
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
              canSubmitDepositCompleted={Boolean(
                dp.canSubmitDepositCompleted && view.applicationId,
              )}
              isSubmitting={isSubmitting}
              onDepositCompleted={handleDepositCompleted}
              onMakePayment={revealBankDetails}
            />

            <PathwardBankCardPanel
              panelRef={bankDetailsRef}
              open={bankDetailsOpen}
              onOpen={() => setBankDetailsOpen(true)}
              bankName={funding.bankName}
              accountHolder={funding.accountHolder}
              routingNumber={funding.routingNumber}
              accountNumber={accountNumber}
            />
          </>
        ) : (
          <p className="py-3 text-sm leading-relaxed text-white/70">
            Deposit instructions will be available once your application is approved.
          </p>
        )}
      </NavyInsetPanel>
    </FeatureCardShell>
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
          <Lock className="size-5 text-brand-success" strokeWidth={1.75} />
        ) : (
          <CircleDollarSign className="size-5 text-brand-success" strokeWidth={1.75} />
        )
      }
      variant="mint"
      statusLabel={funds.statusLabel}
      className={className}
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
        />

        {locked ? (
          <p className="text-sm leading-relaxed text-brand-navy/55">
            Includes your approved mortgage and verified down payment. Available after
            both are in Pathward and Orbit Mortgage releases closing funds.
          </p>
        ) : pendingRelease ? (
          <p className="text-sm leading-relaxed text-brand-navy/55">
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
          <p className="text-sm leading-relaxed text-brand-navy/55">
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
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-success/10 px-2 py-0.5 text-xs font-semibold text-brand-success">
                  <Check className="size-3" />
                  Verified
                </span>
              ) : undefined
            }
          />
          <MetricTile
            label="Remaining Amount"
            value={formatCurrency(dp.remainingAmount)}
            badge={
              isComplete ? (
                <span className="rounded-full bg-brand-success/10 px-2 py-0.5 text-xs font-semibold text-brand-success">
                  Complete
                </span>
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
            <p className="text-sm font-semibold text-brand-navy">Pathward Funding Details</p>
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

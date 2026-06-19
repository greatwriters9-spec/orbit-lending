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
import { initiateEscrowTransferAction } from "@/lib/wallet/escrow-transfer";
import { formatCurrency } from "@/lib/loans/queries";
import {
  resolveStatusColorVariant,
  type StatusColorVariant,
} from "@/lib/status-colors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { StatusLabelBadge } from "@/components/ui-kit/status-badge";
import type { MortgageDashboardView, SellerDestinationDetails } from "@/types/mortgage-dashboard";

type FeatureCardVariant = "navy" | "mint" | "surface";

const PREMIUM_BADGE_CLASSES: Record<StatusColorVariant, string> = {
  success: "dashboard-premium-badge dashboard-premium-badge--success",
  pending: "dashboard-premium-badge dashboard-premium-badge--pending",
  danger: "dashboard-premium-badge dashboard-premium-badge--danger",
  prequalified: "dashboard-premium-badge dashboard-premium-badge--prequalified",
  closing: "dashboard-premium-badge dashboard-premium-badge--closing",
  neutral: "dashboard-premium-badge dashboard-premium-badge--neutral",
};

function PremiumStatusBadge({
  label,
  variant,
}: {
  label: string;
  variant?: StatusColorVariant;
}) {
  const resolved = variant ?? resolveStatusColorVariant(label);

  return <span className={PREMIUM_BADGE_CLASSES[resolved]}>{label}</span>;
}

type PremiumCardVariant = "mortgage" | "funding" | "closing";

const PREMIUM_CARD_VARIANT_CLASS: Record<PremiumCardVariant, string> = {
  mortgage: "dashboard-premium-card--mortgage",
  funding: "dashboard-premium-card--funding",
  closing: "dashboard-premium-card--closing",
};

function PremiumCardHeader({
  title,
  icon,
  badgeLabel,
  badgeVariant,
}: {
  title: string;
  icon: React.ReactNode;
  badgeLabel?: string;
  badgeVariant?: StatusColorVariant;
}) {
  return (
    <div className="dashboard-premium-header shrink-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="dashboard-premium-icon-wrap shrink-0">{icon}</div>
        <h3 className="dashboard-premium-card-title">{title}</h3>
      </div>
      {badgeLabel ? (
        <PremiumStatusBadge label={badgeLabel} variant={badgeVariant} />
      ) : null}
    </div>
  );
}

function PremiumHeroBalance({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-premium-hero-zone shrink-0">
      <p className="dashboard-premium-hero-label">{label}</p>
      <p className="dashboard-premium-hero-balance">{value}</p>
    </div>
  );
}

function PremiumCardBody({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-premium-card-body">{children}</div>;
}

function PremiumCardFooter({ children }: { children: React.ReactNode }) {
  return <div className="dashboard-premium-card-footer">{children}</div>;
}

function PremiumInsetPanel({
  children,
  fixed = false,
  compact = false,
  funding = false,
  closing = false,
  className,
}: {
  children: React.ReactNode;
  fixed?: boolean;
  compact?: boolean;
  funding?: boolean;
  closing?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "dashboard-premium-inset-panel",
        fixed && "dashboard-premium-inset-panel--fixed",
        compact && "dashboard-premium-inset-panel--compact",
        funding && "dashboard-premium-inset-panel--funding",
        closing && "dashboard-premium-inset-panel--closing",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PremiumInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="dashboard-premium-row">
      <span className="dashboard-premium-row-label">{label}</span>
      <span className="dashboard-premium-row-value">{value}</span>
    </div>
  );
}

function PremiumActionRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <div className="dashboard-premium-row">
      <span className="dashboard-premium-row-label">{label}</span>
      {onClick ? (
        <button type="button" onClick={onClick} className="dashboard-premium-row-action">
          {value}
        </button>
      ) : (
        <span className="dashboard-premium-row-value">{value}</span>
      )}
    </div>
  );
}

function PremiumMortgageCard({
  id,
  variant = "mortgage",
  children,
  className,
}: {
  id?: string;
  variant?: PremiumCardVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("dashboard-premium-card", PREMIUM_CARD_VARIANT_CLASS[variant], className)}
    >
      {children}
    </section>
  );
}

function resolveClosingBadgeVariant(
  status: MortgageDashboardView["closingFunds"]["status"],
): StatusColorVariant | undefined {
  if (status === "transferred") return "closing";
  if (status === "available") return "success";
  if (status === "transfer_pending") return "pending";
  if (status === "ready_for_closing") return "pending";
  return undefined;
}

function FeatureStatusPill({
  children,
}: {
  children: React.ReactNode;
  variant?: FeatureCardVariant;
  className?: string;
}) {
  return <PremiumStatusBadge label={String(children)} />;
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

export function PathwardDepositInstructionsModal({
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

export function PathwardEscrowTransferModal({
  open,
  onClose,
  amount,
  isSubmitting,
  onConfirm,
  error,
}: {
  open: boolean;
  onClose: () => void;
  amount: string;
  isSubmitting: boolean;
  onConfirm: (seller: SellerDestinationDetails) => void;
  error?: string | null;
}) {
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [notes, setNotes] = useState("");

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

  useEffect(() => {
    if (!open) {
      setAccountName("");
      setBankName("");
      setRoutingNumber("");
      setAccountNumber("");
      setNotes("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const canSubmit =
    accountName.trim().length >= 2 &&
    bankName.trim().length >= 2 &&
    /^\d{9}$/.test(routingNumber.trim()) &&
    /^\d{6,17}$/.test(accountNumber.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="escrow-transfer-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-brand-border bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="escrow-transfer-title" className="text-lg font-bold text-brand-navy">
          Transfer to Seller via Escrow
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enter the seller&apos;s bank account details for your escrow transfer of{" "}
          <span className="font-semibold text-brand-navy">{amount}</span>. Once
          confirmed, your funding and closing balances will show $0.00 while Orbit
          Mortgage reviews the transfer.
        </p>

        <div className="mt-5 space-y-4">
          <EscrowFormField label="Transfer Amount">
            <Input
              value={amount}
              readOnly
              className="h-10 bg-brand-background/60 font-semibold text-brand-navy"
            />
          </EscrowFormField>

          <EscrowFormField label="Seller Account Holder Name">
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Seller or escrow account name"
              className="h-10"
            />
          </EscrowFormField>

          <EscrowFormField label="Seller Bank Name">
            <Input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Bank name"
              className="h-10"
            />
          </EscrowFormField>

          <EscrowFormField label="Routing Number">
            <Input
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="9-digit routing number"
              maxLength={9}
              className="h-10 font-mono"
            />
          </EscrowFormField>

          <EscrowFormField label="Account Number">
            <Input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Seller account number"
              maxLength={17}
              className="h-10 font-mono"
            />
          </EscrowFormField>

          <EscrowFormField label="Notes (optional)">
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reference or escrow instructions..."
              className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
            />
          </EscrowFormField>
        </div>

        {error ? (
          <p className="mt-3 rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-3 py-2 text-sm text-brand-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            disabled={isSubmitting || !canSubmit}
            onClick={() =>
              onConfirm({
                accountName: accountName.trim(),
                bankName: bankName.trim(),
                routingNumber: routingNumber.trim(),
                accountNumber: accountNumber.trim(),
                notes: notes.trim() || undefined,
              })
            }
            className="h-10 flex-1 bg-brand-blue text-white hover:bg-brand-blue/90"
          >
            {isSubmitting ? "Initiating..." : "Confirm Transfer"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function EscrowFormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-brand-navy">
        {label}
      </label>
      {children}
    </div>
  );
}

function FundingProgressFooter({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="dashboard-premium-progress">
      <div className="dashboard-premium-progress-label">
        <span>Funding Progress</span>
        <span>{clamped}%</span>
      </div>
      <div className="dashboard-premium-progress-track">
        <div
          className="dashboard-premium-progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function FundingDepositStrip({
  depositLabel,
  requiredAmount,
  isPendingApproval,
  isVerified,
  onMakePayment,
}: {
  depositLabel: string;
  requiredAmount: string;
  isPendingApproval: boolean;
  isVerified: boolean;
  onMakePayment?: () => void;
}) {
  const needsPayment = !isVerified && !isPendingApproval && Boolean(onMakePayment);

  return (
    <div className="border-b border-white/10 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-white/65">{depositLabel}</span>
        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-success/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-100">
              <Check className="size-3.5" />
              Verified
            </span>
          ) : isPendingApproval ? (
            <PremiumStatusBadge label="Pending" variant="pending" />
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
          className="dashboard-premium-make-payment-btn"
        >
          Make Payment
        </button>
      ) : null}
    </div>
  );
}

function FundingBankSummary({
  bankName,
  accountNumber,
  onViewDetails,
}: {
  bankName: string;
  accountNumber: string;
  onViewDetails?: () => void;
}) {
  return (
    <div className="py-3">
      <p className="dashboard-label-light">{bankName}</p>
      {onViewDetails ? (
        <button type="button" onClick={onViewDetails} className="mt-2 w-full text-left">
          <p className="font-mono text-sm font-semibold tracking-wide text-white tabular-nums">
            {maskAccountNumberDisplay(accountNumber)}
          </p>
          <p className="mt-2 text-xs font-semibold text-white/80">View wire details</p>
        </button>
      ) : (
        <div className="mt-2">
          <p className="font-mono text-sm font-semibold tracking-wide text-white tabular-nums">
            {maskAccountNumberDisplay(accountNumber)}
          </p>
        </div>
      )}
    </div>
  );
}

function FundingAccountPanel({
  bankName,
  accountNumber,
  statusLabel,
  depositLabel,
  depositAmount,
  showDepositUI,
  showFundingActions,
  isPendingApproval,
  isVerified,
  onMakePayment,
  onViewDetails,
}: {
  bankName: string;
  accountNumber: string;
  statusLabel: string;
  depositLabel?: string;
  depositAmount?: string;
  showDepositUI?: boolean;
  showFundingActions?: boolean;
  isPendingApproval?: boolean;
  isVerified?: boolean;
  onMakePayment?: () => void;
  onViewDetails?: () => void;
}) {
  return (
    <PremiumInsetPanel funding>
      {showFundingActions ? (
        <>
          {showDepositUI && depositLabel && depositAmount ? (
            <FundingDepositStrip
              depositLabel={depositLabel}
              requiredAmount={depositAmount}
              isPendingApproval={Boolean(isPendingApproval)}
              isVerified={Boolean(isVerified)}
              onMakePayment={onMakePayment}
            />
          ) : (
            <p className="border-b border-white/10 py-3 text-sm leading-relaxed text-white/70">
              Your escrow transfer is being reviewed. No deposit is
              required at this time.
            </p>
          )}

          <FundingBankSummary
            bankName={bankName}
            accountNumber={accountNumber}
            onViewDetails={showDepositUI ? onViewDetails : undefined}
          />
        </>
      ) : (
        <>
          <PremiumInfoRow label="Status" value={statusLabel} />
          <PremiumInfoRow label="Bank" value={bankName} />
          <PremiumInfoRow label="Account" value={maskAccountNumberDisplay(accountNumber)} />
        </>
      )}
    </PremiumInsetPanel>
  );
}

function ClosingFundsPanel({
  availableBalance,
  pendingBalance,
  statusLabel,
  actionLabel,
}: {
  availableBalance: string;
  pendingBalance: string;
  statusLabel: string;
  actionLabel: string;
}) {
  return (
    <div className="dashboard-premium-closing-stack">
      <div className="dashboard-premium-closing-balances">
        <div className="dashboard-premium-closing-balance-cell">
          <p className="dashboard-premium-closing-balance-label">Available Balance</p>
          <p className="dashboard-premium-closing-balance-value">{availableBalance}</p>
        </div>
        <div className="dashboard-premium-closing-balance-cell">
          <p className="dashboard-premium-closing-balance-label">Pending Balance</p>
          <p className="dashboard-premium-closing-balance-value">{pendingBalance}</p>
        </div>
      </div>

      <PremiumInsetPanel>
        <PremiumInfoRow label="Status" value={statusLabel} />
        <PremiumInfoRow label="Action" value={actionLabel} />
      </PremiumInsetPanel>
    </div>
  );
}

export function MortgageSummaryCard({ view }: { view: MortgageDashboardView }) {
  const termLabel = `${view.details.termYears}-Year Fixed`;
  const summaryRows = [
    {
      label: "Mortgage Term",
      value: termLabel,
    },
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
    <PremiumMortgageCard variant="mortgage">
      <PremiumCardHeader
        title="Mortgage Amount"
        icon={<Landmark className="size-4 text-white" strokeWidth={1.75} />}
        badgeLabel={view.summary.statusLabel}
      />

      <PremiumCardBody>
        <PremiumHeroBalance
          label="Approved Mortgage Amount"
          value={formatCurrency(view.summary.approvedMortgageAmount)}
        />

        <PremiumCardFooter>
          <PremiumInsetPanel fixed>
            {summaryRows.map((row) => (
              <PremiumInfoRow key={row.label} label={row.label} value={row.value} />
            ))}
          </PremiumInsetPanel>
        </PremiumCardFooter>
      </PremiumCardBody>
    </PremiumMortgageCard>
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

  const isPendingApproval = dp.status === "pending_verification";
  const isVerified = dp.status === "verified" && dp.fundingPhase === "down_payment";
  const depositAmount = formatCurrency(funding.requiredDeposit);
  const statusLabel = funding.fundingStatusDisplay;
  const showMakePayment =
    funding.showFundingActions &&
    funding.showDepositUI &&
    !isPendingApproval &&
    !isVerified;

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
    return (
      <PremiumMortgageCard id="pathward-funding" variant="funding">
        <PremiumCardHeader
          title="Funding Account"
          icon={<Building2 className="size-4 text-white" strokeWidth={1.75} />}
          badgeLabel={statusLabel}
        />

        <PremiumCardBody>
          <PremiumHeroBalance
            label="Current Balance"
            value={formatCurrency(funding.currentBalance)}
          />

          <PremiumCardFooter>
            <FundingAccountPanel
              bankName="Pathward National Bank"
              accountNumber="••••0000"
              statusLabel={statusLabel}
            />
            <FundingProgressFooter percent={funding.fundingPercent} />
          </PremiumCardFooter>
        </PremiumCardBody>
      </PremiumMortgageCard>
    );
  }

  return (
    <>
      <PremiumMortgageCard id="pathward-funding" variant="funding">
        <PremiumCardHeader
          title="Funding Account"
          icon={<Building2 className="size-4 text-white" strokeWidth={1.75} />}
          badgeLabel={statusLabel}
          badgeVariant={
            isPendingApproval
              ? "pending"
              : isVerified
                ? "success"
                : resolveStatusColorVariant(statusLabel)
          }
        />

        <PremiumCardBody>
          <PremiumHeroBalance
            label="Current Balance"
            value={formatCurrency(funding.currentBalance)}
          />

          <PremiumCardFooter>
            <FundingAccountPanel
              bankName={funding.bankName}
              accountNumber={accountNumber}
              statusLabel={statusLabel}
              depositLabel={funding.depositLabel}
              depositAmount={depositAmount}
              showDepositUI={funding.showDepositUI}
              showFundingActions={funding.showFundingActions}
              isPendingApproval={isPendingApproval}
              isVerified={isVerified}
              onMakePayment={showMakePayment ? openDepositModal : undefined}
              onViewDetails={funding.showDepositUI ? openDepositModal : undefined}
            />
            <FundingProgressFooter percent={funding.fundingPercent} />
          </PremiumCardFooter>
        </PremiumCardBody>
      </PremiumMortgageCard>

      <PathwardDepositInstructionsModal
        open={depositModalOpen}
        onClose={closeDepositModal}
        amount={depositAmount}
        bankName={funding.bankName}
        accountHolder={funding.accountHolder}
        routingNumber={funding.routingNumber}
        accountNumber={accountNumber}
        canMarkPaid={
          funding.showDepositUI &&
          !isPendingApproval &&
          !isVerified &&
          Boolean(view.applicationId)
        }
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
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const funds = view.closingFunds;
  const transferPending = funds.status === "transfer_pending";
  const transferComplete = funds.status === "transferred";
  const canTransfer = funds.canTransferToEscrow;
  const actionLabel = funds.actionLabel;

  const openEscrowModal = () => {
    setSubmitError(null);
    setEscrowModalOpen(true);
  };
  const closeEscrowModal = () => {
    setSubmitError(null);
    setEscrowModalOpen(false);
  };

  const handleEscrowTransfer = (seller: SellerDestinationDetails) => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await initiateEscrowTransferAction(seller);
      if (result.error) {
        setSubmitError(result.error);
        return;
      }
      setEscrowModalOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <PremiumMortgageCard id="closing-funds" variant="closing" className={className}>
        <PremiumCardHeader
          title="Closing Funds"
          icon={
            canTransfer ? (
              <CircleDollarSign className="size-4 text-white" strokeWidth={1.75} />
            ) : (
              <Lock className="size-4 text-white" strokeWidth={1.75} />
            )
          }
          badgeLabel={funds.statusLabel}
          badgeVariant={resolveClosingBadgeVariant(funds.status)}
        />

        <PremiumCardBody>
          <PremiumHeroBalance
            label="Total Closing Amount"
            value={formatCurrency(funds.totalClosingAmount)}
          />

          <PremiumCardFooter>
            <ClosingFundsPanel
              availableBalance={formatCurrency(funds.availableBalance)}
              pendingBalance={formatCurrency(funds.pendingBalance)}
              statusLabel={funds.statusLabel}
              actionLabel={actionLabel}
            />

            <div className="dashboard-premium-footer-slot">
              {submitError ? (
                <p className="dashboard-premium-error">{submitError}</p>
              ) : null}

              {!transferPending && !transferComplete ? (
                <button
                  type="button"
                  disabled={!canTransfer || isSubmitting}
                  onClick={canTransfer ? openEscrowModal : undefined}
                  className={cn(
                    "dashboard-premium-action-btn",
                    canTransfer
                      ? "dashboard-premium-action-btn--enabled"
                      : "dashboard-premium-action-btn--disabled",
                  )}
                >
                  {canTransfer ? "Transfer to Seller via Escrow" : "Awaiting Funding Completion"}
                  {canTransfer ? <ArrowRight className="size-4" /> : null}
                </button>
              ) : (
                <div className="dashboard-premium-action-spacer" aria-hidden />
              )}
            </div>
          </PremiumCardFooter>
        </PremiumCardBody>
      </PremiumMortgageCard>

      <PathwardEscrowTransferModal
        open={escrowModalOpen}
        onClose={closeEscrowModal}
        amount={formatCurrency(funds.totalClosingAmount)}
        isSubmitting={isSubmitting}
        onConfirm={handleEscrowTransfer}
        error={submitError}
      />
    </>
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

export function ApplicationDetailsCard({ view }: { view: MortgageDashboardView }) {
  const href = view.applicationId
    ? `/dashboard/loans/${view.applicationId}`
    : "/dashboard/loans";

  const card = (
    <section
      className={cn(
        "dashboard-card p-6 md:p-8",
        view.applicationId &&
          "transition-all hover:border-brand-blue/30 hover:shadow-[var(--shadow-card-hover)]",
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
            <BadgePercent className="size-5 text-brand-blue" strokeWidth={1.75} />
          </div>
          <div>
            <p className="dashboard-label">Your Application</p>
            <h2 className="mt-1 text-xl font-bold text-brand-navy">
              Application Details
            </h2>
            {view.applicationNumber ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {view.applicationNumber}
              </p>
            ) : null}
          </div>
        </div>
        {view.applicationId ? (
          <ArrowRight className="size-5 shrink-0 text-brand-blue transition-transform group-hover:translate-x-0.5" />
        ) : null}
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

      {view.applicationId ? (
        <p className="mt-5 text-sm font-semibold text-brand-blue">
          View and edit application
        </p>
      ) : null}
    </section>
  );

  if (!view.applicationId) {
    return card;
  }

  return (
    <Link href={href} className="group block">
      {card}
    </Link>
  );
}

export const MortgageDetailsCard = ApplicationDetailsCard;

export function RequiredDownPaymentCard({ view }: { view: MortgageDashboardView }) {
  const dp = view.downPayment;
  const linked = view.linkedAccount;
  const funding = view.pathwardFunding;

  if (!dp.showFundingSection) {
    return null;
  }

  const isAdminRequest = dp.fundingPhase === "admin_requested";
  const isVerified = dp.status === "verified" && !isAdminRequest;
  const isComplete = dp.remainingAmount <= 0;
  const sectionTitle = isAdminRequest ? dp.requestLabel : "Required Down Payment";

  return (
    <section id="down-payment" className="dashboard-card overflow-hidden">
      <div className="border-b border-brand-border px-6 py-6 md:px-8">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue/8 ring-1 ring-brand-border">
            <Wallet className="size-5 text-brand-blue" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-navy">{sectionTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {isAdminRequest
                ? `Orbit Mortgage has requested an additional deposit of ${formatCurrency(dp.requiredAmount)} for ${dp.requestLabel}. This is the only amount due right now.`
                : "Deposit your down payment to your Pathward account after your application is approved. Orbit Mortgage will verify your deposit before closing funds are released."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.4fr_1fr] md:gap-8 md:px-8 md:py-8">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricTile
              label={isAdminRequest ? "Amount Requested" : "Required Deposit"}
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

          {dp.breakdown.length > 0 ? (
            <div className="rounded-xl border border-brand-border bg-brand-background/40 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Current Request
              </p>
              <ul className="mt-3 space-y-2">
                {dp.breakdown.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-brand-navy/75">{item.label}</span>
                    <span className="font-semibold tabular-nums text-brand-navy">
                      {formatCurrency(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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

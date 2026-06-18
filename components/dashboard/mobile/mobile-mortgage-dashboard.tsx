"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

import {
  PathwardDepositInstructionsModal,
  PathwardEscrowTransferModal,
} from "@/components/dashboard/mortgage-primary-cards";
import {
  MobileCard,
  MobileCircularProgress,
  MobileLabel,
  MobileProgressBar,
  MobileSectionTitle,
  MobileValue,
} from "@/components/dashboard/mobile/mobile-card";
import { submitDownPaymentVerificationAction } from "@/lib/dashboard/down-payment-actions";
import {
  MOBILE_JOURNEY_STAGES,
  MOBILE_JOURNEY_SHORT_LABELS,
  mapToMobileDisplayStage,
  resolveMobileActionPresentation,
  resolveMobileClosingFundedPercent,
  resolveMobileCurrentStageLabel,
  resolveMobileCurrentStatusLabel,
  resolveMobileFundingPercent,
  resolveMobileJourneyCompletionPercent,
  type MobileActionTone,
} from "@/lib/dashboard/mobile-dashboard-presenters";
import { formatCurrency } from "@/lib/loans/queries";
import { initiateEscrowTransferAction } from "@/lib/wallet/escrow-transfer";
import { cn } from "@/lib/utils";
import {
  resolveStatusColorVariant,
  STATUS_BADGE_BASE,
  statusBadgeClasses,
} from "@/lib/status-colors";
import type { MortgageDashboardView, SellerDestinationDetails } from "@/types/mortgage-dashboard";

const ACTION_TONE_CLASSES: Record<MobileActionTone, string> = {
  blue: "border-[#DBEAFE] bg-[#EFF6FF]",
  green: "border-[#DCFCE7] bg-[#F0FDF4]",
  amber: "border-[#FEF3C7] bg-[#FFFBEB]",
  red: "border-[#FEE2E2] bg-[#FEF2F2]",
};

type MobileMortgageDashboardProps = {
  view: MortgageDashboardView;
};

export function MobileMortgageDashboard({ view }: MobileMortgageDashboardProps) {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const funding = view.pathwardFunding;
  const funds = view.closingFunds;
  const dp = view.downPayment;
  const action = resolveMobileActionPresentation(view);
  const completionPercent = resolveMobileJourneyCompletionPercent(view);
  const displayStage = mapToMobileDisplayStage(view.journeyStage);
  const fundingPercent = resolveMobileFundingPercent(view);
  const closingFundedPercent = resolveMobileClosingFundedPercent(view);
  const accountNumber =
    view.linkedAccount?.accountNumber ?? `••••${funding.accountNumberLast4}`;

  const isPendingApproval = dp.status === "pending_verification";
  const isVerified = dp.status === "verified" && dp.fundingPhase === "down_payment";
  const depositAmount = formatCurrency(funding.requiredDeposit);
  const transferPending = funds.status === "transfer_pending";
  const transferComplete = funds.status === "transferred";
  const canTransfer = funds.canTransferToEscrow;

  const showMakePayment =
    funding.showFundingActions &&
    funding.showDepositUI &&
    !isPendingApproval &&
    !isVerified;

  const openDepositModal = () => {
    setSubmitError(null);
    setDepositModalOpen(true);
  };

  const openEscrowModal = () => {
    setSubmitError(null);
    setEscrowModalOpen(true);
  };

  const handleDepositAction = () => {
    if (action.kind === "transfer") {
      openEscrowModal();
      return;
    }
    if (showMakePayment || action.kind === "deposit" || action.kind === "additional") {
      openDepositModal();
    }
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

  const propertyValue =
    view.propertyDetails?.purchasePrice ?? view.summary.maximumHomePrice;

  return (
    <>
      <div className="mobile-dash-stack space-y-4 pb-28">
        <MobileJourneyHero
          completionPercent={completionPercent}
          displayStage={displayStage}
          currentStageLabel={resolveMobileCurrentStageLabel(view.journeyStage)}
          statusLabel={resolveMobileCurrentStatusLabel(view)}
        />

        <MobileActionCard
          action={action}
          onAction={handleDepositAction}
          nextActionHref={view.nextAction.buttonHref}
        />

        <MobileCard>
          <MobileSectionTitle className="mb-4">Mortgage Summary</MobileSectionTitle>
          <div className="space-y-4">
            <SnapshotRow
              label="Approved Mortgage"
              value={formatCurrency(view.summary.approvedMortgageAmount)}
              large
            />
            <SnapshotRow label="Property Value" value={formatCurrency(propertyValue)} />
            <SnapshotRow
              label="Interest Rate"
              value={`${view.details.interestRate.toFixed(2)}%`}
            />
            <SnapshotRow
              label="Monthly Payment"
              value={formatCurrency(view.summary.estimatedMonthlyPayment)}
            />
          </div>
        </MobileCard>

        <MobileCard>
          <MobileSectionTitle className="mb-1">Funding Account</MobileSectionTitle>
          <p className="mb-4 text-sm text-brand-navy/55">{funding.bankName}</p>
          <div className="space-y-4">
            <SnapshotRow
              label="Current Balance"
              value={formatCurrency(funding.currentBalance)}
              large
            />
            <div className="flex items-center justify-between gap-3">
              <MobileLabel>Status</MobileLabel>
              <StatusPill label={funding.fundingStatusDisplay} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <MobileLabel>Funding Progress</MobileLabel>
                <span className="text-sm font-bold text-brand-navy">{fundingPercent}%</span>
              </div>
              <MobileProgressBar percent={fundingPercent} />
            </div>
          </div>
        </MobileCard>

        <MobileCard>
          <MobileSectionTitle className="mb-4">Closing Funds</MobileSectionTitle>
          <div className="space-y-4">
            <SnapshotRow
              label="Total Needed"
              value={formatCurrency(funds.totalClosingAmount)}
              large
            />
            <SnapshotRow
              label="Available"
              value={formatCurrency(funds.availableBalance)}
            />
            <SnapshotRow
              label="Remaining"
              value={formatCurrency(funds.pendingBalance)}
            />
            <MobileCircularProgress
              percent={closingFundedPercent}
              label={`${closingFundedPercent}% Funded`}
            />
          </div>
        </MobileCard>

        <MobileCard>
          <MobileSectionTitle className="mb-4">Escrow Transfer</MobileSectionTitle>
          <div className="space-y-3">
            <StatusPill label={funds.statusLabel} />
            <p className="text-sm leading-relaxed text-brand-navy/70">
              {funds.actionLabel}
            </p>
            {canTransfer && !transferPending && !transferComplete ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={openEscrowModal}
                className="mobile-dash-btn-primary w-full"
              >
                Transfer To Seller Via Escrow
              </button>
            ) : null}
            {transferPending ? (
              <p className="text-sm font-medium text-brand-navy/60">
                Pending Orbit Approval
              </p>
            ) : null}
            {transferComplete ? (
              <p className="text-sm font-medium text-[#166534]">Transfer Approved — Processing</p>
            ) : null}
          </div>
        </MobileCard>

        <MobileDetailsAccordion view={view} />
      </div>

      {action.showSticky ? (
        <div className="mobile-sticky-action fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 px-4 lg:hidden">
          <div className="mx-auto max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.12)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-navy">
                  {action.kind === "transfer" ? "Transfer Ready" : action.title}
                </p>
                {action.remainingAmount ? (
                  <p className="text-sm font-bold text-brand-blue tabular-nums">
                    {action.remainingAmount} Remaining
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDepositAction}
                className="mobile-dash-btn-primary shrink-0 px-4 py-2.5 text-sm"
              >
                {action.kind === "transfer"
                  ? "Transfer To Seller"
                  : action.buttonLabel ?? "Continue"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PathwardDepositInstructionsModal
        open={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
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

      <PathwardEscrowTransferModal
        open={escrowModalOpen}
        onClose={() => setEscrowModalOpen(false)}
        amount={formatCurrency(funds.totalClosingAmount)}
        isSubmitting={isSubmitting}
        onConfirm={handleEscrowTransfer}
        error={submitError}
      />
    </>
  );
}

function MobileJourneyHero({
  completionPercent,
  displayStage,
  currentStageLabel,
  statusLabel,
}: {
  completionPercent: number;
  displayStage: number;
  currentStageLabel: string;
  statusLabel: string;
}) {
  return (
    <MobileCard>
      <MobileSectionTitle className="mb-1">Mortgage Progress</MobileSectionTitle>
      <p className="mb-5 text-[32px] font-bold leading-none text-brand-navy">
        {completionPercent}% Complete
      </p>

      <ol className="mb-6 flex items-start">
        {MOBILE_JOURNEY_STAGES.map((label, index) => {
          const stageNumber = index + 1;
          const completed = stageNumber < displayStage;
          const current = stageNumber === displayStage;
          const isLast = index === MOBILE_JOURNEY_STAGES.length - 1;

          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  aria-hidden
                  className={cn(
                    "h-0.5 flex-1",
                    index === 0
                      ? "bg-transparent"
                      : completed || current
                        ? "bg-brand-blue"
                        : "bg-[#E5E7EB]",
                  )}
                />
                <div
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                    completed || current
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-[#E5E7EB] bg-white",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  {completed ? (
                    <Check className="size-3.5" strokeWidth={2.5} />
                  ) : (
                    <span
                      className={cn(
                        "rounded-full",
                        current ? "size-2 bg-white" : "size-1.5 bg-[#E5E7EB]",
                      )}
                    />
                  )}
                </div>
                <div
                  aria-hidden
                  className={cn(
                    "h-0.5 flex-1",
                    isLast
                      ? "bg-transparent"
                      : stageNumber < displayStage
                        ? "bg-brand-blue"
                        : "bg-[#E5E7EB]",
                  )}
                />
              </div>
              <p
                className={cn(
                  "mt-2 w-full px-0.5 text-center text-[10px] font-medium leading-tight",
                  current ? "font-semibold text-brand-blue" : "text-brand-navy/50",
                )}
              >
                {MOBILE_JOURNEY_SHORT_LABELS[label]}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="space-y-3 border-t border-[#E5E7EB] pt-4">
        <div className="flex items-center justify-between gap-3">
          <MobileLabel>Current Stage</MobileLabel>
          <span className="text-sm font-semibold text-brand-navy">{currentStageLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <MobileLabel>Status</MobileLabel>
          <StatusPill label={statusLabel} />
        </div>
      </div>
    </MobileCard>
  );
}

function MobileActionCard({
  action,
  onAction,
  nextActionHref,
}: {
  action: ReturnType<typeof resolveMobileActionPresentation>;
  onAction: () => void;
  nextActionHref: string;
}) {
  return (
    <MobileCard className={cn("border-2", ACTION_TONE_CLASSES[action.tone])}>
      <p className="text-lg font-semibold text-brand-navy">{action.title}</p>
      {action.subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">{action.subtitle}</p>
      ) : null}
      {action.remainingAmount ? (
        <div className="mt-4">
          <MobileLabel>{action.remainingLabel ?? "Remaining"}</MobileLabel>
          <MobileValue large className="mt-1">
            {action.remainingAmount}
          </MobileValue>
        </div>
      ) : null}
      {action.showButton && action.buttonLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="mobile-dash-btn-primary mt-5 w-full"
        >
          {action.buttonLabel}
        </button>
      ) : null}
      {action.kind === "info" && action.buttonLabel && nextActionHref ? (
        <Link href={nextActionHref} className="mobile-dash-btn-primary mt-5 block w-full text-center">
          {action.buttonLabel}
        </Link>
      ) : null}
      {action.kind === "pending" || action.kind === "complete" ? (
        <p className="mt-3 text-sm font-medium text-brand-navy/60">No action required</p>
      ) : null}
    </MobileCard>
  );
}

function SnapshotRow({
  label,
  value,
  large = false,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <MobileLabel>{label}</MobileLabel>
      <MobileValue large={large} className="mt-1">
        {value}
      </MobileValue>
    </div>
  );
}

function StatusPill({ label }: { label: string }) {
  const variant = resolveStatusColorVariant(label);
  return (
    <span className={cn(STATUS_BADGE_BASE, "rounded-full", statusBadgeClasses(variant))}>
      {label}
    </span>
  );
}

function MobileDetailsAccordion({ view }: { view: MortgageDashboardView }) {
  return (
    <MobileCard className="!p-0 overflow-hidden">
      <div className="border-b border-[#E5E7EB] px-5 py-4">
        <MobileSectionTitle>Application Details</MobileSectionTitle>
        {view.applicationNumber ? (
          <p className="mt-1 text-sm text-brand-navy/55">{view.applicationNumber}</p>
        ) : null}
      </div>
      <AccordionSection title="Loan Details" defaultOpen={false}>
        <DetailRow label="Program" value={view.details.productName} />
        <DetailRow
          label="Interest Rate"
          value={`${view.details.interestRate.toFixed(2)}%`}
        />
        <DetailRow label="Mortgage Term" value={`${view.details.termYears} Years`} />
        <DetailRow label="LTV" value={`${view.details.loanToValue}%`} />
      </AccordionSection>
      <AccordionSection title="Property Details" defaultOpen={false}>
        <DetailRow label="Property Type" value={view.details.propertyType} />
        <DetailRow label="Occupancy" value={view.details.propertyUsage} />
        {view.propertyDetails?.address ? (
          <DetailRow label="Address" value={view.propertyDetails.address} />
        ) : null}
      </AccordionSection>
      {view.documents.length > 0 ? (
        <AccordionSection title="Documents" defaultOpen={false}>
          <ul className="space-y-2">
            {view.documents.slice(0, 5).map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="truncate text-brand-navy/80">{doc.name}</span>
                <StatusPill label={doc.status} />
              </li>
            ))}
          </ul>
          <Link
            href="/dashboard/documents"
            className="mt-3 inline-block text-sm font-semibold text-brand-blue"
          >
            View all documents
          </Link>
        </AccordionSection>
      ) : null}
      <AccordionSection title="Funding History" defaultOpen={false}>
        <DetailRow
          label="Required Down Payment"
          value={formatCurrency(view.downPayment.requiredAmount)}
        />
        <DetailRow
          label="Received"
          value={formatCurrency(view.downPayment.amountReceived)}
        />
        <DetailRow
          label="Remaining"
          value={formatCurrency(view.downPayment.remainingAmount)}
        />
      </AccordionSection>
      <AccordionSection title="Activity Log" defaultOpen={false}>
        {view.activities.length === 0 ? (
          <p className="text-sm text-brand-navy/55">No recent activity.</p>
        ) : (
          <ul className="space-y-3">
            {view.activities.slice(0, 5).map((item) => (
              <li key={item.id}>
                <p className="text-sm font-medium text-brand-navy">{item.title}</p>
                <p className="text-xs text-brand-navy/50">{item.date}</p>
              </li>
            ))}
          </ul>
        )}
      </AccordionSection>
    </MobileCard>
  );
}

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E5E7EB] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-brand-navy">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-brand-navy/40 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="space-y-3 px-5 pb-4">{children}</div> : null}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-brand-navy/55">{label}</span>
      <span className="text-right font-semibold text-brand-navy">{value}</span>
    </div>
  );
}

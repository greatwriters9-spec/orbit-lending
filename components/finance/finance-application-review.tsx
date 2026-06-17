"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { ApplicationStatusTimeline } from "@/components/applications/application-status-timeline";
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ApplicationScoringPanel } from "@/components/finance/application-scoring-panel";
import { DownPaymentReviewPanel } from "@/components/finance/down-payment-review-panel";
import {
  addInternalNoteAction,
  approveFundingAction,
  recalculateScoresAction,
  rejectFundingAction,
  requestInformationAction,
  saveOfferAction,
  sendFinanceMessageAction,
  setMortgageEligibilityAction,
  updateApplicationStatusAction,
} from "@/lib/finance/actions";
import { getAllowedTransitions } from "@/lib/applications/engine/transitions";
import {
  APPLICATION_STATUS_LABELS,
  formatApplicationDate,
} from "@/lib/applications/status-utils";
import { formatCurrency } from "@/lib/loans/queries";
import { Button } from "@/components/ui-kit/button";
import { SectionHeader } from "@/components/ui-kit/section-header";
import type { ApplicationStatus } from "@/types/application-details";
import type { FinanceApplicationDetail } from "@/types/finance";

type FinanceApplicationReviewProps = {
  application: FinanceApplicationDetail;
};

const MANUAL_STATUSES: ApplicationStatus[] = [
  "under_review",
  "pre_qualified",
  "information_required",
  "pending_finance_approval",
  "approved",
  "rejected",
];

export function FinanceApplicationReview({
  application,
}: FinanceApplicationReviewProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allowedTransitions = useMemo(
    () => getAllowedTransitions(application.status),
    [application.status],
  );

  const statusOptions = useMemo(() => {
    const options = new Set<ApplicationStatus>([
      application.status,
      ...allowedTransitions,
    ]);
    return MANUAL_STATUSES.filter((s) => options.has(s));
  }, [application.status, allowedTransitions]);

  const [status, setStatus] = useState<ApplicationStatus>(
    statusOptions.includes(application.status)
      ? application.status
      : (statusOptions[0] ?? "under_review"),
  );
  const [statusNote, setStatusNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [message, setMessage] = useState("");
  const [docName, setDocName] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [docMessage, setDocMessage] = useState("");
  const [offer, setOffer] = useState({
    requestedAmount: application.requestedAmount,
    recommendedAmount: Math.round(application.requestedAmount * 0.9),
    finalAmount: Math.round(application.requestedAmount * 0.9),
    offeredInterestRate: 10.49,
    repaymentFrequency: "Monthly",
    repaymentPeriod: 24,
    notes: "",
  });
  const [eligibleAmount, setEligibleAmount] = useState(
    application.approvedAmount ?? application.requestedAmount,
  );

  function runAction(action: () => Promise<{ error?: string; success?: string }>) {
    startTransition(async () => {
      const result = await action();
      setFeedback(result.error ?? result.success ?? null);
      router.refresh();
    });
  }

  const canSendOffer = [
    "under_review",
    "pre_qualified",
    "pre_approved",
    "information_required",
    "offer_declined",
  ].includes(application.status);

  const canApproveFunding =
    application.status === "pending_finance_approval" ||
    application.status === "offer_accepted";

  const canSetEligibility = [
    "submitted",
    "under_review",
    "information_required",
  ].includes(application.status);

  const showDownPaymentReview = ["approved", "funded", "active"].includes(
    application.status,
  );

  return (
    <div className="space-y-8">
      {feedback ? (
        <div className="rounded-lg border border-brand-border bg-brand-background px-4 py-3 text-sm text-brand-navy">
          {feedback}
        </div>
      ) : null}

      <ApplicationScoringPanel
        scores={application.scores}
        financialInfo={application.financialInfo}
        requestedAmount={application.requestedAmount}
      />

      <div className="grid gap-7 xl:grid-cols-3">
        <div className="space-y-7 xl:col-span-2">
          <section className="card-surface p-6 md:p-8">
            <SectionHeader
              title="Applicant Overview"
              description="Review submitted personal and financial information."
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoBlock label="Applicant" value={application.applicantName} />
              <InfoBlock
                label="Requested Amount"
                value={formatCurrency(application.requestedAmount)}
              />
              <InfoBlock label="Product" value={application.productName} />
              <InfoBlock label="Purpose" value={application.purpose ?? "—"} />
              <InfoBlock
                label="Employment"
                value={String(application.financialInfo.employmentStatus ?? "—")}
              />
              <InfoBlock
                label="Monthly Income"
                value={formatCurrency(Number(application.financialInfo.monthlyIncome ?? 0))}
              />
            </div>
            <Button
              disabled={isPending}
              variant="outline"
              onClick={() =>
                runAction(() => recalculateScoresAction(application.id))
              }
              className="mt-4 h-9"
            >
              Recalculate Scores
            </Button>
          </section>

          <ApplicationStatusTimeline entries={application.statusHistory} />

          {canSetEligibility ? (
            <section className="card-surface p-6 md:p-8">
              <SectionHeader
                title="Mortgage Eligibility"
                description="Set the amount this client is eligible for. This does not fund the account — the client must continue their application toward approval."
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoBlock
                  label="Requested Amount"
                  value={formatCurrency(application.requestedAmount)}
                />
                <LabeledInput
                  label="Eligible Mortgage Amount"
                  type="number"
                  value={eligibleAmount}
                  onChange={(v) => setEligibleAmount(Number(v))}
                />
              </div>
              <Button
                disabled={isPending || eligibleAmount <= 0}
                onClick={() =>
                  runAction(() =>
                    setMortgageEligibilityAction({
                      applicationId: application.id,
                      eligibleAmount,
                      note:
                        statusNote ||
                        `Eligibility confirmed at ${formatCurrency(eligibleAmount)}.`,
                    }),
                  )
                }
                className="mt-4 h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
              >
                Confirm Eligibility Amount
              </Button>
            </section>
          ) : null}

          {showDownPaymentReview ? (
            <DownPaymentReviewPanel
              applicationId={application.id}
              personalInfo={application.personalInfo}
              pathwardBalance={application.pathwardBalance}
            />
          ) : null}

          <section className="card-surface p-6 md:p-8">
            <SectionHeader title="Internal Notes" description="Staff-only notes not visible to applicants." />
            <div className="mt-4 space-y-3">
              {application.internalNotes.map((note) => (
                <div key={note.id} className="rounded-xl border border-brand-border bg-brand-background/50 p-4">
                  <p className="text-sm text-brand-navy">{note.note}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {note.authorName} · {formatApplicationDate(note.createdAt)}
                  </p>
                </div>
              ))}
            </div>
            <textarea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add an internal note..."
              className="mt-4 w-full rounded-xl border border-brand-border bg-brand-background px-4 py-3 text-sm"
            />
            <Button
              disabled={isPending}
              onClick={() =>
                runAction(() =>
                  addInternalNoteAction({
                    applicationId: application.id,
                    note: internalNote,
                  }),
                )
              }
              className="mt-3 h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Add Internal Note
            </Button>
          </section>

          <section className="card-surface p-6 md:p-8">
            <SectionHeader title="Applicant Messaging" description="Send messages visible to the applicant." />
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
              {application.messages.map((msg) => (
                <div key={msg.id} className="rounded-xl border border-brand-border px-4 py-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {msg.senderName} · {msg.senderRole}
                  </p>
                  <p className="mt-1 text-sm text-brand-navy">{msg.message}</p>
                </div>
              ))}
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to the applicant..."
              className="mt-4 w-full rounded-xl border border-brand-border bg-brand-background px-4 py-3 text-sm"
            />
            <Button
              disabled={isPending}
              onClick={() =>
                runAction(() =>
                  sendFinanceMessageAction({
                    applicationId: application.id,
                    message,
                  }),
                )
              }
              className="mt-3 h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Send Message
            </Button>
          </section>

          <section className="card-surface p-6 md:p-8">
            <SectionHeader title="Audit Log" description="Complete record of finance decisions on this application." />
            <ul className="mt-4 space-y-3">
              {application.auditLogs.length > 0 ? (
                application.auditLogs.map((log) => (
                  <li key={log.id} className="rounded-xl border border-brand-border px-4 py-3">
                    <p className="text-sm font-medium text-brand-navy">{log.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatApplicationDate(log.createdAt)}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No audit entries yet.</p>
              )}
            </ul>
          </section>
        </div>

        <div className="space-y-7">
          <section className="card-surface p-6">
            <h3 className="text-sm font-semibold text-brand-navy">Current Status</h3>
            <div className="mt-3">
              <ApplicationStatusBadge status={application.status} />
            </div>
            {statusOptions.length > 1 ? (
              <>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="mt-4 h-10 w-full rounded-lg border border-brand-border bg-brand-background px-3 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {APPLICATION_STATUS_LABELS[option]}
                    </option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Reason for status change..."
                  className="mt-3 w-full rounded-lg border border-brand-border bg-brand-background px-3 py-2 text-sm"
                />
                <Button
                  disabled={isPending || status === application.status}
                  onClick={() =>
                    runAction(() =>
                      updateApplicationStatusAction({
                        applicationId: application.id,
                        status: status as Extract<
                          ApplicationStatus,
                          | "under_review"
                          | "pre_qualified"
                          | "information_required"
                          | "pending_finance_approval"
                          | "approved"
                          | "rejected"
                        >,
                        note: statusNote,
                      }),
                    )
                  }
                  className="mt-3 h-10 w-full bg-brand-navy text-white hover:bg-brand-navy/90"
                >
                  Update Status
                </Button>
              </>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Status is controlled by the current workflow stage.
              </p>
            )}
          </section>

          <section className="card-surface p-6">
            <h3 className="text-sm font-semibold text-brand-navy">Request Information</h3>
            <input
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Document name"
              className="mt-3 h-10 w-full rounded-lg border border-brand-border px-3 text-sm"
            />
            <textarea
              rows={2}
              value={docDescription}
              onChange={(e) => setDocDescription(e.target.value)}
              placeholder="Description"
              className="mt-2 w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              value={docMessage}
              onChange={(e) => setDocMessage(e.target.value)}
              placeholder="Message to applicant"
              className="mt-2 w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
            />
            <Button
              disabled={isPending}
              onClick={() =>
                runAction(() =>
                  requestInformationAction({
                    applicationId: application.id,
                    documentName: docName,
                    description: docDescription,
                    message: docMessage,
                  }),
                )
              }
              className="mt-3 h-10 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Request Documents
            </Button>
          </section>

          <section className="card-surface p-6">
            <h3 className="text-sm font-semibold text-brand-navy">Loan Offer</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Modify amount, APR, and term before sending to the client.
            </p>
            <div className="mt-3 space-y-2">
              <LabeledInput
                label="Final Amount"
                type="number"
                value={offer.finalAmount}
                onChange={(v) => setOffer({ ...offer, finalAmount: Number(v) })}
              />
              <LabeledInput
                label="Recommended Amount"
                type="number"
                value={offer.recommendedAmount}
                onChange={(v) => setOffer({ ...offer, recommendedAmount: Number(v) })}
              />
              <LabeledInput
                label="Interest Rate / APR (%)"
                type="number"
                step="0.01"
                value={offer.offeredInterestRate}
                onChange={(v) => setOffer({ ...offer, offeredInterestRate: Number(v) })}
              />
              <LabeledInput
                label="Repayment Period (months)"
                type="number"
                value={offer.repaymentPeriod}
                onChange={(v) => setOffer({ ...offer, repaymentPeriod: Number(v) })}
              />
              <LabeledInput
                label="Repayment Frequency"
                value={offer.repaymentFrequency}
                onChange={(v) => setOffer({ ...offer, repaymentFrequency: v })}
              />
            </div>
            <Button
              disabled={isPending || !canSendOffer}
              onClick={() =>
                runAction(() =>
                  saveOfferAction({
                    ...offer,
                    applicationId: application.id,
                    requestedAmount: application.requestedAmount,
                  }),
                )
              }
              className="mt-4 h-10 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              Send Offer to Client
            </Button>
          </section>

          <section className="card-surface p-6">
            <h3 className="text-sm font-semibold text-brand-navy">Approval Decision</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Approve after the client accepts the offer. Fund the mortgage via the Funding
              Queue, then link the Pathward account so the client can deposit their down
              payment.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button
                disabled={isPending || !canApproveFunding}
                onClick={() =>
                  runAction(() =>
                    approveFundingAction(application.id, statusNote || "Funding approved."),
                  )
                }
                className="h-10 bg-brand-success text-white hover:bg-brand-success/90"
              >
                Approve for Funding
              </Button>
              <Button
                disabled={isPending}
                variant="outline"
                onClick={() =>
                  runAction(() =>
                    rejectFundingAction(application.id, statusNote || "Funding rejected."),
                  )
                }
                className="h-10 border-brand-danger/30 text-brand-danger"
              >
                Reject Application
              </Button>
              <Link
                href="/finance/funding"
                className="text-center text-xs font-medium text-brand-blue hover:underline"
              >
                Open Funding Queue →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-background/40 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-brand-navy">{value}</p>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block text-xs text-muted-foreground">
      {label}
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 w-full rounded-lg border border-brand-border px-3 text-sm text-brand-navy"
      />
    </label>
  );
}

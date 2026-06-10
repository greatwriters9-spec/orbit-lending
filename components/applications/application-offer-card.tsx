"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";

import { respondToOfferAction } from "@/lib/applications/actions";
import { formatShortDate } from "@/lib/applications/status-utils";
import { calculateLoanPayment } from "@/lib/loans/calculator";
import { formatApr, formatCurrency, formatTermLabel } from "@/lib/loans/queries";
import { Button } from "@/components/ui-kit/button";
import { cn } from "@/lib/utils";
import type { LoanOffer } from "@/types/application-details";

type ApplicationOfferCardProps = {
  applicationId: string;
  offers: LoanOffer[];
  className?: string;
};

export function ApplicationOfferCard({
  applicationId,
  offers,
  className,
}: ApplicationOfferCardProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingOffer = offers.find((offer) => offer.status === "pending");

  if (offers.length === 0) {
    return (
      <section className={cn("card-surface p-6 md:p-8", className)}>
        <h2 className="heading-secondary text-lg">Financing Offer</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          No financing offer has been prepared yet. You'll be notified when an
          offer is available for review.
        </p>
      </section>
    );
  }

  const offer = pendingOffer ?? offers[0];
  const calculation = calculateLoanPayment({
    principal: offer.finalAmount,
    annualInterestRate: offer.offeredInterestRate,
    repaymentPeriod: offer.repaymentPeriod,
    repaymentFrequency: offer.repaymentFrequency,
  });

  function handleRespond(response: "accept" | "decline") {
    startTransition(async () => {
      const result = await respondToOfferAction(
        applicationId,
        offer.id,
        response,
      );
      setFeedback(result.error ?? result.success ?? null);
    });
  }

  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      <div className="border-b border-brand-border bg-brand-navy px-6 py-5 text-white md:px-8">
        <h2 className="text-lg font-semibold">Financing Offer</h2>
        <p className="mt-1 text-sm text-white/60">
          Review your recommended financing terms from the lending team.
        </p>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Approved Amount</p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {formatCurrency(offer.finalAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Rate</p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {formatApr(offer.offeredInterestRate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Term</p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {formatTermLabel({
                repaymentFrequency: offer.repaymentFrequency,
                repaymentPeriod: offer.repaymentPeriod,
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. Payment</p>
            <p className="mt-1 text-xl font-bold text-brand-navy">
              {calculation
                ? formatCurrency(calculation.installmentAmount)
                : "—"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-border bg-brand-background/50 p-4">
            <p className="text-xs text-muted-foreground">Requested</p>
            <p className="mt-1 font-semibold text-brand-navy">
              {formatCurrency(offer.requestedAmount)}
            </p>
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-background/50 p-4">
            <p className="text-xs text-muted-foreground">Recommended</p>
            <p className="mt-1 font-semibold text-brand-navy">
              {formatCurrency(offer.recommendedAmount)}
            </p>
          </div>
        </div>

        {offer.notes ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {offer.notes}
          </p>
        ) : null}

        {offer.expiresAt ? (
          <p className="text-xs text-muted-foreground">
            Offer expires {formatShortDate(offer.expiresAt)}
          </p>
        ) : null}

        {offer.status === "pending" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              disabled={isPending}
              onClick={() => handleRespond("accept")}
              className="h-10 bg-brand-blue text-white hover:bg-brand-blue/90"
            >
              <Check className="size-4" />
              Accept Offer
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleRespond("decline")}
              className="h-10 border-brand-border text-brand-navy"
            >
              <X className="size-4" />
              Decline Offer
            </Button>
          </div>
        ) : (
          <p className="text-sm font-medium text-brand-success">
            Offer {offer.status === "accepted" ? "accepted" : "declined"}.
          </p>
        )}

        {feedback ? (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        ) : null}
      </div>
    </section>
  );
}

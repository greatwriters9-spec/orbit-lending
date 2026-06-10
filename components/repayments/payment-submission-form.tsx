"use client";

import type { FormEvent } from "react";
import { useRef, useState, useTransition } from "react";
import { Building2, Upload } from "lucide-react";

import { FormField, FormMessage } from "@/components/auth/form-field";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { PAYMENT_METHOD_LABELS } from "@/lib/repayments/constants";
import {
  submitPaymentAction,
  uploadPaymentProofAction,
} from "@/lib/repayments/actions";
import { formatRepaymentCurrency } from "@/lib/repayments/format";
import { PATHWARD_BANK } from "@/types/wallet";
import type { LoanRepayment, RepaymentPaymentMethod } from "@/types/repayments";

type PaymentSubmissionFormProps = {
  repayment: LoanRepayment;
  loanNumber: string;
  onSuccess?: () => void;
};

export function PaymentSubmissionForm({
  repayment,
  loanNumber,
  onSuccess,
}: PaymentSubmissionFormProps) {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [proofUrl, setProofUrl] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    const formData = new FormData(event.currentTarget);
    const paymentMethod = formData.get("paymentMethod") as RepaymentPaymentMethod;
    const amount = Number(formData.get("amount"));
    const referenceNumber = String(formData.get("referenceNumber") ?? "");
    const notes = String(formData.get("notes") ?? "");

    startTransition(async () => {
      const result = await submitPaymentAction({
        repaymentId: repayment.id,
        paymentMethod,
        amount,
        referenceNumber,
        notes: notes || undefined,
        proofDocumentUrl: proofUrl,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(result.success ?? "Payment submitted.");
      onSuccess?.();
    });
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("proof", file);
    const result = await uploadPaymentProofAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setProofUrl(result.url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-brand-blue/15 bg-brand-blue/[0.04] px-4 py-3">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 size-4 text-brand-blue" strokeWidth={1.75} />
          <div>
            <p className="text-xs font-semibold tracking-wide text-brand-blue uppercase">
              Preferred Banking Infrastructure
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-navy">
              {PATHWARD_BANK.tagline}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-brand-border bg-brand-background/60 px-4 py-3 text-sm text-muted-foreground">
        Loan {loanNumber} · Installment #{repayment.installment_number} · Due{" "}
        {repayment.due_date} · Amount due{" "}
        {formatRepaymentCurrency(repayment.installment_amount)}
      </div>

      {error ? <FormMessage message={error} variant="error" /> : null}
      {success ? <FormMessage message={success} variant="success" /> : null}

      <FormField label="Payment method" htmlFor="paymentMethod">
        <select
          id="paymentMethod"
          name="paymentMethod"
          required
          className="h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm"
          defaultValue="bank_transfer"
        >
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Amount" htmlFor="amount">
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={repayment.installment_amount}
          className="h-11"
        />
      </FormField>

      <FormField label="Reference number" htmlFor="referenceNumber">
        <Input
          id="referenceNumber"
          name="referenceNumber"
          required
          placeholder="Bank reference or confirmation number"
          className="h-11"
        />
      </FormField>

      <FormField label="Proof of payment" htmlFor="proof">
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            id="proof"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 size-4" />
            Upload proof
          </Button>
          {proofUrl ? (
            <span className="text-xs text-brand-success">Proof uploaded</span>
          ) : null}
        </div>
      </FormField>

      <FormField label="Notes (optional)" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm"
          placeholder="Additional payment details"
        />
      </FormField>

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full bg-brand-blue text-white hover:bg-brand-blue/90"
      >
        {isPending ? "Submitting..." : "Submit payment for verification"}
      </Button>
    </form>
  );
}

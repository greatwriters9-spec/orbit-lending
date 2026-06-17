"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui-kit/button";
import { requestWithdrawalAction } from "@/lib/wallet/actions";
import { formatCurrency } from "@/lib/loans/queries";
import {
  PATHWARD_BANK,
  WITHDRAWAL_METHOD_LABELS,
  type Wallet,
  type WithdrawalMethod,
} from "@/types/wallet";

type WithdrawalFormProps = {
  wallet: Wallet;
};

const METHODS: WithdrawalMethod[] = [
  "bank_transfer",
  "debit_card",
  "credit_card",
  "crypto",
  "other",
];

export function WithdrawalForm({ wallet }: WithdrawalFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WithdrawalMethod>("bank_transfer");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [notes, setNotes] = useState("");

  function buildDestinationDetails(): Record<string, string> {
    if (method === "bank_transfer") {
      return {
        accountName,
        accountNumber,
        routingNumber,
        bank: PATHWARD_BANK.name,
      };
    }
    if (method === "crypto") {
      return { walletAddress: accountNumber, network: accountName };
    }
    return { cardholderName: accountName, cardNumber: accountNumber };
  }

  function handleSubmit() {
    setFeedback(null);
    setError(null);

    startTransition(async () => {
      const result = await requestWithdrawalAction({
        amount: Number(amount),
        withdrawalMethod: method,
        destinationDetails: buildDestinationDetails(),
        notes: notes || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setFeedback(result.success ?? "Withdrawal request submitted.");
      router.refresh();
    });
  }

  return (
    <div className="card-surface p-6 md:p-8">
      <div className="mb-6">
        <h2 className="heading-secondary text-lg">
          Request Withdrawal
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Available balance:{" "}
          <span className="font-semibold text-brand-blue">
            {formatCurrency(wallet.availableBalance)}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {PATHWARD_BANK.tagline}
        </p>
      </div>

      {feedback ? (
        <div className="mb-4 rounded-lg border border-brand-success/30 bg-brand-success/5 px-4 py-3 text-sm text-brand-success">
          {feedback}
        </div>
      ) : null}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <Field label="Amount (USD)">
          <input
            type="number"
            min="1"
            step="0.01"
            max={wallet.availableBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-11 w-full rounded-lg border border-brand-border px-3 text-sm"
          />
        </Field>

        <Field label="Payment Method">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as WithdrawalMethod)}
            className="h-11 w-full rounded-lg border border-brand-border px-3 text-sm"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {WITHDRAWAL_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={
            method === "crypto"
              ? "Network"
              : method === "bank_transfer"
                ? "Account Holder Name"
                : "Cardholder Name"
          }
        >
          <input
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="h-11 w-full rounded-lg border border-brand-border px-3 text-sm"
          />
        </Field>

        <Field
          label={
            method === "crypto"
              ? "Wallet Address"
              : method === "bank_transfer"
                ? "Account Number"
                : "Card Number"
          }
        >
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="h-11 w-full rounded-lg border border-brand-border px-3 text-sm"
          />
        </Field>

        {method === "bank_transfer" ? (
          <Field label="Routing Number">
            <input
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              className="h-11 w-full rounded-lg border border-brand-border px-3 text-sm"
            />
          </Field>
        ) : null}

        <Field label="Notes (optional)">
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm"
          />
        </Field>

        <Button
          disabled={isPending || !amount || Number(amount) <= 0}
          onClick={handleSubmit}
          className="h-11 w-full bg-brand-navy text-white hover:bg-brand-navy/90"
        >
          {isPending ? "Submitting..." : "Submit Withdrawal Request"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Funds will move to pending balance until loan officer approval. Your funding
          account is not debited until the withdrawal is approved.
        </p>
      </div>
    </div>
  );
}

function Field({
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

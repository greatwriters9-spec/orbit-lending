"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Home, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { updateMortgageConfigAction } from "@/lib/admin/mortgage/actions";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { formatCurrency } from "@/lib/loans/queries";
import {
  DEFAULT_DOWN_PAYMENT_TIERS,
  downPaymentTierKey,
  getAvailableDownPaymentTiers,
  getStandardMortgageTerms,
  getTierRatesForTerm,
  minDownPaymentPercentFromConfig,
  type DownPaymentTierKey,
} from "@/types/mortgage-config";
import type { MortgageConfig, MortgageTermConfig } from "@/types/mortgage-config";

type MortgageManagementProps = {
  config: MortgageConfig;
};

function createTermId() {
  return `term-${Math.random().toString(36).slice(2, 8)}`;
}

export function MortgageManagement({ config }: MortgageManagementProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [draft, setDraft] = useState<MortgageConfig>(config);

  function update<K extends keyof MortgageConfig>(key: K, value: MortgageConfig[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateTerm(
    id: string,
    patch: Partial<MortgageTermConfig>,
  ) {
    setDraft((current) => ({
      ...current,
      terms: current.terms.map((term) =>
        term.id === id ? { ...term, ...patch } : term,
      ),
    }));
  }

  function setPrimaryTerm(id: string) {
    setDraft((current) => ({
      ...current,
      terms: current.terms.map((term) => ({
        ...term,
        isPrimary: term.id === id,
      })),
    }));
  }

  function updateTermTierRate(
    termId: string,
    tier: DownPaymentTierKey,
    interestRate: number,
  ) {
    setDraft((current) => ({
      ...current,
      terms: current.terms.map((term) => {
        if (term.id !== termId) {
          return term;
        }
        const tierRates = {
          ...getTierRatesForTerm(term),
          [tier]: interestRate,
        };
        return { ...term, tierRates };
      }),
    }));
  }

  function addTerm() {
    setDraft((current) => ({
      ...current,
      terms: [
        ...current.terms,
        {
          id: createTermId(),
          label: "New Fixed Term",
          termMonths: 240,
          interestRate: 6.5,
          isPrimary: current.terms.length === 0,
          tierRates: getTierRatesForTerm({
            id: "new",
            label: "New Fixed Term",
            termMonths: 240,
            interestRate: 6.5,
          }),
        },
      ],
    }));
  }

  function removeTerm(id: string) {
    setDraft((current) => {
      const remaining = current.terms.filter((term) => term.id !== id);
      if (remaining.length > 0 && !remaining.some((term) => term.isPrimary)) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      return { ...current, terms: remaining };
    });
  }

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("config", JSON.stringify(draft));
      const result = await updateMortgageConfigAction(formData);

      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }

      setFeedback({
        type: "success",
        message: result.success ?? "Mortgage settings saved.",
      });
      router.refresh();
    });
  }

  const minimumClientDownPayment = minDownPaymentPercentFromConfig(draft);
  const clientDownPaymentTiers = getAvailableDownPaymentTiers(draft);
  const clientTermOptions = getStandardMortgageTerms(draft);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeader
          title="Mortgage Management"
          description="Orbit offers a single mortgage product. Configure the loan-to-value (LTV), interest rates, and lending limits used across pre-qualification and client estimates."
        />
        <Link
          href="/get-started"
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-border bg-white px-4 text-sm font-semibold text-brand-navy hover:bg-brand-background"
        >
          <ExternalLink className="size-4" />
          View Client Flow
        </Link>
      </div>

      <div className="card-surface space-y-6 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
            <Home className="size-5" />
          </span>
          <div>
            <h2 className="heading-secondary text-lg">Mortgage Product</h2>
            <p className="text-sm text-muted-foreground">
              These details describe the mortgage clients apply for.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Product Name">
            <Input
              value={draft.productName}
              onChange={(e) => update("productName", e.target.value)}
              className="h-10"
            />
          </Field>
          <Field label="Status">
            <select
              value={draft.status}
              onChange={(e) =>
                update("status", e.target.value as MortgageConfig["status"])
              }
              className="h-10 w-full rounded-lg border border-brand-border bg-transparent px-3 text-sm"
            >
              <option value="active">Active — accepting applications</option>
              <option value="hidden">Hidden — not offered</option>
            </select>
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-brand-border bg-transparent px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="card-surface space-y-6 p-6 md:p-8">
        <div>
          <h2 className="heading-secondary text-lg">Loan-to-Value & Limits</h2>
          <p className="text-sm text-muted-foreground">
            Max LTV controls how much of the home price can be financed. The
            remainder sets the minimum down payment clients may choose during
            onboarding.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Max LTV (%)">
            <Input
              type="number"
              step="0.5"
              min={1}
              max={100}
              value={draft.maxLtv}
              onChange={(e) => update("maxLtv", Number(e.target.value))}
              className="h-10"
            />
          </Field>
          <Field label="Minimum Client Down Payment">
            <div className="flex h-10 items-center rounded-lg border border-dashed border-brand-border bg-brand-background/50 px-3 text-sm font-semibold text-brand-navy">
              {minimumClientDownPayment}%
            </div>
          </Field>
          <Field label="Client Down Payment Options">
            <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-dashed border-brand-border bg-brand-background/50 px-3 py-2 text-sm text-brand-navy">
              {clientDownPaymentTiers.map((tier) => (
                <span
                  key={tier}
                  className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold ring-1 ring-brand-border"
                >
                  {tier}%
                </span>
              ))}
            </div>
          </Field>
          <Field label="Min Loan Amount">
            <Input
              type="number"
              step="1000"
              min={0}
              value={draft.minLoanAmount}
              onChange={(e) => update("minLoanAmount", Number(e.target.value))}
              className="h-10"
            />
          </Field>
          <Field label="Max Loan Amount">
            <Input
              type="number"
              step="1000"
              min={0}
              value={draft.maxLoanAmount}
              onChange={(e) => update("maxLoanAmount", Number(e.target.value))}
              className="h-10"
            />
          </Field>
          <Field label="Range">
            <div className="flex h-10 items-center rounded-lg border border-dashed border-brand-border bg-brand-background/50 px-3 text-sm text-muted-foreground">
              {formatCurrency(draft.minLoanAmount)} –{" "}
              {formatCurrency(draft.maxLoanAmount)}
            </div>
          </Field>
        </div>
      </div>

      <div className="card-surface space-y-6 p-6 md:p-8">
        <div>
          <h2 className="heading-secondary text-lg">Client Rate Matrix</h2>
          <p className="text-sm text-muted-foreground">
            Set the interest rate for every term and down payment combination
            clients can choose. When a client selects 15 years at 5% down, the
            matching cell below drives their pre-qualification estimate.
          </p>
        </div>

        <div className="rounded-xl border border-brand-blue/15 bg-brand-blue/[0.04] px-4 py-3 text-sm text-brand-navy">
          <span className="font-semibold">Synced with Max LTV:</span> clients must
          put down at least{" "}
          <span className="font-semibold">{minimumClientDownPayment}%</span>.
          Down payment columns below that minimum are disabled and hidden from
          onboarding.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-brand-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Mortgage Term</th>
                {DEFAULT_DOWN_PAYMENT_TIERS.map((tier) => {
                  const available = clientDownPaymentTiers.includes(tier);
                  return (
                    <th
                      key={tier}
                      className={`px-3 py-2 font-semibold ${available ? "" : "opacity-40"}`}
                    >
                      {tier}% Down
                      {!available ? (
                        <span className="mt-0.5 block text-[10px] font-normal normal-case">
                          Below min
                        </span>
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {clientTermOptions.map((term) => {
                const tierRates = getTierRatesForTerm(term);
                return (
                  <tr key={`matrix-${term.id}`}>
                    <td className="px-3 py-3 font-semibold text-brand-navy">
                      {term.label}
                      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                        {term.termMonths} months
                      </span>
                    </td>
                    {DEFAULT_DOWN_PAYMENT_TIERS.map((tier) => {
                      const key = downPaymentTierKey(tier);
                      const available = clientDownPaymentTiers.includes(tier);
                      return (
                        <td key={`${term.id}-${tier}`} className="px-3 py-3">
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            max={100}
                            disabled={!available}
                            value={tierRates[key]}
                            onChange={(e) =>
                              updateTermTierRate(
                                term.id,
                                key,
                                Number(e.target.value),
                              )
                            }
                            className="h-9 w-24 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-brand-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-brand-navy">Term Labels</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit display names and mark the primary term used as a fallback for
              legacy applications without client preferences.
            </p>
          </div>
          <Button
            type="button"
            onClick={addTerm}
            className="h-10 border border-brand-border bg-white text-brand-navy hover:bg-brand-background"
          >
            <Plus className="size-4" />
            Add Term
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-brand-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Term Label</th>
                <th className="px-3 py-2 font-semibold">Length (months)</th>
                <th className="px-3 py-2 font-semibold">Base Rate (%)</th>
                <th className="px-3 py-2 font-semibold">Primary</th>
                <th className="px-3 py-2 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {draft.terms.map((term) => (
                <tr key={term.id}>
                  <td className="px-3 py-3">
                    <Input
                      value={term.label}
                      onChange={(e) =>
                        updateTerm(term.id, { label: e.target.value })
                      }
                      className="h-9"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      type="number"
                      min={1}
                      max={600}
                      value={term.termMonths}
                      onChange={(e) =>
                        updateTerm(term.id, {
                          termMonths: Number(e.target.value),
                        })
                      }
                      className="h-9 w-28"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      value={term.interestRate}
                      onChange={(e) =>
                        updateTerm(term.id, {
                          interestRate: Number(e.target.value),
                        })
                      }
                      className="h-9 w-28"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="radio"
                      name="primaryTerm"
                      checked={Boolean(term.isPrimary)}
                      onChange={() => setPrimaryTerm(term.id)}
                      className="size-4"
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeTerm(term.id)}
                      disabled={draft.terms.length <= 1}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-danger hover:text-brand-danger/80 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-brand-success/10 text-brand-success"
              : "bg-brand-danger/10 text-brand-danger"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-brand-border pt-6">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="h-10 bg-brand-navy text-white hover:bg-brand-navy/90"
        >
          {isPending ? "Saving..." : "Save Mortgage Settings"}
        </Button>
        <Button
          type="button"
          onClick={() => {
            setDraft(config);
            setFeedback(null);
          }}
          disabled={isPending}
          className="h-10 border border-brand-border bg-white text-brand-navy hover:bg-brand-background"
        >
          Reset
        </Button>
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
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-brand-navy">{label}</span>
      {children}
    </label>
  );
}

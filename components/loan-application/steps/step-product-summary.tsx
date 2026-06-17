"use client";

import { Badge } from "@/components/ui-kit/badge";
import { LoanRequirementsList } from "@/components/loans/loan-requirements-list";
import {
  formatApr,
  formatCurrency,
  getLowestApr,
} from "@/lib/loans/queries";
import { useWizard } from "@/components/loan-application/wizard-context";
import { WizardShell } from "@/components/loan-application/wizard-shell";

import { getCategoryLabel } from "@/lib/loans/category-config";

export function StepProductSummary() {
  const { product } = useWizard();
  const lowestApr = getLowestApr(product);

  return (
    <WizardShell
      title="Mortgage Summary"
      description="Review your mortgage details before configuring your application."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-brand-border bg-brand-background text-brand-navy">
            {getCategoryLabel(product.category)}
          </Badge>
          <Badge className="border-brand-blue/20 bg-brand-blue/10 text-brand-blue">
            {product.country}
          </Badge>
          {lowestApr > 0 ? (
            <Badge className="border-brand-success/20 bg-brand-success/10 text-brand-success">
              From {formatApr(lowestApr)}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-border bg-brand-background/60 p-4">
            <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              Product
            </p>
            <p className="mt-2 text-lg font-semibold text-brand-navy">
              {product.name}
            </p>
          </div>
          <div className="rounded-xl border border-brand-border bg-brand-background/60 p-4">
            <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
              Loan Range
            </p>
            <p className="mt-2 text-lg font-semibold text-brand-navy">
              {formatCurrency(product.minAmount)} –{" "}
              {formatCurrency(product.maxAmount)}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div>
          <h3 className="heading-secondary text-sm">
            Product Requirements Overview
          </h3>
          <div className="mt-4">
            <LoanRequirementsList requirements={product.requirements} />
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-4">
          <p className="text-sm font-medium text-brand-navy">
            Banking Infrastructure
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Powered by Pathward National Bank. Your application will be reviewed
            under enterprise lending standards.
          </p>
        </div>
      </div>
    </WizardShell>
  );
}

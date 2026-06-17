"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  activateProductAction,
  archiveProductAction,
  createProductAction,
  deactivateProductAction,
  draftProductAction,
  updateProductAction,
} from "@/lib/admin/products/actions";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import {
  LOAN_PRODUCT_STATUSES,
  LOAN_PRODUCT_STATUS_LABELS,
  type AdminLoanProduct,
} from "@/types/admin";
import { deriveProductRateDefaults } from "@/lib/admin/products/rate-defaults";

type ProductFormProps = {
  product?: AdminLoanProduct;
  mode: "create" | "edit";
  basePath?: string;
  defaultCategory?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  product,
  mode,
  basePath = "/admin/loan-products",
  defaultCategory,
}: ProductFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");

  function handleNameChange(value: string) {
    setName(value);
    if (mode === "create" && !product) {
      setSlug(slugify(value));
    }
  }

  const rateDefaults = deriveProductRateDefaults(product ?? null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(formData)
          : await updateProductAction(product!.id, formData);

      if (result.error) {
        setFeedback(result.error);
        return;
      }

      setFeedback(result.success ?? "Saved.");
      router.push(basePath);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="card-surface space-y-6 p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Product Name" required>
          <Input
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="h-10"
          />
        </Field>
        <Field label="Slug" required>
          <Input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="h-10 font-mono text-sm"
          />
        </Field>
        <Field label="Category" required>
          <select
            name="category"
            defaultValue={product?.category ?? defaultCategory ?? "personal"}
            className="h-10 w-full rounded-lg border border-brand-border bg-transparent px-3 text-sm"
          >
            <option value="personal">Fixed-Rate Mortgage</option>
            <option value="business">Investment Property Mortgage</option>
            <option value="asset_financing">Construction Financing</option>
            <option value="property">Mortgage Refinance</option>
            <option value="education">Home Equity Loan</option>
          </select>
        </Field>
        <Field label="Country" required>
          <Input
            name="country"
            defaultValue={product?.country ?? "US"}
            required
            className="h-10"
          />
        </Field>
      </div>

      <Field label="Description" required>
        <textarea
          name="description"
          defaultValue={product?.description}
          required
          rows={4}
          className="w-full rounded-lg border border-brand-border bg-transparent px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Eligibility Summary">
        <textarea
          name="eligibilitySummary"
          defaultValue={product?.eligibilitySummary ?? ""}
          rows={2}
          className="w-full rounded-lg border border-brand-border bg-transparent px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Min Amount" required>
          <Input
            name="minAmount"
            type="number"
            step="0.01"
            defaultValue={product?.minAmount ?? 1000}
            required
            className="h-10"
          />
        </Field>
        <Field label="Max Amount" required>
          <Input
            name="maxAmount"
            type="number"
            step="0.01"
            defaultValue={product?.maxAmount ?? 50000}
            required
            className="h-10"
          />
        </Field>
        <Field label="Default APR (%)" required>
          <Input
            name="defaultApr"
            type="number"
            step="0.01"
            defaultValue={rateDefaults.defaultApr}
            required
            className="h-10"
          />
        </Field>
        <Field label="Product Status" required>
          <select
            name="productStatus"
            defaultValue={product?.productStatus ?? "draft"}
            className="h-10 w-full rounded-lg border border-brand-border bg-transparent px-3 text-sm"
          >
            {LOAN_PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LOAN_PRODUCT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Min APR (%)" required>
          <Input
            name="minApr"
            type="number"
            step="0.01"
            defaultValue={rateDefaults.minApr}
            required
            className="h-10"
          />
        </Field>
        <Field label="Max APR (%)" required>
          <Input
            name="maxApr"
            type="number"
            step="0.01"
            defaultValue={rateDefaults.maxApr}
            required
            className="h-10"
          />
        </Field>
        <Field label="Min Term (months)" required>
          <Input
            name="minTerm"
            type="number"
            defaultValue={rateDefaults.minTerm}
            required
            className="h-10"
          />
        </Field>
        <Field label="Max Term (months)" required>
          <Input
            name="maxTerm"
            type="number"
            defaultValue={rateDefaults.maxTerm}
            required
            className="h-10"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-brand-navy">
          <input
            type="checkbox"
            name="weeklyRepaymentSupported"
            defaultChecked={product?.weeklyRepaymentSupported}
            className="size-4 rounded border-brand-border"
          />
          Weekly repayment supported
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-navy">
          <input
            type="checkbox"
            name="monthlyRepaymentSupported"
            defaultChecked={product?.monthlyRepaymentSupported ?? true}
            className="size-4 rounded border-brand-border"
          />
          Monthly repayment supported
        </label>
      </div>

      {feedback ? (
        <p className="text-sm text-muted-foreground">{feedback}</p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-brand-border pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 bg-brand-navy text-white hover:bg-brand-navy/90"
        >
          {isPending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
        <Button
          render={<Link href={basePath} />}
          className="h-10 border border-brand-border bg-white text-brand-navy"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-brand-navy">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

export function ProductStatusActions({ product }: { product: AdminLoanProduct }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ error?: string; success?: string }>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {product.productStatus !== "active" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => activateProductAction(product.id))}
          className="rounded-md bg-brand-success/10 px-2.5 py-1 text-xs font-semibold text-brand-success"
        >
          Activate
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => deactivateProductAction(product.id))}
          className="rounded-md bg-brand-warning/10 px-2.5 py-1 text-xs font-semibold text-brand-warning"
        >
          Deactivate
        </button>
      )}
      {product.productStatus !== "archived" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => archiveProductAction(product.id))}
          className="rounded-md bg-brand-danger/10 px-2.5 py-1 text-xs font-semibold text-brand-danger"
        >
          Archive
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => draftProductAction(product.id))}
          className="rounded-md bg-brand-background px-2.5 py-1 text-xs font-semibold text-brand-navy"
        >
          Restore to Draft
        </button>
      )}
    </div>
  );
}

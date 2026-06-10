"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { CategoryIllustrationEditor } from "@/components/admin/category-illustration-editor";
import {
  CategoryIllustrationFrame,
  CATEGORY_ILLUSTRATION_SPECS,
} from "@/components/loans/category-illustration-frame";
import { hasCustomIllustration } from "@/components/loans/category-illustrations";
import { Button } from "@/components/ui-kit/button";
import { Input } from "@/components/ui-kit/input";
import {
  setCategoryStatusAction,
  updateCategoryAction,
  updateIllustrationFramingAction,
} from "@/lib/admin/categories/actions";
import type { AdminCategoryMeta } from "@/lib/admin/categories/queries";
import { CATEGORY_ICON_OPTIONS } from "@/lib/loans/category-config";
import {
  DEFAULT_ILLUSTRATION_TRANSFORM,
  normalizeIllustrationTransform,
  type CategoryIllustrationTransform,
} from "@/lib/loans/category-illustration-transform";
import { getCategoryIcon } from "@/lib/loans/category-icons";
import { cn } from "@/lib/utils";
import type { LoanProductCategory } from "@/types/loans";

type CategoryFormProps = {
  category: AdminCategoryMeta;
  basePath?: string;
};

export function CategoryForm({
  category,
  basePath = "/admin/loan-products",
}: CategoryFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingFraming, setIsSavingFraming] = useState(false);
  const [illustrationUrl, setIllustrationUrl] = useState(
    category.illustrationUrl ?? "",
  );
  const [iconName, setIconName] = useState(category.iconName);
  const [illustrationTransform, setIllustrationTransform] =
    useState<CategoryIllustrationTransform>(() =>
      normalizeIllustrationTransform(category.illustrationTransform),
    );
  const Icon = getCategoryIcon(iconName);
  const customArt = hasCustomIllustration(illustrationUrl || null);

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("iconName", iconName);
    appendFramingFields(formData);

    startTransition(async () => {
      try {
        const result = await updateCategoryAction(
          category.category as LoanProductCategory,
          formData,
        );

        if (result.error) {
          setFeedback(result.error);
          return;
        }

        setFeedback(result.success ?? "Saved.");
        router.push(`${basePath}#admin-category-${category.category}`);
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "Unable to save category. Please try again.",
        );
      }
    });
  }

  async function handleSaveFraming() {
    const formData = new FormData();
    appendFramingFields(formData);

    setIsSavingFraming(true);
    setFeedback(null);

    try {
      const result = await updateIllustrationFramingAction(
        category.category as LoanProductCategory,
        formData,
      );

      if (result.error) {
        setFeedback(result.error);
        return;
      }

      setFeedback(result.success ?? "Illustration framing saved.");
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to save illustration framing.",
      );
    } finally {
      setIsSavingFraming(false);
    }
  }

  function appendFramingFields(formData: FormData) {
    formData.set("illustrationFocalX", String(illustrationTransform.focalX));
    formData.set("illustrationFocalY", String(illustrationTransform.focalY));
    formData.set("illustrationScale", String(illustrationTransform.scale));
  }

  async function handleUploadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("category", category.category);

    const file = formData.get("illustration");
    if (file instanceof File && file.size > 5 * 1024 * 1024) {
      setFeedback("Image must be 5 MB or smaller.");
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/category-illustrations", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        error?: string;
        success?: string;
        url?: string;
      };

      if (!response.ok || result.error) {
        setFeedback(result.error ?? "Upload failed. Please try again.");
        return;
      }

      if (result.url) {
        setIllustrationUrl(result.url);
        setIllustrationTransform(DEFAULT_ILLUSTRATION_TRANSFORM);
      }

      setFeedback(result.success ?? "Illustration uploaded.");
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleToggleActive() {
    startTransition(async () => {
      try {
        const result = await setCategoryStatusAction(
          category.category as LoanProductCategory,
          !category.active,
        );
        setFeedback(result.error ?? result.success ?? "Updated.");
        router.refresh();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : "Unable to update category status.",
        );
      }
    });
  }

  const busy = isPending || isUploading || isSavingFraming;

  return (
    <div className="space-y-6">
      <div className="card-surface overflow-hidden">
        <div className="grid md:grid-cols-2">
          {customArt ? (
            <div className="p-4 md:border-r md:border-brand-border md:p-5">
              <CategoryIllustrationEditor
                category={category.category}
                illustrationUrl={illustrationUrl}
                iconName={iconName}
                initialTransform={illustrationTransform}
                onTransformChange={setIllustrationTransform}
                disabled={busy}
              />
            </div>
          ) : (
            <CategoryIllustrationFrame
              category={category.category}
              illustrationUrl={illustrationUrl || null}
              iconName={iconName}
              variant="banner"
              illustrationTransform={illustrationTransform}
              className="md:rounded-none"
            />
          )}
          <div className="flex flex-col justify-center border-t border-brand-border p-6 md:border-t-0 md:p-8">
            <div className="flex items-center gap-3">
              {!customArt ? (
                <div className="flex size-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Icon className="size-5" />
                </div>
              ) : null}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Live Preview
                </p>
                <p className="font-semibold text-brand-navy">{category.label}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {category.description}
            </p>
            {customArt ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  disabled={busy}
                  onClick={handleSaveFraming}
                >
                  {isSavingFraming ? "Saving..." : "Save Framing"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {feedback ? (
        <p className="rounded-lg border border-brand-border bg-brand-background px-4 py-3 text-sm text-brand-navy">
          {feedback}
        </p>
      ) : null}

      <form
        onSubmit={handleDetailsSubmit}
        className="card-surface space-y-6 p-6 md:p-8"
      >
        <input
          type="hidden"
          name="illustrationFocalX"
          value={illustrationTransform.focalX}
        />
        <input
          type="hidden"
          name="illustrationFocalY"
          value={illustrationTransform.focalY}
        />
        <input
          type="hidden"
          name="illustrationScale"
          value={illustrationTransform.scale}
        />

        <div>
          <h3 className="heading-secondary text-lg">
            Category Details
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            These settings control how this category appears in the client product
            directory.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Category Key">
            <Input value={category.category} disabled readOnly />
          </Field>
          <Field label="Display Order" required>
            <Input
              name="sortOrder"
              type="number"
              min={0}
              max={99}
              defaultValue={category.sortOrder}
              required
            />
          </Field>
          <Field label="Category Title" required className="md:col-span-2">
            <Input name="label" defaultValue={category.label} required />
          </Field>
          <Field label="Category Description" required className="md:col-span-2">
            <textarea
              name="description"
              defaultValue={category.description}
              required
              rows={3}
              className="flex min-h-[96px] w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue/20"
            />
          </Field>
          <Field label="Illustration URL" className="md:col-span-2">
            <Input
              name="illustrationUrl"
              type="url"
              placeholder="https://..."
              defaultValue={category.illustrationUrl ?? ""}
            />
          </Field>
        </div>

        <div>
          <span className="mb-3 block text-sm font-medium text-brand-navy">
            Category Icon <span className="text-brand-danger">*</span>
          </span>
          <input type="hidden" name="iconName" value={iconName} />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {CATEGORY_ICON_OPTIONS.map((option) => {
              const OptionIcon = getCategoryIcon(option);
              const selected = iconName === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setIconName(option)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all",
                    selected
                      ? "border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm"
                      : "border-brand-border bg-white text-muted-foreground hover:border-brand-blue/30 hover:bg-brand-background",
                  )}
                >
                  <OptionIcon className="size-5" strokeWidth={1.75} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={category.active}
            className="size-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue/30"
          />
          <span className="font-medium text-brand-navy">
            Category active in product directory
          </span>
        </label>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {isPending ? "Saving..." : "Save Category"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleToggleActive}
          >
            {category.active ? "Deactivate Category" : "Activate Category"}
          </Button>
          <Link
            href={basePath}
            className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-brand-blue hover:text-brand-blue/80"
          >
            Back to Product Directory
          </Link>
        </div>
      </form>

      <form
        onSubmit={handleUploadSubmit}
        className="card-surface space-y-5 p-6 md:p-8"
      >
        <div>
          <h3 className="heading-secondary text-lg">
            Upload Illustration
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PNG, JPEG, WebP, or SVG illustration (max 5 MB). For best
            results, use a {CATEGORY_ILLUSTRATION_SPECS.label} image, then drag
            and zoom in the preview above to fine-tune framing.
          </p>
        </div>
        <Input
          name="illustration"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
        />
        <Button type="submit" variant="outline" disabled={busy}>
          {isUploading ? "Uploading..." : "Upload Illustration"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-brand-navy">
        {label}
        {required ? <span className="text-brand-danger"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

export { CategoryList } from "@/components/admin/category-list";

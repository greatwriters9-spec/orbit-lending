import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-brand-navy"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-brand-danger">{error}</p>
      ) : null}
    </div>
  );
}

export function FormMessage({
  message,
  variant = "error",
}: {
  message?: string;
  variant?: "error" | "success";
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variant === "error"
          ? "border-brand-danger/20 bg-brand-danger/5 text-brand-danger"
          : "border-brand-success/20 bg-brand-success/5 text-brand-success",
      )}
    >
      {message}
    </div>
  );
}

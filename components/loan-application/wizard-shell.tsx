import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type WizardShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function WizardShell({
  title,
  description,
  children,
  className,
}: WizardShellProps) {
  return (
    <section className={cn("card-surface overflow-hidden", className)}>
      <div className="border-b border-brand-border px-6 py-6 md:px-8 md:py-7">
        <h2 className="heading-secondary text-xl md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="px-6 py-6 md:px-8 md:py-8">{children}</div>
    </section>
  );
}

type WizardStepErrorProps = {
  message?: string;
};

export function WizardStepError({ message }: WizardStepErrorProps) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-lg border border-brand-danger/20 bg-brand-danger/5 px-4 py-3 text-sm text-brand-danger">
      {message}
    </div>
  );
}

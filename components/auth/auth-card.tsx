import type { ReactNode } from "react";
import Link from "next/link";
import { Landmark } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <div className="mb-8 flex flex-col items-center text-center">
        <Link
          href="/"
          className="mb-6 flex items-center gap-3 rounded-xl border border-brand-border bg-white px-4 py-3 shadow-[var(--shadow-card)]"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue text-white shadow-[var(--shadow-sidebar-active)]">
            <Landmark className="size-5" strokeWidth={1.75} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold tracking-tight text-brand-navy">
              Orbit Lending
            </p>
            <p className="text-[11px] font-medium text-muted-foreground uppercase">
              Secure Client Access
            </p>
          </div>
        </Link>
        <h1 className="heading-primary text-2xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="card-surface p-6 md:p-8">{children}</div>

      {footer ? (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

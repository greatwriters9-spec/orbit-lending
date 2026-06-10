import Link from "next/link";
import { Landmark } from "lucide-react";
import type { ReactNode } from "react";

import { AuthFormSideBackground } from "@/components/auth/auth-form-side-background";
import { cn } from "@/lib/utils";

type AuthFormPanelShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
  headingSpacing?: "default" | "relaxed";
};

export function AuthFormPanelShell({
  title,
  subtitle,
  children,
  footer,
  className,
  headingSpacing = "default",
}: AuthFormPanelShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#F8FAFC] px-6 py-12 md:px-10 md:py-14 lg:px-14 lg:py-16 xl:px-16",
        className,
      )}
    >
      <AuthFormSideBackground variant="form" />

      <div className="relative mx-auto w-full max-w-[720px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-3.5 rounded-xl border border-[#E5E7EB] bg-white/90 px-4 py-3.5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-shadow hover:shadow-[0_8px_32px_rgba(15,23,42,0.08)]"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-blue text-white shadow-[var(--shadow-sidebar-active)] ring-1 ring-brand-blue/10">
            <Landmark className="size-5" strokeWidth={1.75} />
          </div>
          <div className="text-left">
            <p className="text-[15px] font-bold tracking-tight text-brand-navy">
              Orbit Lending
            </p>
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Secure Client Access
            </p>
          </div>
        </Link>

        <div className={cn("mb-8", headingSpacing === "relaxed" && "mb-10")}>
          <h1 className="heading-primary text-[28px] leading-tight md:text-[32px] lg:text-[34px]">
            {title}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#4B5563] md:mt-4 md:text-[15px] md:leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-[0_8px_40px_rgba(15,23,42,0.06)] md:p-9 lg:p-10">
          {children}
        </div>

        <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white/90 px-5 py-4 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-sm">
          {footer}
        </div>
      </div>
    </div>
  );
}

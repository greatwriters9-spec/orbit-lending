import Link from "next/link";
import type { ReactNode } from "react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { PoweredByPathward } from "@/components/brand/powered-by-pathward";
import { AuthMortgageBackground } from "@/components/auth/auth-mortgage-background";
import { cn } from "@/lib/utils";

type AuthFormPanelShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  cardClassName?: string;
};

export function AuthFormPanelShell({
  title,
  subtitle,
  children,
  footer,
  className,
  cardClassName,
}: AuthFormPanelShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center px-4 py-12 md:px-6",
        className,
      )}
    >
      <AuthMortgageBackground />

      <div
        className={cn(
          "relative z-10 w-full max-w-[400px] rounded-md bg-white px-9 py-9 shadow-[0_8px_32px_rgba(15,23,42,0.14)] md:px-10 md:py-10",
          cardClassName,
        )}
      >
        <div className="mb-8 flex justify-center">
          <OrbitLogo href="/" />
        </div>

        {title ? (
          <div className="mb-6 text-center">
            <h1 className="text-base font-bold text-[#1f2937]">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{subtitle}</p>
            ) : null}
          </div>
        ) : null}

        {children}

        {footer ? (
          <div className="mt-6 text-center text-sm text-[#64748b]">{footer}</div>
        ) : null}

        <p className="mt-8 text-center text-[11px] text-[#9aa3af]">
          © {new Date().getFullYear()} Orbit Mortgage
        </p>

        <div className="mt-4 flex justify-center border-t border-[#e2e8f0] pt-4">
          <PoweredByPathward variant="auth" />
        </div>
      </div>
    </div>
  );
}

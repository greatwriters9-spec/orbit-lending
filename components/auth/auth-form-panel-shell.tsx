import Link from "next/link";
import type { ReactNode } from "react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { AuthMortgageBackground } from "@/components/auth/auth-mortgage-background";
import { cn } from "@/lib/utils";

type AuthFormPanelShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  cardClassName?: string;
  showLoginTabs?: boolean;
};

function AuthLoginTabs() {
  return (
    <div className="mb-7 flex gap-8 border-b border-[#dbe2ea]">
      <button
        type="button"
        className="-mb-px border-b-[3px] border-[#1e4db7] pb-2.5 text-sm font-semibold text-[#1e4db7]"
        aria-current="page"
      >
        Sign in with password
      </button>
      <button
        type="button"
        disabled
        className="-mb-px cursor-not-allowed border-b-[3px] border-transparent pb-2.5 text-sm font-medium text-[#8b95a5]"
        aria-disabled
      >
        Sign in with SSO
      </button>
    </div>
  );
}

export function AuthFormPanelShell({
  title,
  subtitle,
  children,
  footer,
  className,
  cardClassName,
  showLoginTabs = false,
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

        {showLoginTabs ? <AuthLoginTabs /> : null}

        {children}

        {footer ? (
          <div className="mt-6 text-center text-sm text-[#64748b]">{footer}</div>
        ) : null}

        <p className="mt-8 text-center text-[11px] text-[#9aa3af]">
          © {new Date().getFullYear()} Orbit Mortgage
        </p>
      </div>
    </div>
  );
}

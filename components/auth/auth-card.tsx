import type { ReactNode } from "react";

import { OrbitLogo } from "@/components/brand/orbit-logo";
import { PoweredByPathward } from "@/components/brand/powered-by-pathward";
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
    <div
      className={cn(
        "w-full max-w-[400px] rounded-md bg-white px-9 py-9 shadow-[0_8px_32px_rgba(15,23,42,0.14)] md:px-10 md:py-10",
        className,
      )}
    >
      <div className="mb-8 flex justify-center">
        <OrbitLogo href="/" />
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-base font-bold text-[#1f2937]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#64748b]">{description}</p>
      </div>

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
  );
}

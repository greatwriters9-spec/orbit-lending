import { Building2, Check } from "lucide-react";

import { AuthFormSideBackground } from "@/components/auth/auth-form-side-background";
import { RegisterTrustVisual } from "@/components/auth/register-trust-visual";
import { cn } from "@/lib/utils";

const benefits = [
  "Fast Pre-Qualification Process",
  "Secure Account Management",
  "Flexible Mortgage Payment Options",
  "Real-Time Application Tracking",
];

type AuthTrustPanelProps = {
  className?: string;
};

export function AuthTrustPanel({ className }: AuthTrustPanelProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 md:px-10 md:py-14 lg:px-12 lg:py-16",
        "bg-gradient-to-br from-[#1e293b] via-[#243b55] to-[#1e3a8a]/90",
        className,
      )}
    >
      <AuthFormSideBackground variant="trust" />

      <div
        className={cn(
          "relative w-full max-w-xl rounded-[28px] border border-white/12 bg-white/[0.07] p-8 shadow-[0_24px_64px_rgba(15,23,42,0.25)] backdrop-blur-xl",
          "md:p-10 lg:max-w-[520px] lg:p-11",
        )}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="heading-primary-light text-2xl leading-tight md:text-[1.65rem]">
              Home Financing Built Around Your Goals
            </h2>

            <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue/10 px-5 py-4">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-brand-blue/90 uppercase">
                Banking Infrastructure
              </p>
              <p className="mt-1.5 text-lg font-semibold leading-snug text-white">
                Powered by Pathward National Bank
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Trusted financial infrastructure supporting secure mortgage financing,
                account management, and compliance-driven operations.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                <Building2 className="size-3.5 shrink-0 text-brand-blue" strokeWidth={1.75} />
                Bank-grade security and encrypted data protection
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/55">
              Digital mortgage solutions with secure account access and clear
              visibility from pre-qualification through closing and repayment.
            </p>
          </div>

          <div className="grid items-center gap-6 lg:grid-cols-[1fr_200px] lg:gap-5">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue/25 text-brand-blue">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  <span className="text-white/80">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex justify-center lg:justify-end">
              <RegisterTrustVisual className="w-full max-w-[200px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

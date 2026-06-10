import {
  Building2,
  FileLock2,
  Fingerprint,
  Landmark,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { LANDING_TRUST_FEATURES, PATHWARD_BANK } from "@/lib/landing/content";

import { SectionHeading, SectionShell } from "./shared/section-shell";

const TRUST_ICONS = [Lock, FileLock2, Fingerprint, ShieldCheck, Lock, Building2] as const;

export function TrustInfrastructure() {
  return (
    <SectionShell tone="muted">
      <SectionHeading
        eyebrow="Security & Compliance"
        title="Trusted Financial Infrastructure"
        subtitle="Enterprise-grade protection and banking partnerships designed to earn and maintain borrower confidence."
      />

      <div className="mt-12 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-[#E5E7EB] bg-gradient-to-br from-brand-navy to-[#1a3270] p-8 lg:border-b-0 lg:border-r lg:border-[#ffffff15]">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Landmark className="size-7" strokeWidth={1.5} />
            </div>
            <h3 className="heading-primary-light mt-6 text-2xl md:text-3xl">
              Powered by {PATHWARD_BANK.name}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-white/65 md:text-base">
              {PATHWARD_BANK.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["256-bit Encryption", "SOC 2 Aligned", "KYC Verified", "FDIC Partner"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-white/75"
                  >
                    {badge}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 md:p-8">
            {LANDING_TRUST_FEATURES.map((feature, index) => {
              const Icon = TRUST_ICONS[index] ?? ShieldCheck;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-5"
                >
                  <Icon className="size-5 text-brand-blue" strokeWidth={1.75} />
                  <p className="mt-3 text-sm font-semibold text-brand-navy">
                    {feature.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

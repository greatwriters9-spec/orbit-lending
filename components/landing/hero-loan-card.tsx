import {
  Building2,
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { OrbitLogoMark } from "@/components/brand/orbit-logo";
import { LANDING_HERO_BADGES } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

export function HeroLoanCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative mx-auto w-full max-w-[34rem] scale-[1.17] md:scale-[1.18]", className)}
    >
      <div className="absolute -top-8 -right-8 size-36 rounded-full bg-brand-blue/[0.08] blur-3xl" />
      <div className="absolute -bottom-10 -left-10 size-44 rounded-full bg-brand-blue/[0.06] blur-3xl" />

      {LANDING_HERO_BADGES.map((badge) => (
        <div
          key={badge.label}
          className={cn(
            "absolute z-20 hidden rounded-xl border border-white/70 bg-white/85 px-3 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:block",
            badge.position,
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-brand-success" strokeWidth={2} />
            <span className="whitespace-nowrap text-[11px] font-semibold text-brand-navy">
              {badge.label}
            </span>
          </div>
        </div>
      ))}

      <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
        <div className="border-b border-[#E5E7EB] bg-gradient-to-br from-[#F8FAFC] to-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OrbitLogoMark size="sm" />
              <div>
                <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Orbit Mortgage
                </p>
                <p className="text-base font-semibold text-brand-navy">Mortgage Overview</p>
              </div>
            </div>
            <span className="rounded-full border border-brand-success/20 bg-brand-success/10 px-3 py-1 text-[11px] font-semibold text-brand-success">
              Pre-Qualified
            </span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-4">
            <StatPill icon={Wallet} label="Mortgage Amount" value="$385,000" />
            <StatPill icon={TrendingUp} label="Mortgage Rate" value="6.49%" />
          </div>

          <div className="rounded-xl border border-brand-blue/15 bg-gradient-to-br from-brand-blue/[0.05] to-brand-blue/[0.02] p-5">
            <p className="text-xs font-medium text-muted-foreground">
              Estimated Monthly Mortgage Payment
            </p>
            <p className="heading-primary mt-1.5 text-3xl tabular-nums">$798</p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full w-[72%] rounded-full bg-brand-blue transition-all duration-700" />
            </div>
            <p className="mt-2.5 text-[11px] text-muted-foreground">
              Application progress · 72% complete
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <MiniBadge icon={Clock} label="Fast Review" />
            <MiniBadge icon={Lock} label="Secure" />
            <MiniBadge icon={ShieldCheck} label="Verified" />
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] bg-[#F8FAFC]/80 px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="size-3.5 text-brand-blue" strokeWidth={1.75} />
            <span>Banking Infrastructure Powered by Pathward National Bank</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-brand-blue" strokeWidth={1.75} />
        <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1.5 text-base font-semibold tabular-nums text-brand-navy">{value}</p>
    </div>
  );
}

function MiniBadge({
  icon: Icon,
  label,
}: {
  icon: typeof Clock;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-2 py-2.5">
      <Icon className="size-4 text-brand-blue" strokeWidth={1.75} />
      <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}


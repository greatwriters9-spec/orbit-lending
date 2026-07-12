import {
  Building2,
  Lock,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { CompanyLogo } from "@/components/company/company-logo";
import { cn } from "@/lib/utils";

type RegisterTrustVisualProps = {
  className?: string;
};

export function RegisterTrustVisual({ className }: RegisterTrustVisualProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex aspect-[4/3] w-full items-center justify-center",
        className,
      )}
    >
      <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/4" />

      <div className="absolute inset-2.5 rounded-xl border border-brand-blue/20 bg-brand-blue/10" />

      <div className="relative flex w-full flex-col items-center gap-4 px-6 py-8">
        <CompanyLogo href={null} size="lg" showWordmark={false} className="shadow-[var(--shadow-sidebar-active)] ring-1 ring-white/15" />

        <div className="absolute top-6 right-8 flex size-12 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-navy/80 shadow-lg">
          <ShieldCheck className="size-6 text-brand-blue" strokeWidth={1.5} />
        </div>

        <div className="grid w-full max-w-[220px] grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/6 px-2 py-2.5">
            <ShieldCheck className="size-3.5 text-brand-success" strokeWidth={1.75} />
            <span className="text-[9px] font-medium text-white/55">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/6 px-2 py-2.5">
            <Building2 className="size-3.5 text-brand-blue" strokeWidth={1.75} />
            <span className="text-[9px] font-medium text-white/55">Banking</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-white/10 bg-white/6 px-2 py-2.5">
            <TrendingUp className="size-3.5 text-brand-blue" strokeWidth={1.75} />
            <span className="text-[9px] font-medium text-white/55">Track</span>
          </div>
        </div>

        <div className="flex w-full max-w-[220px] items-center gap-2 rounded-lg border border-white/10 bg-brand-navy/40 px-3 py-2">
          <Lock className="size-3.5 shrink-0 text-brand-success" strokeWidth={1.75} />
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-4/5 rounded-full bg-brand-blue/80" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -top-3 -right-3 size-20 rounded-full bg-brand-blue/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 size-24 rounded-full bg-brand-success/10 blur-2xl" />
    </div>
  );
}

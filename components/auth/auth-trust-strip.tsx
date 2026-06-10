import { Building2, FileCheck, Lock, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const TRUST_STRIP_ITEMS = [
  { icon: Lock, label: "256-Bit Encryption" },
  { icon: FileCheck, label: "Secure Document Storage" },
  { icon: ShieldCheck, label: "Identity Verification" },
  { icon: Building2, label: "Powered by Pathward National Bank" },
] as const;

type AuthTrustStripProps = {
  className?: string;
};

export function AuthTrustStrip({ className }: AuthTrustStripProps) {
  return (
    <div
      className={cn(
        "mt-6 rounded-xl border border-[#E5E7EB]/80 bg-[#F8FAFC]/80 px-4 py-4",
        className,
      )}
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRUST_STRIP_ITEMS.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center gap-2.5 text-[11px] font-medium leading-snug text-[#4B5563] md:text-xs"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue/[0.08] text-brand-blue">
              <Icon className="size-3.5" strokeWidth={1.75} />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

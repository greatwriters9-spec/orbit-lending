import { Building2 } from "lucide-react";

import { PATHWARD_BANK } from "@/lib/landing/content";
import { cn } from "@/lib/utils";

type PoweredByPathwardProps = {
  className?: string;
  variant?: "default" | "compact" | "auth" | "pill";
};

export function PoweredByPathward({
  className,
  variant = "default",
}: PoweredByPathwardProps) {
  const bankName = PATHWARD_BANK.name;

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-white/92 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm",
          className,
        )}
      >
        <Building2
          className="size-3.5 shrink-0 text-brand-blue/75"
          strokeWidth={1.75}
          aria-hidden
        />
        <span>
          Powered by{" "}
          <span className="font-semibold text-brand-navy/85">{bankName}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        variant === "compact" && "text-[10px] leading-none text-muted-foreground",
        variant === "auth" && "text-[11px] text-[#64748b]",
        variant === "default" && "text-xs text-muted-foreground",
        className,
      )}
    >
      <Building2
        className={cn(
          "shrink-0 text-brand-blue/70",
          variant === "compact" ? "size-3" : "size-3.5",
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      <span>
        Powered by{" "}
        <span
          className={cn(
            "font-semibold",
            variant === "auth" ? "text-[#334155]" : "text-brand-navy/80",
          )}
        >
          {bankName}
        </span>
      </span>
    </div>
  );
}

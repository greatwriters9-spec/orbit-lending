import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  trendTone?: "positive" | "neutral" | "warning";
  variant?: "featured" | "growth" | "warning" | "success" | "default";
  className?: string;
};

const trendToneClasses = {
  positive: "text-brand-success",
  neutral: "text-brand-blue",
  warning: "text-brand-warning",
} as const;

const variantStyles = {
  featured: {
    container:
      "border-brand-blue/20 bg-brand-navy shadow-[var(--shadow-elevated)]",
    title: "text-white/55",
    value: "text-white",
    description: "text-white/60",
    icon: "bg-brand-blue/20 text-white ring-white/10",
    glow: true,
  },
  growth: {
    container:
      "border-brand-success/20 bg-white shadow-[var(--shadow-card)]",
    title: "text-muted-foreground",
    value: "text-brand-navy",
    description: "text-muted-foreground",
    icon: "bg-brand-success/10 text-brand-success ring-brand-success/15",
    glow: false,
  },
  warning: {
    container:
      "border-brand-warning/25 bg-brand-warning/[0.03] shadow-[var(--shadow-card)]",
    title: "text-muted-foreground",
    value: "text-brand-navy",
    description: "text-muted-foreground",
    icon: "bg-brand-warning/10 text-brand-warning ring-brand-warning/15",
    glow: false,
  },
  success: {
    container:
      "border-brand-success/20 bg-brand-success/[0.03] shadow-[var(--shadow-card)]",
    title: "text-muted-foreground",
    value: "text-brand-navy",
    description: "text-muted-foreground",
    icon: "bg-brand-success/10 text-brand-success ring-brand-success/15",
    glow: false,
  },
  default: {
    container: "card-surface border-brand-border",
    title: "text-muted-foreground",
    value: "text-brand-navy",
    description: "text-muted-foreground",
    icon: "bg-brand-background text-brand-blue ring-brand-border/60",
    glow: false,
  },
} as const;

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendTone = "neutral",
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const isFeatured = variant === "featured";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-6 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)] md:p-7",
        styles.container,
        className,
      )}
    >
      {styles.glow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-brand-blue/10"
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[11px] font-semibold tracking-[0.06em] uppercase",
              styles.title,
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "mt-3 text-[28px] leading-none font-bold tracking-tight tabular-nums md:text-[32px]",
              styles.value,
            )}
          >
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl ring-1",
            styles.icon,
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      </div>

      <p
        className={cn(
          "relative mt-4 text-sm leading-relaxed",
          styles.description,
        )}
      >
        {description}
      </p>

      {trend ? (
        <div
          className={cn(
            "relative mt-3 flex items-center gap-1.5 text-xs font-semibold",
            isFeatured
              ? trendTone === "warning"
                ? "text-brand-warning"
                : trendTone === "positive"
                  ? "text-emerald-300"
                  : "text-blue-200"
              : trendToneClasses[trendTone],
          )}
        >
          {trendTone === "positive" ? (
            <TrendingUp className="size-3.5" strokeWidth={2.5} />
          ) : trendTone === "warning" ? (
            <TrendingDown className="size-3.5" strokeWidth={2.5} />
          ) : null}
          <span>{trend}</span>
        </div>
      ) : null}
    </div>
  );
}

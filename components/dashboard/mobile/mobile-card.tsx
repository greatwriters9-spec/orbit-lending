import { cn } from "@/lib/utils";

export function MobileCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "mobile-dash-card rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MobileSectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-lg font-semibold tracking-tight text-brand-navy", className)}>
      {children}
    </h2>
  );
}

export function MobileLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium text-brand-navy/55">{children}</p>
  );
}

export function MobileValue({
  children,
  large = false,
  className,
}: {
  children: React.ReactNode;
  large?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-bold tracking-tight text-brand-navy tabular-nums",
        large ? "text-[32px] leading-none" : "text-base",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function MobileProgressBar({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
      <div
        className="h-full rounded-full bg-brand-blue transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function MobileCircularProgress({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-[96px] shrink-0">
        <svg className="size-full -rotate-90" viewBox="0 0 96 96" aria-hidden>
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#2563EB"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-brand-navy">{clamped}%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-brand-navy/70">{label}</p>
    </div>
  );
}

import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";
type LogoVariant = "default" | "onDark";

const MARK_SIZES = {
  sm: {
    wrap: "size-8",
    block: "size-5",
    center: "size-2.5",
    blockRadius: "rounded-[2px]",
    centerRadius: "rounded-[1px]",
  },
  md: {
    wrap: "size-11",
    block: "size-7",
    center: "size-4",
    blockRadius: "rounded-[3px]",
    centerRadius: "rounded-[2px]",
  },
  lg: {
    wrap: "size-14",
    block: "size-9",
    center: "size-5",
    blockRadius: "rounded-[3px]",
    centerRadius: "rounded-[2px]",
  },
} as const;

const WORDMARK_SIZES = {
  sm: "text-base",
  md: "text-[22px]",
  lg: "text-2xl",
} as const;

type OrbitLogoMarkProps = {
  size?: LogoSize;
  className?: string;
};

export function OrbitLogoMark({ size = "md", className }: OrbitLogoMarkProps) {
  const mark = MARK_SIZES[size];

  return (
    <div className={cn("relative shrink-0", mark.wrap, className)}>
      <span
        className={cn(
          "absolute top-0 left-0 bg-[#1a4a96] shadow-sm",
          mark.block,
          mark.blockRadius,
        )}
      />
      <span
        className={cn(
          "absolute right-0 bottom-0 bg-[#3d7dd6] shadow-sm",
          mark.block,
          mark.blockRadius,
        )}
      />
      <span
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a2463]",
          mark.center,
          mark.centerRadius,
        )}
      />
    </div>
  );
}

type OrbitLogoProps = {
  size?: LogoSize;
  variant?: LogoVariant;
  href?: string | null;
  showWordmark?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function OrbitLogo({
  size = "md",
  variant = "default",
  href = "/",
  showWordmark = true,
  className,
  "aria-label": ariaLabel,
}: OrbitLogoProps) {
  const content = (
    <>
      <OrbitLogoMark size={size} />
      {showWordmark ? (
        <span
          className={cn(
            "font-bold tracking-tight",
            WORDMARK_SIZES[size],
            variant === "onDark" ? "text-white" : "text-[#1f2937]",
          )}
        >
          Orbit Mortgage
        </span>
      ) : null}
    </>
  );

  const rootClass = cn("inline-flex items-center gap-3", className);

  if (href) {
    return (
      <Link href={href} className={rootClass} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <span className={rootClass} aria-label={ariaLabel}>
      {content}
    </span>
  );
}

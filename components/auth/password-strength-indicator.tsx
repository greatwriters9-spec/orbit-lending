"use client";

import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  type PasswordStrengthLevel,
} from "@/lib/auth/input-formatters";
import { cn } from "@/lib/utils";

type PasswordStrengthIndicatorProps = {
  password: string;
  className?: string;
};

const strengthStyles: Record<
  Exclude<PasswordStrengthLevel, "empty">,
  { bar: string; text: string }
> = {
  weak: {
    bar: "bg-amber-500",
    text: "text-amber-700",
  },
  strong: {
    bar: "bg-brand-success",
    text: "text-brand-success",
  },
};

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  const activeStyle =
    strength === "empty" ? null : strengthStyles[strength];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((segment) => {
          const filled =
            strength === "strong"
              ? true
              : strength === "weak"
                ? segment === 0
                : false;

          return (
            <span
              key={segment}
              className={cn(
                "h-1.5 flex-1 rounded-full bg-[#E5E7EB] transition-colors duration-200",
                filled && activeStyle?.bar,
              )}
            />
          );
        })}
      </div>
      <p
        className={cn(
          "text-xs leading-relaxed text-muted-foreground",
          activeStyle?.text,
        )}
      >
        {label}
      </p>
    </div>
  );
}

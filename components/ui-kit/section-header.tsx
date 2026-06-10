import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  titleAs?: "h1" | "h2" | "h3";
  titleClassName?: string;
};

export function SectionHeader({
  title,
  description,
  action,
  className,
  titleAs: TitleTag = "h2",
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <TitleTag
          className={cn(
            "heading-secondary text-xl md:text-2xl",
            titleClassName,
          )}
        >
          {title}
        </TitleTag>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

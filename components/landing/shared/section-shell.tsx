import { cn } from "@/lib/utils";

import { LANDING_CONTAINER, LANDING_SECTION } from "@/lib/landing/content";

type SectionShellProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  tone?: "white" | "muted" | "navy";
};

const toneStyles = {
  white: "bg-white",
  muted: "bg-[#F8FAFC]",
  navy: "bg-brand-navy",
};

export function SectionShell({
  id,
  children,
  className,
  innerClassName,
  tone = "white",
}: SectionShellProps) {
  return (
    <section
      id={id}
      data-tone={tone}
      className={cn(LANDING_SECTION, "section-shell", toneStyles[tone], className)}
    >
      <div className={cn(LANDING_CONTAINER, innerClassName)}>{children}</div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  light = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "section-eyebrow text-xs font-semibold tracking-[0.1em] uppercase",
            light ? "text-white/50" : "text-brand-blue",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "heading-secondary mt-3 text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-tight",
          light && "heading-primary-light",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed md:text-lg",
            light ? "text-white/65" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

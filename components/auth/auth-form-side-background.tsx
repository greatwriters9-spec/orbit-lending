type AuthFormSideBackgroundProps = {
  variant?: "form" | "trust";
};

export function AuthFormSideBackground({
  variant = "form",
}: AuthFormSideBackgroundProps) {
  if (variant === "trust") {
    return (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-[#2563EB]/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 -left-24 size-96 rounded-full bg-[#3B82F6]/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-1/4 size-56 rounded-full bg-[#1E40AF]/15 blur-3xl"
        />
      </>
    );
  }

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-brand-blue/[0.05] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-0 size-80 rounded-full bg-brand-navy/[0.04] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 right-1/4 size-64 rounded-full bg-[#2563EB]/[0.03] blur-3xl"
      />
    </>
  );
}

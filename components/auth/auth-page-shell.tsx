import type { ReactNode } from "react";

import { AuthMortgageBackground } from "@/components/auth/auth-mortgage-background";
import { cn } from "@/lib/utils";

export function AuthPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center px-4 py-10 md:px-6",
        className,
      )}
    >
      <AuthMortgageBackground />
      <div className="relative w-full flex justify-center">{children}</div>
    </div>
  );
}

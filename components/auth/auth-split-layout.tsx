import type { ReactNode } from "react";

import { AuthTrustPanel } from "@/components/auth/auth-trust-panel";
import { cn } from "@/lib/utils";

type AuthSplitLayoutProps = {
  className?: string;
  formPanel: ReactNode;
  trustPanel?: ReactNode;
};

export function AuthSplitLayout({
  className,
  formPanel,
  trustPanel,
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen lg:grid lg:grid-cols-2 lg:items-stretch",
        className,
      )}
    >
      {formPanel}
      {trustPanel ?? <AuthTrustPanel />}
    </div>
  );
}

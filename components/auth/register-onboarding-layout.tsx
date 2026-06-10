import type { ReactNode } from "react";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { RegisterFormPanel } from "@/components/auth/register-form-panel";
import { cn } from "@/lib/utils";

type RegisterOnboardingLayoutProps = {
  className?: string;
  formPanel?: ReactNode;
};

export function RegisterOnboardingLayout({
  className,
  formPanel,
}: RegisterOnboardingLayoutProps) {
  return (
    <AuthSplitLayout
      className={cn(className)}
      formPanel={formPanel ?? <RegisterFormPanel />}
    />
  );
}

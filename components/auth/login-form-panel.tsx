import Link from "next/link";
import { Suspense } from "react";

import { AuthFormPanelShell } from "@/components/auth/auth-form-panel-shell";
import { LoginForm } from "@/components/auth/login-form";

type LoginFormPanelProps = {
  className?: string;
};

export function LoginFormPanel({ className }: LoginFormPanelProps) {
  return (
    <AuthFormPanelShell
      className={className}
      title="Sign In to Your Account"
      subtitle="Access your loans, wallet, and account activity securely."
      footer={
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-blue transition-colors hover:text-brand-blue/80"
          >
            Create one
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthFormPanelShell>
  );
}

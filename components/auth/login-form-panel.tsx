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
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-blue hover:text-brand-blue/80"
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

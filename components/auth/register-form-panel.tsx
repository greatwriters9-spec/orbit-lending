import Link from "next/link";

import { AuthFormPanelShell } from "@/components/auth/auth-form-panel-shell";
import { RegisterForm } from "@/components/auth/register-form";

type RegisterFormPanelProps = {
  className?: string;
};

export function RegisterFormPanel({ className }: RegisterFormPanelProps) {
  return (
    <AuthFormPanelShell
      className={className}
      title="Create Your Lending Account"
      subtitle="Apply for loans, manage applications, track repayments, and access your lending profile securely."
      headingSpacing="relaxed"
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-blue transition-colors hover:text-brand-blue/80"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthFormPanelShell>
  );
}

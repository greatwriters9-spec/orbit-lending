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
      cardClassName="max-w-[520px]"
      title="Create Your Account"
      subtitle="Get pre-qualified and manage your mortgage securely."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-blue hover:text-brand-blue/80"
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

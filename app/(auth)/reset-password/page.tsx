import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <AuthCard
        title="Set a new password"
        description="Choose a strong password to secure your account."
        footer={
          <>
            Return to{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-blue hover:text-brand-blue/80"
            >
              sign in
            </Link>
          </>
        }
      >
        <ResetPasswordForm />
      </AuthCard>
    </AuthPageShell>
  );
}

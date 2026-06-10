import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <AuthCard
        title="Reset your password"
        description="Enter your email and we'll send you a secure reset link."
        footer={
          <>
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-blue hover:text-brand-blue/80"
            >
              Back to sign in
            </Link>
          </>
        }
      >
        <ForgotPasswordForm />
      </AuthCard>
    </AuthPageShell>
  );
}

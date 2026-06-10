import type { Metadata } from "next";

import { RegisterOnboardingLayout } from "@/components/auth/register-onboarding-layout";

export const metadata: Metadata = {
  title: "Create Account | Orbit Lending",
};

export default function RegisterPage() {
  return <RegisterOnboardingLayout />;
}

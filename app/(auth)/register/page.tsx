import type { Metadata } from "next";

import { RegisterFormPanel } from "@/components/auth/register-form-panel";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return <RegisterFormPanel />;
}

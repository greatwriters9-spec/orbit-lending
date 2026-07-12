import type { Metadata } from "next";

import { LoginFormPanel } from "@/components/auth/login-form-panel";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return <LoginFormPanel />;
}

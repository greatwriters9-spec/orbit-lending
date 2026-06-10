import type { Metadata } from "next";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginFormPanel } from "@/components/auth/login-form-panel";

export const metadata: Metadata = {
  title: "Sign In | Orbit Lending",
};

export default function LoginPage() {
  return <AuthSplitLayout formPanel={<LoginFormPanel />} />;
}

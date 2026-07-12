import { Suspense } from "react";

import { CongratulationsPageClient } from "@/components/onboarding/congratulations-page-client";
import { getSessionUser } from "@/lib/auth/actions";

export const metadata = {
  title: "Congratulations",
  description: "Your estimated buying power is ready.",
};

export default async function CongratulationsPage() {
  const user = await getSessionUser();

  return (
    <Suspense fallback={null}>
      <CongratulationsPageClient isLoggedIn={Boolean(user)} />
    </Suspense>
  );
}

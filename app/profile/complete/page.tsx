import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ProfileCompletionForm } from "@/components/auth/profile-completion-form";
import { getProfileCompletionDefaults } from "@/lib/auth/profile-completion-defaults";
import { getProfile, isProfileComplete } from "@/lib/auth/profile";
import { getDefaultRouteForRole } from "@/lib/auth/roles";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { getSessionUser } from "@/lib/auth/actions";

export default async function ProfileCompletePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect(AUTH_ROUTES.login);
  }

  const profile = await getProfile(user.id);

  if (isProfileComplete(profile)) {
    redirect(getDefaultRouteForRole(profile?.role));
  }

  const defaults = await getProfileCompletionDefaults(user.id);

  return (
    <AuthPageShell className="items-start py-10 md:items-center">
      <AuthCard
        title="Confirm your details"
        description="We saved your answers from onboarding. Review everything below and confirm to continue."
        className="max-w-2xl"
      >
        <ProfileCompletionForm defaults={defaults} />
      </AuthCard>
    </AuthPageShell>
  );
}

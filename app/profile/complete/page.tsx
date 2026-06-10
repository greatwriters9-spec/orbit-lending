import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { ProfileCompletionForm } from "@/components/auth/profile-completion-form";
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-background px-4 py-10">
      <AuthCard
        title="Complete your profile"
        description="We need a few details before you can access your dashboard."
        className="max-w-2xl"
      >
        <ProfileCompletionForm profile={profile} />
      </AuthCard>
    </div>
  );
}

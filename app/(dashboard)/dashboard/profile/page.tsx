import { requireClient } from "@/lib/auth/guards";
import { ClientProfilePage } from "@/components/profile/client-profile-page";

export const metadata = {
  title: "Profile | Orbit Mortgage",
};

export default async function ProfilePage() {
  const ctx = await requireClient();

  if (!ctx.profile) {
    return null;
  }

  return (
    <ClientProfilePage profile={ctx.profile} email={ctx.user.email ?? ""} />
  );
}


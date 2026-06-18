import { GuestConcernsPanel } from "@/components/support/guest-concerns-panel";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { fetchGuestSupportConcerns } from "@/lib/support/guest-concern-queries";

export const metadata = {
  title: "Guest Concerns | Orbit Mortgage",
};

export default async function SuperAdminGuestConcernsPage() {
  await requireSuperAdmin();
  const concerns = await fetchGuestSupportConcerns();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Guest Concerns"
        description="Messages from unregistered visitors submitted via Ask Assistant during onboarding and other public flows."
      />
      <GuestConcernsPanel concerns={concerns} />
    </div>
  );
}

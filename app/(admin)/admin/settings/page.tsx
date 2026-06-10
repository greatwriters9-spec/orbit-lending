import { SectionHeader } from "@/components/ui-kit/section-header";

export const metadata = {
  title: "Settings | Orbit Lending",
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Settings"
        description="Configure platform-wide settings and preferences."
      />
      <div className="card-surface p-8 text-center text-sm text-muted-foreground">
        System settings interface coming in a future phase.
      </div>
    </div>
  );
}

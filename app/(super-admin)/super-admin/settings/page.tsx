import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchPlatformSettings, updatePlatformSettingFormAction } from "@/lib/admin/settings/actions";
import { hasAdminPermission } from "@/lib/admin/permissions";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { redirect } from "next/navigation";

export const metadata = {
  title: "System Configuration | Orbit Lending",
};

export default async function SuperAdminSettingsPage() {
  const ctx = await requireSuperAdmin();

  if (!hasAdminPermission(ctx.role, "settings:manage")) {
    redirect("/super-admin");
  }

  const settings = await fetchPlatformSettings();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Configuration"
        description="Institution-wide platform settings managed by the Chief Lending Officer."
      />

      <div className="space-y-4">
        {settings.map((setting) => (
          <form
            key={setting.key}
            action={updatePlatformSettingFormAction}
            className="card-surface space-y-4 p-6"
          >
            <div>
              <h3 className="text-sm font-semibold capitalize text-brand-navy">
                {setting.key.replace(/_/g, " ")}
              </h3>
              <p className="text-xs text-muted-foreground">
                Last updated {new Date(setting.updatedAt).toLocaleString()}
              </p>
            </div>
            <input type="hidden" name="key" value={setting.key} />
            <textarea
              name="value"
              defaultValue={JSON.stringify(setting.value, null, 2)}
              rows={6}
              className="w-full rounded-lg border border-brand-border bg-brand-background/40 px-3 py-2 font-mono text-xs"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white hover:bg-brand-navy/90"
            >
              Save {setting.key} settings
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

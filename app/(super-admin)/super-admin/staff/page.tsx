import { SectionHeader } from "@/components/ui-kit/section-header";
import { SUPPORTED_ROLES, USER_ROLES } from "@/lib/auth/roles";

export const metadata = {
  title: "Roles & Permissions | Orbit Lending",
};

export default function SuperAdminStaffPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Roles & Permissions"
        description="Assign roles via the profiles table in Supabase or seed scripts."
      />

      <div className="card-surface overflow-hidden">
        <div className="border-b border-brand-border px-6 py-4">
          <h3 className="text-sm font-semibold text-brand-navy">Supported Roles</h3>
        </div>
        <ul className="divide-y divide-brand-border">
          {SUPPORTED_ROLES.map((role) => (
            <li key={role} className="flex items-center justify-between px-6 py-4">
              <span className="font-mono text-sm text-brand-navy">{role}</span>
              <RoleDescription role={role} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RoleDescription({ role }: { role: string }) {
  const descriptions: Record<string, string> = {
    [USER_ROLES.client]: "Client dashboard and loan applications",
    [USER_ROLES.financeOfficer]:
      "Loan Officer portal — funding and withdrawals",
    [USER_ROLES.admin]: "Credit Manager portal + loan operations access",
    [USER_ROLES.superAdmin]: "Full lending institution control",
  };

  return (
    <span className="text-sm text-muted-foreground">
      {descriptions[role] ?? "—"}
    </span>
  );
}

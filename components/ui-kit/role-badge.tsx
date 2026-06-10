import { cva, type VariantProps } from "class-variance-authority";

import { getRoleLabel, USER_ROLES, type UserRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

const roleBadgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      role: {
        client: "border-brand-border bg-brand-background text-muted-foreground",
        finance_officer:
          "border-brand-blue/20 bg-brand-blue/10 text-brand-blue",
        admin: "border-brand-navy/20 bg-brand-navy/10 text-brand-navy",
        super_admin:
          "border-brand-warning/25 bg-brand-warning/10 text-brand-warning",
      },
    },
    defaultVariants: {
      role: "client",
    },
  },
);

const roleBadgeLabels: Record<UserRole, string> = {
  [USER_ROLES.client]: getRoleLabel(USER_ROLES.client),
  [USER_ROLES.financeOfficer]: getRoleLabel(USER_ROLES.financeOfficer),
  [USER_ROLES.admin]: getRoleLabel(USER_ROLES.admin),
  [USER_ROLES.superAdmin]: getRoleLabel(USER_ROLES.superAdmin),
};

type RoleBadgeProps = VariantProps<typeof roleBadgeVariants> & {
  role: UserRole | string;
  label?: string;
  className?: string;
};

function normalizeRole(role: string): UserRole {
  if (role === USER_ROLES.financeOfficer) return USER_ROLES.financeOfficer;
  if (role === USER_ROLES.admin) return USER_ROLES.admin;
  if (role === USER_ROLES.superAdmin) return USER_ROLES.superAdmin;
  return USER_ROLES.client;
}

export function RoleBadge({ role, label, className }: RoleBadgeProps) {
  const normalized = normalizeRole(role);

  return (
    <span className={cn(roleBadgeVariants({ role: normalized }), className)}>
      {label ?? roleBadgeLabels[normalized]}
    </span>
  );
}

export { roleBadgeLabels };

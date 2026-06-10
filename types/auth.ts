import type { UserRole } from "@/lib/auth/roles";

export type DashboardUser = {
  name: string;
  firstName: string;
  initials: string;
  avatarUrl: string | null;
  email: string;
  role: string;
  roleKey: UserRole;
  profileHref: string;
  homeHref: string;
};

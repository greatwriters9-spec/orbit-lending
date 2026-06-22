import {
  Banknote,
  Bell,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";

import type { NavSection } from "@/types/navigation";

export const superAdminNavSections: NavSection[] = [
  {
    items: [
      {
        title: "Chief Lending Officer Dashboard",
        href: "/super-admin",
        icon: LayoutDashboard,
      },
      { title: "Users", href: "/super-admin/users", icon: Users },
      {
        title: "Roles & Permissions",
        href: "/super-admin/staff",
        icon: Shield,
      },
      {
        title: "Mortgage Management",
        href: "/super-admin/loan-products",
        icon: Home,
      },
      {
        title: "Applications",
        href: "/super-admin/applications",
        icon: ClipboardList,
      },
      {
        title: "Guest Concerns",
        href: "/super-admin/guest-concerns",
        icon: MessageSquare,
      },
      {
        title: "Communications",
        href: "/super-admin/communications",
        icon: Mail,
      },
      {
        title: "Admin Alerts",
        href: "/super-admin/notifications",
        icon: Bell,
      },
      {
        title: "Compliance",
        href: "/super-admin/compliance",
        icon: ShieldCheck,
      },
      { title: "Reports", href: "/super-admin/reports", icon: FileText },
      {
        title: "Audit Logs",
        href: "/super-admin/audit-logs",
        icon: FileText,
      },
      {
        title: "System Configuration",
        href: "/super-admin/settings",
        icon: Settings,
      },
      {
        title: "Platform Management",
        href: "/super-admin/platform",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Mortgage Operations",
    items: [
      {
        title: "Loan Officer Dashboard",
        href: "/finance/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Applications Queue",
        href: "/finance/applications",
        icon: ClipboardList,
      },
      { title: "Funding Queue", href: "/finance/funding", icon: Banknote },
      {
        title: "Withdrawal Approvals",
        href: "/finance/withdrawals",
        icon: Wallet,
      },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Profile", href: "/super-admin/profile", icon: User }],
  },
];

export const SUPER_ADMIN_PORTAL = {
  title: "Orbit Mortgage",
  subtitle: "Chief Lending Officer Portal",
} as const;


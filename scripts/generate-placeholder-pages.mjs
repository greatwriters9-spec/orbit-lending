import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();

const pages = [
  ["app/(dashboard)/dashboard/repayments/page.tsx", "Repayments", "Track and manage your loan repayment schedule."],
  ["app/(dashboard)/dashboard/transactions/page.tsx", "Transactions", "View your complete transaction history."],
  ["app/(dashboard)/dashboard/messages/page.tsx", "Messages", "Application and account communications."],
  ["app/(dashboard)/dashboard/notifications/page.tsx", "Notifications", "Alerts and updates for your account."],
  ["app/(dashboard)/dashboard/documents/page.tsx", "Documents", "Uploaded documents and required files."],
  ["app/(dashboard)/dashboard/profile/page.tsx", "Profile", "Manage your personal and contact information."],
  ["app/(dashboard)/dashboard/support/page.tsx", "Support", "Get help with your account and applications."],
  ["app/(finance)/finance/loans/page.tsx", "Active Loans", "Monitor funded loans currently in servicing."],
  ["app/(finance)/finance/repayments/page.tsx", "Repayments", "Review repayment activity across active loans."],
  ["app/(finance)/finance/messages/page.tsx", "Messages", "Communicate with applicants and internal teams."],
  ["app/(finance)/finance/reports/page.tsx", "Reports", "Financial and operational reporting."],
  ["app/(finance)/finance/profile/page.tsx", "Profile", "Manage your finance officer profile."],
  ["app/(admin)/admin/loan-products/page.tsx", "Loan Products", "Configure and manage loan product catalog."],
  ["app/(admin)/admin/applications/page.tsx", "Applications", "Overview of all platform loan applications."],
  ["app/(admin)/admin/reports/page.tsx", "Reports", "Administrative reporting and analytics."],
  ["app/(admin)/admin/messages/page.tsx", "Messages", "Platform-wide messaging overview."],
  ["app/(admin)/admin/profile/page.tsx", "Profile", "Manage your administrator profile."],
  ["app/(super-admin)/super-admin/users/page.tsx", "Users", "Manage all platform user accounts."],
  ["app/(super-admin)/super-admin/loan-products/page.tsx", "Loan Products", "Platform loan product configuration."],
  ["app/(super-admin)/super-admin/applications/page.tsx", "Applications", "Global application oversight."],
  ["app/(super-admin)/super-admin/compliance/page.tsx", "Compliance", "Compliance monitoring and review workflows."],
  ["app/(super-admin)/super-admin/reports/page.tsx", "Reports", "Executive and platform-wide reports."],
  ["app/(super-admin)/super-admin/audit-logs/page.tsx", "Audit Logs", "Review platform audit trail and account events."],
  ["app/(super-admin)/super-admin/platform/page.tsx", "Platform Management", "Core platform administration and controls."],
  ["app/(super-admin)/super-admin/profile/page.tsx", "Profile", "Manage your super administrator profile."],
];

for (const [filePath, title, description] of pages) {
  const fullPath = join(root, filePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(
    fullPath,
    `import { PortalPlaceholder } from "@/components/layout/portal-placeholder";

export const metadata = {
  title: "${title} | Orbit Lending",
};

export default function Page() {
  return (
    <PortalPlaceholder
      title="${title}"
      description="${description}"
    />
  );
}
`,
    "utf8",
  );
}

console.log(`Created ${pages.length} placeholder pages.`);

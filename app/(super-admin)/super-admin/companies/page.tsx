import Link from "next/link";

import { listCompaniesAction } from "@/lib/company/actions";

export const metadata = {
  title: "Company Management",
};

export default async function CompaniesPage() {
  const companies = await listCompaniesAction();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-primary text-2xl md:text-3xl">Company Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Manage white-label mortgage companies, domains, branding, contact information,
            and social media from one shared platform.
          </p>
        </div>
        <Link
          href="/super-admin/companies/new"
          className="inline-flex h-11 items-center rounded-xl bg-brand-blue px-5 text-sm font-semibold text-white hover:bg-brand-blue/90"
        >
          Create Company
        </Link>
      </div>

      <div className="dashboard-card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="border-b border-brand-border bg-brand-background/60 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold text-brand-navy">Company</th>
              <th className="px-4 py-3 font-semibold text-brand-navy">Domain</th>
              <th className="px-4 py-3 font-semibold text-brand-navy">Status</th>
              <th className="px-4 py-3 font-semibold text-brand-navy">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b border-brand-border/70">
                <td className="px-4 py-4 font-medium text-brand-navy">{company.companyName}</td>
                <td className="px-4 py-4 text-muted-foreground">{company.domain}</td>
                <td className="px-4 py-4">
                  <span
                    className={
                      company.companyStatus === "active"
                        ? "rounded-full bg-brand-success/10 px-3 py-1 text-xs font-semibold text-brand-success"
                        : "rounded-full bg-brand-border/40 px-3 py-1 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {company.companyStatus}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Link href={`/super-admin/companies/${company.id}`} className="font-semibold text-brand-blue">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

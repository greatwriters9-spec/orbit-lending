import { notFound } from "next/navigation";

import { CompanyForm } from "@/components/admin/company-form";
import { getCompanyAction } from "@/lib/company/actions";

type PageProps = {
  params: Promise<{ companyId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { companyId } = await params;
  const company = await getCompanyAction(companyId);
  return {
    title: company ? `Edit ${company.companyName}` : "Edit Company",
  };
}

export default async function EditCompanyPage({ params }: PageProps) {
  const { companyId } = await params;
  const company = await getCompanyAction(companyId);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-primary text-2xl md:text-3xl">Edit {company.companyName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update branding, domain settings, contact details, and company content.
        </p>
      </div>
      <CompanyForm company={company} />
    </div>
  );
}

import { CompanyForm } from "@/components/admin/company-form";

export const metadata = {
  title: "Create Company",
};

export default function NewCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-primary text-2xl md:text-3xl">Create Company</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a new mortgage company to the platform without changing code.
        </p>
      </div>
      <CompanyForm />
    </div>
  );
}

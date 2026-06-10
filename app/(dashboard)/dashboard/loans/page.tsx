import Link from "next/link";
import { PlusCircle } from "lucide-react";

import {
  ApplicationListCard,
} from "@/components/applications";
import { Button } from "@/components/ui-kit/button";
import { SectionHeader } from "@/components/ui-kit/section-header";
import { fetchUserApplications } from "@/lib/applications/queries";

export const metadata = {
  title: "My Applications | Orbit Lending",
  description: "Track your loan applications, messages, documents, and offers.",
};

export default async function MyApplicationsPage() {
  const applications = await fetchUserApplications();

  return (
    <div className="space-y-8 md:space-y-9">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-brand-border bg-brand-navy px-6 py-8 text-white md:px-8">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            My Applications
          </p>
          <h1 className="heading-primary-light mt-2 text-3xl md:text-4xl">
            Track Your Loan Applications
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Monitor application progress, respond to officer messages, upload
            requested documents, and review financing offers.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          title="Submitted Applications"
          description={
            applications.length > 0
              ? `${applications.length} application${applications.length === 1 ? "" : "s"} in progress or completed.`
              : "You haven't submitted any applications yet."
          }
        />
        <Button
          className="h-10 shrink-0 bg-brand-blue px-4 text-white hover:bg-brand-blue/90"
          render={<Link href="/loans" />}
        >
          <PlusCircle className="size-4" />
          Apply for a Loan
        </Button>
      </div>

      {applications.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {applications.map((application) => (
            <ApplicationListCard
              key={application.id}
              application={application}
            />
          ))}
        </div>
      ) : (
        <div className="card-surface flex flex-col items-center px-6 py-16 text-center">
          <p className="text-lg font-semibold text-brand-navy">
            No applications yet
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Browse available loan products and start an application. Once
            submitted, you'll track progress here.
          </p>
          <Button
            className="mt-6 h-10 bg-brand-blue px-5 text-white hover:bg-brand-blue/90"
            render={<Link href="/loans" />}
          >
            Browse Loan Products
          </Button>
        </div>
      )}
    </div>
  );
}

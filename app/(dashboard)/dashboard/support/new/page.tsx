import Link from "next/link";

import { requireClient } from "@/lib/auth/guards";
import { CreateSupportTicketForm } from "@/components/support/create-support-ticket-form";
import type { SupportTicketCategory } from "@/types/support";

export const metadata = {
  title: "New Support Ticket | Orbit Mortgage",
};

export default async function NewSupportTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireClient();
  const params = await searchParams;
  const category = (params.category ?? "general_inquiry") as SupportTicketCategory;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/support" className="text-sm text-brand-blue hover:underline">
          ← Back to Support
        </Link>
        <h1 className="heading-primary mt-3 text-3xl">Open New Ticket</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit a support request and our team will respond promptly.
        </p>
      </div>
      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
        <CreateSupportTicketForm defaultCategory={category} />
      </section>
    </div>
  );
}


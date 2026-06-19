import Link from "next/link";

import { requireClient } from "@/lib/auth/guards";
import { OpenTicketFlow } from "@/components/support/open-ticket-flow";
import type { SupportTicketCategory } from "@/types/support";

export const metadata = {
  title: "Open Support Ticket | Orbit Mortgage",
};

export default async function NewSupportTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  await requireClient();
  const params = await searchParams;
  const category = params.category as SupportTicketCategory | undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/support" className="text-sm text-brand-blue hover:underline">
          ← Back to Support
        </Link>
        <h1 className="heading-primary mt-3 text-2xl font-bold text-brand-navy">
          Open a Ticket
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your issue and start a live chat with our support team.
        </p>
      </div>
      <section className="rounded-2xl border border-brand-border bg-white p-6 shadow-[var(--shadow-card)] md:p-8">
        <OpenTicketFlow initialCategory={category} />
      </section>
    </div>
  );
}

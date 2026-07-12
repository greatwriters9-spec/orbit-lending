import { MessageThreadsList } from "@/components/notifications/message-threads-list";
import { getSessionUser } from "@/lib/auth/actions";
import { getCompanyContext } from "@/lib/company/server";
import { fetchUserMessageThreads } from "@/lib/notifications/queries";
import { getLoanProductBySlug } from "@/lib/loans/mock-data";

export const metadata = {
  title: "Messages",
};

export default async function MessagesPage() {
  const user = await getSessionUser();
  const { branding } = await getCompanyContext();
  const threads = user ? await fetchUserMessageThreads(user.id) : [];

  const enriched = threads.map((thread) => ({
    ...thread,
    productName: getLoanProductBySlug(thread.productSlug)?.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-primary text-2xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Application communications with your {branding.institutionName} loan officer.
        </p>
      </div>
      <MessageThreadsList threads={enriched} />
    </div>
  );
}

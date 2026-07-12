import { requireClient } from "@/lib/auth/guards";
import { ClientDocumentsCenter } from "@/components/documents/client-documents-center";
import { fetchClientDocuments } from "@/lib/documents/queries";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const ctx = await requireClient();
  const documents = await fetchClientDocuments(ctx.user.id);

  return <ClientDocumentsCenter documents={documents} />;
}


import { notFound } from "next/navigation";

import { EmailPreviewStudio } from "@/components/dev/email-preview-studio";
import { EMAIL_TEMPLATE_LABELS } from "@/lib/email/templates/catalog";
import type { EmailTemplateKey } from "@/lib/email/types";

export const metadata = {
  title: "Email Preview | Orbit Mortgage",
};

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const templates = Object.entries(EMAIL_TEMPLATE_LABELS).map(([key, label]) => ({
    key: key as EmailTemplateKey,
    label,
  }));

  return <EmailPreviewStudio templates={templates} />;
}

import * as React from "react";

import {
  EmailBodyContent,
  EmailBrandHeader,
  EmailContactSection,
  EmailCtaBlock,
  EmailFooter,
  EmailInfoGrid,
  EmailMetaRow,
  EmailProgressTimeline,
  EmailShell,
} from "@/lib/email/react/components/shared";
import type { EmailTemplateContent } from "@/lib/email/react/types";

export function EmailLayout({
  preview,
  content,
}: {
  preview: string;
  content: EmailTemplateContent;
}) {
  return (
    <EmailShell preview={preview}>
      <EmailBrandHeader branding={content.branding} />
      <EmailMetaRow
        departmentName={content.departmentName ?? content.branding?.institutionName ?? "Mortgage Team"}
        referenceNumber={content.referenceNumber}
        dateLabel={content.dateLabel}
        badge={content.badge}
        tone={content.tone}
      />
      <EmailBodyContent headline={content.headline} body={content.body} />
      {content.showInfoGrid !== false && content.detailRows?.length ? (
        <EmailInfoGrid rows={content.detailRows} />
      ) : null}
      {content.showProgress !== false && content.progressSteps?.length ? (
        <EmailProgressTimeline steps={content.progressSteps} />
      ) : null}
      <EmailCtaBlock
        label={content.ctaLabel}
        url={content.ctaUrl}
        hint={
          content.ctaHint ??
          "Log in to your account to view complete mortgage details, documents, and transaction history."
        }
      />
      {content.showContact !== false ? (
        <EmailContactSection
          department={content.contactDepartment ?? content.departmentName ?? "Support Team"}
          email={content.contactEmail ?? content.branding?.supportEmail ?? ""}
          branding={content.branding}
        />
      ) : null}
      <EmailFooter branding={content.branding} />
    </EmailShell>
  );
}

import * as React from "react";

import {
  EmailBodyContent,
  EmailBrandHeader,
  EmailContactSection,
  EmailCtaBlock,
  EmailFooter,
  EmailInfoGrid,
  EmailMetaRow,
  EmailShell,
  EmailSignatureBlock,
} from "@/lib/email/react/components/shared";
import type { EmailTemplateContent } from "@/lib/email/react/types";

export function DepartmentLayout({
  preview,
  content,
}: {
  preview: string;
  content: EmailTemplateContent;
}) {
  return (
    <EmailShell preview={preview}>
      <EmailBrandHeader />
      <EmailMetaRow
        departmentName={content.departmentName ?? "Orbit Mortgage Department"}
        referenceNumber={content.referenceNumber}
        dateLabel={content.dateLabel}
        badge={content.badge}
        tone={content.tone}
      />
      <EmailBodyContent headline={content.headline} body={content.body} />
      {content.detailRows?.length ? <EmailInfoGrid rows={content.detailRows} title="Reference Information" /> : null}
      <EmailCtaBlock label={content.ctaLabel} url={content.ctaUrl} hint={content.ctaHint} />
      {content.staff ? <EmailSignatureBlock staff={content.staff} /> : null}
      <EmailContactSection
        department={content.contactDepartment ?? content.departmentName ?? "department"}
        email={content.contactEmail ?? content.staff?.email ?? "support@orbittmortgage.com"}
      />
      <EmailFooter />
    </EmailShell>
  );
}

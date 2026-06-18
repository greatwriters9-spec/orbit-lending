import { render } from "@react-email/render";
import * as React from "react";

import { DepartmentLayout } from "@/lib/email/react/layouts/department-layout";
import { EmailLayout } from "@/lib/email/react/layouts/email-layout";
import { ExecutiveLayout } from "@/lib/email/react/layouts/executive-layout";
import type { EmailTemplateContent } from "@/lib/email/react/types";
import type { EmailCommunicationClass, EmailTemplateKey } from "@/lib/email/types";

import { resolveTemplateCommunicationClass } from "@/lib/email/registry";

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function renderReactEmailTemplate(input: {
  template: EmailTemplateKey;
  preview: string;
  content: EmailTemplateContent;
  communicationClass?: EmailCommunicationClass;
}) {
  const communicationClass =
    input.communicationClass ??
    input.content.communicationClass ??
    resolveTemplateCommunicationClass(input.template);

  const props = { preview: input.preview, content: input.content };

  let element: React.ReactElement;
  switch (communicationClass) {
    case "department":
      element = React.createElement(DepartmentLayout, props);
      break;
    case "executive":
      element = React.createElement(ExecutiveLayout, props);
      break;
    case "automated":
    default:
      element = React.createElement(EmailLayout, props);
      break;
  }

  const html = await render(element);
  const text = stripHtml(
    [
      input.preview,
      input.content.headline,
      input.content.body,
      ...(input.content.detailRows?.map((row) => `${row.label}: ${row.value}`) ?? []),
      input.content.ctaLabel && input.content.ctaUrl
        ? `${input.content.ctaLabel}: ${input.content.ctaUrl}`
        : "",
      "—",
      "Orbit Mortgage",
      "Powered by Pathward National Bank",
    ]
      .filter(Boolean)
      .join("\n\n"),
  );

  return { html, text, communicationClass };
}
